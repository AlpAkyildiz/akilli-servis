'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@/lib/config';

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tripActive, setTripActive] = useState(false);
  const [tripSessionId] = useState<string>(() => `trip_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locationError, setLocationError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const [students, setStudents] = useState<any[]>([]);
  const [boardedIds, setBoardedIds] = useState<Set<number>>(new Set());
  const [historyBoardedIds, setHistoryBoardedIds] = useState<Set<number>>(new Set());
  const [loadingBoard, setLoadingBoard] = useState<number | null>(null);
  const [boardError, setBoardError] = useState('');

  // Atanmış araç/rota bilgisi
  const [myRoutes, setMyRoutes] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const userRef = useRef<any>(null);

  const getToken = () => localStorage.getItem('token');
  const authH = useCallback(() => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  }), []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/boarding/students`, { headers: authH() });
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error('fetchStudents network error:', e); }
  }, [authH]);

  const fetchMyRoutes = useCallback(async () => {
    try {
      setLoadingRoutes(true);
      const res = await fetch(`${API_URL}/api/routes/my`, { headers: authH() });
      if (res.ok) {
        const data = await res.json();
        setMyRoutes(data.routes || []);
      }
    } catch (e) {
      console.error('fetchMyRoutes error:', e);
    } finally {
      setLoadingRoutes(false);
    }
  }, [authH]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/login');
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'DRIVER') return router.push('/login');
    setUser(parsedUser);
    userRef.current = parsedUser;

    fetchStudents();
    fetchMyRoutes();

    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('authError', (d: any) => { alert(d.message); setTripActive(false); });

    return () => {
      socket.disconnect();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router, fetchStudents, fetchMyRoutes]);

  const startTrip = () => {
    // 1. KURAL: Araç/Rota atanmamışsa sefere başlama
    if (myRoutes.length === 0) {
      alert('Sefere başlamak için yöneticinin size bir araç ve rota ataması gerekmektedir.');
      return;
    }

    const tok = getToken();
    if (!tok || !socketRef.current || !userRef.current) return;
    setLocationError('');
    setBoardError('');

    socketRef.current.emit('driverStartTrip', { token: tok, name: userRef.current.name });
    setTripActive(true);

    if (!navigator.geolocation) {
      setLocationError('Cihazınız GPS desteklemiyor.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setCurrentLocation({ lat, lng });
        setAccuracy(Math.round(acc));
        setLocationError('');
        socketRef.current?.emit('driverLocation', { lat, lng });
      },
      (err) => {
        if (err.code === 1) setLocationError('IZIN_REDDEDILDI');
        else setLocationError('GPS hatası: ' + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    const start = Date.now();
    timerRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - start) / 1000)), 1000);
  };

  const endTrip = async () => {
    // 2. KURAL: Servisteki tüm öğrencileri bırakmadan seferi bitiremez
    if (boardedIds.size > 0) {
      alert(`🚫 Seferi bitiremezsiniz!\nServiste hala iniş yapmamış ${boardedIds.size} öğrenci var. Lütfen önce tüm öğrencileri indirin.`);
      return;
    }

    const notBoarded = students.filter(s => !historyBoardedIds.has(s.id));
    if (notBoarded.length > 0) {
      await Promise.all(notBoarded.map(s =>
        fetch(`${API_URL}/api/boarding/absent`, {
          method: 'POST',
          headers: authH(),
          body: JSON.stringify({ studentId: s.id, tripSessionId })
        }).catch(e => console.error('absent error:', e))
      ));
    }

    socketRef.current?.emit('driverEndTrip');
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTripActive(false);
    setCurrentLocation(null);
    setElapsedTime(0);
    setBoardedIds(new Set());
    setHistoryBoardedIds(new Set());

    if (notBoarded.length > 0) {
      alert(`Sefer tamamlandı.\n${notBoarded.length} öğrenci servise hiç binmedi — velilerine devamsızlık bildirimi gönderildi.`);
    } else {
      alert('Sefer başarıyla tamamlandı!');
    }
  };

  const toggleBoard = async (student: any) => {
    if (!tripActive) return;
    const alreadyBoarded = boardedIds.has(student.id);
    setLoadingBoard(student.id);
    setBoardError('');

    const endpoint = alreadyBoarded ? 'dropoff' : 'board';

    try {
      const res = await fetch(`${API_URL}/api/boarding/${endpoint}`, {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ studentId: student.id, tripSessionId })
      });

      const data = await res.json();

      if (!res.ok) {
        setBoardError(`Hata: ${data.error || 'İşlem başarısız'} (${data.detail || ''})`);
      } else {
        setBoardedIds(prev => {
          const next = new Set(prev);
          alreadyBoarded ? next.delete(student.id) : next.add(student.id);
          return next;
        });
        if (!alreadyBoarded) {
          setHistoryBoardedIds(prev => {
            const next = new Set(prev);
            next.add(student.id);
            return next;
          });
        }
        socketRef.current?.emit('boardingUpdate', {
          studentId: student.id,
          type: alreadyBoarded ? 'DROPPED_OFF' : 'BOARDED',
        });
      }
    } catch (e: any) {
      setBoardError(`Ağ hatası: ${e.message}`);
    } finally {
      setLoadingBoard(null);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasAssignedRoute = myRoutes.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 text-xl">🚌</div>
          <div>
            <h1 className="font-bold text-base">Şoför Paneli</h1>
            <p className="text-slate-400 text-xs">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tripActive && <span className="font-mono text-yellow-400 font-bold">{formatTime(elapsedTime)}</span>}
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-sm bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500/30 px-4 py-2 rounded-lg transition-colors font-medium">
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Atanmış Rota / Araç Bilgisi */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 space-y-2">
          <h2 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Atanmış Görev Bilgisi</h2>
          {loadingRoutes ? (
            <p className="text-xs text-slate-500 animate-pulse">Görev bilgileri yükleniyor...</p>
          ) : hasAssignedRoute ? (
            myRoutes.map(r => (
              <div key={r.id} className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600/50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-yellow-400">{r.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{r.startPoint || '-'} ➔ {r.endPoint || '-'}</p>
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-xl border border-slate-600 text-center">
                  <p className="text-[10px] text-slate-400">ARAÇ PLAKASI</p>
                  <p className="font-mono font-bold text-sm text-white uppercase">{r.vehicle?.licensePlate || 'ATANMADI'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 text-center space-y-2">
              <p className="text-red-400 font-bold text-sm">🚫 Aracınız ve Rotanız Bulunmuyor</p>
              <p className="text-slate-400 text-xs">Sefere başlayabilmek için sistem yöneticisinin (Admin) size bir araç ve rota ataması yapması gerekmektedir.</p>
            </div>
          )}
        </div>

        {/* Sefer Durumu */}
        <div className={`rounded-3xl p-5 border transition-all ${tripActive ? 'bg-green-900/30 border-green-500/40' : 'bg-slate-800 border-slate-700'}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold">{tripActive ? '🟢 Sefer Devam Ediyor' : '⚪ Sefer Başlamadı'}</h2>
            {tripActive && <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Yayınlanıyor</span>}
          </div>

          {tripActive && currentLocation && (
            <div className="grid grid-cols-2 gap-2 text-center mt-3">
              <div className="bg-slate-800/80 rounded-xl p-2">
                <div className="text-xs text-slate-400">Enlem</div>
                <div className="font-mono text-sm font-bold">{currentLocation.lat.toFixed(5)}</div>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-2">
                <div className="text-xs text-slate-400">Boylam</div>
                <div className="font-mono text-sm font-bold">{currentLocation.lng.toFixed(5)}</div>
              </div>
            </div>
          )}
          {tripActive && !currentLocation && (
            <p className="text-slate-400 text-sm text-center mt-2 animate-pulse">📡 GPS sinyali bekleniyor...</p>
          )}
          {!tripActive && (
            <p className="text-slate-400 text-sm mt-1">Sefere başladığınızda GPS konumunuz velilere anlık iletilir.</p>
          )}
          {accuracy !== null && tripActive && (
            <p className="text-xs text-center mt-2 text-slate-500">GPS hassasiyet: <span className={accuracy < 20 ? 'text-green-400' : accuracy < 50 ? 'text-yellow-400' : 'text-red-400'}>±{accuracy}m</span></p>
          )}
        </div>

        {/* GPS Hata */}
        {locationError === 'IZIN_REDDEDILDI' && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-4 space-y-2">
            <p className="text-red-400 font-bold">🚫 Konum İzni Reddedildi</p>
            <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
              <li>Adres çubuğundaki 🔒 kilit ikonuna tıklayın</li>
              <li>"Konum" → "İzin ver" yapın ve F5 ile yenileyin</li>
            </ol>
          </div>
        )}
        {locationError && locationError !== 'IZIN_REDDEDILDI' && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-3 text-red-400 text-sm text-center">{locationError}</div>
        )}

        {/* Board Error */}
        {boardError && (
          <div className="bg-orange-900/30 border border-orange-500/40 rounded-2xl p-3 text-orange-400 text-sm">
            ⚠️ {boardError}
          </div>
        )}

        {/* Sefer Başlat / Bitir */}
        {!tripActive ? (
          <button 
            onClick={startTrip} 
            disabled={!hasAssignedRoute || loadingRoutes}
            className={`w-full py-5 rounded-3xl font-bold text-xl transition-all shadow-xl ${
              !hasAssignedRoute || loadingRoutes
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-green-500 hover:bg-green-400 active:scale-95 text-white shadow-green-500/30'
            }`}
          >
            🚌 Sefere Başla
          </button>
        ) : (
          <button onClick={endTrip} className="w-full py-5 rounded-3xl font-bold text-lg bg-red-500 hover:bg-red-400 active:scale-95 text-white shadow-xl shadow-red-500/30 transition-all">
            🏁 Seferi Bitir ({boardedIds.size}/{students.length} öğrenci serviste)
          </button>
        )}

        {/* Öğrenci Listesi */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold">Öğrenci Listesi</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{boardedIds.size} serviste / {students.length} toplam</span>
              <button onClick={fetchStudents} className="text-slate-400 hover:text-white transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {!tripActive && hasAssignedRoute && (
            <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs text-center">
              Öğrenci işaretlemek için önce sefere başlayın
            </div>
          )}

          <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
            {students.length === 0 ? (
              <p className="p-8 text-center text-slate-500 text-sm">Onaylı öğrenci bulunamadı.</p>
            ) : students.map(s => {
              const isBoarded = boardedIds.has(s.id);
              const isLoading = loadingBoard === s.id;
              return (
                <div key={s.id} className={`p-4 flex items-center gap-3 transition-colors ${isBoarded ? 'bg-green-900/20' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${isBoarded ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {isBoarded ? '✓' : s.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.schoolName} • {s.parent?.user?.name || '-'}</p>
                  </div>
                  <button
                    onClick={() => toggleBoard(s)}
                    disabled={!tripActive || isLoading}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all min-w-[52px] ${
                      !tripActive
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : isLoading
                        ? 'bg-slate-600 text-slate-300 animate-pulse cursor-wait'
                        : isBoarded
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 active:scale-95'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/40 active:scale-95'
                    }`}
                  >
                    {isLoading ? '...' : isBoarded ? 'İndir' : 'Al'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
