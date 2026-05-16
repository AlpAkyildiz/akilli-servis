'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('../../components/LiveMap'), { ssr: false });

export default function TrackingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<Record<number, string | null>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
  const [watchingDriver, setWatchingDriver] = useState<any | null>(null);
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [tripActive, setTripActive] = useState(false);
  const [tab, setTab] = useState<'map' | 'students' | 'notifications'>('map');
  const [refreshing, setRefreshing] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  const getToken = () => localStorage.getItem('token');
  const authH = useCallback(() => ({ 'Authorization': `Bearer ${getToken()}` }), []);

  const fetchStudentStatuses = useCallback(async (studentList: any[]) => {
    const statuses: Record<number, string | null> = {};
    await Promise.all(
      studentList.map(async (s) => {
        try {
          const r = await fetch(`http://localhost:5000/api/boarding/status/${s.id}`, { headers: authH() });
          if (r.ok) {
            const st = await r.json();
            statuses[s.id] = st.latestStatus;
          }
        } catch { /* ignore */ }
      })
    );
    setStudentStatuses(statuses);
  }, [authH]);

  const fetchStudents = useCallback(async () => {
    const res = await fetch('http://localhost:5000/api/students', { headers: authH() });
    if (res.ok) {
      const data = await res.json();
      const approved = data.filter((s: any) => s.status === 'APPROVED');
      setStudents(approved);
      await fetchStudentStatuses(approved);
    }
  }, [authH, fetchStudentStatuses]);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch('http://localhost:5000/api/boarding/notifications', { headers: authH() });
    if (res.ok) setNotifications(await res.json());
  }, [authH]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStudents(), fetchNotifications()]);
    // Ayrıca socket'ten aktif şoförleri de iste
    socketRef.current?.emit('getActiveDrivers');
    setRefreshing(false);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/login');
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'PARENT') return router.push('/login');
    setUser(parsedUser);

    fetchStudents();
    fetchNotifications();

    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('getActiveDrivers'));
    socket.on('activeDriversList', (list: any[]) => setActiveDrivers(list));
    socket.on('driverOnline', (data: any) => {
      setActiveDrivers(prev =>
        prev.find(d => d.driverId === data.driverId) ? prev : [...prev, { ...data, lat: 0, lng: 0 }]
      );
    });
    socket.on('driverOffline', (data: any) => {
      setActiveDrivers(prev => prev.filter(d => d.driverId !== data.driverId));
      if (watchingDriver?.driverId === data.driverId) {
        setTripActive(false); setBusLocation(null); setWatchingDriver(null);
      }
      // Sefer bitince bildirimleri ve öğrenci durumunu güncelle
      fetchNotifications();
      fetchStudents();
    });
    socket.on('busLocation', (data: any) => {
      setBusLocation({ lat: data.lat, lng: data.lng });
      setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
      setTripActive(true);
    });
    // Öğrenci binince gerçek zamanlı durum güncellemesi
    socket.on('studentStatusChanged', () => {
      fetchStudents();
    });

    return () => { socket.disconnect(); };
  }, [router]);

  // Her 30 saniyede bir otomatik yenile
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStudents();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStudents, fetchNotifications]);

  const startWatching = (driver: any) => {
    setWatchingDriver(driver);
    setBusLocation(null);
    setTripActive(false);
    socketRef.current?.emit('watchDriver', driver.driverId);
  };

  const stopWatching = () => {
    setWatchingDriver(null);
    setBusLocation(null);
    setTripActive(false);
    setLastUpdate('');
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white px-4 py-4 flex items-center gap-3 shadow-lg sticky top-0 z-20">
        <button onClick={watchingDriver ? stopWatching : () => router.push('/parent')} className="text-blue-200 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">{watchingDriver ? `🚌 ${watchingDriver.name}` : 'Canlı Takip'}</h1>
          <p className="text-blue-300 text-xs">
            {watchingDriver
              ? (tripActive ? `Son güncelleme: ${lastUpdate}` : 'Konum bekleniyor...')
              : 'Servis ve öğrenci durumu'}
          </p>
        </div>
        {!watchingDriver && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-blue-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            title="Yenile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        {watchingDriver && (
          <button onClick={stopWatching} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Geri</button>
        )}
      </header>

      {watchingDriver ? (
        /* HARİTA EKRANI */
        <div className="flex-1 flex flex-col">
          <LiveMap busLocation={busLocation} />
          <div className="bg-white border-t border-slate-100 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tripActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="font-bold text-slate-800 text-sm">{tripActive ? 'Servis Yolda' : 'Konum Bekleniyor...'}</span>
              </div>
              <span className="text-xs text-slate-400">{watchingDriver.name}</span>
            </div>
            {busLocation ? (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2">
                  <div className="text-xs text-slate-400">Enlem</div>
                  <div className="font-mono text-sm font-bold text-slate-700">{busLocation.lat.toFixed(5)}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <div className="text-xs text-slate-400">Boylam</div>
                  <div className="font-mono text-sm font-bold text-slate-700">{busLocation.lng.toFixed(5)}</div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 text-sm py-2 animate-pulse">📡 GPS sinyali bekleniyor...</p>
            )}
          </div>
        </div>
      ) : (
        /* ANA EKRAN */
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-white border-b border-slate-200 flex sticky top-[72px] z-10">
            {([
              ['map', '🗺️ Servisler'],
              ['students', '🎒 Öğrenciler'],
              ['notifications', `🔔 Bildirimler${unreadCount > 0 ? ` (${unreadCount})` : ''}`],
            ] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* SERVİSLER */}
            {tab === 'map' && (
              <>
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-slate-800">Aktif Servisler</h2>
                  <p className="text-slate-500 text-sm mt-1">Şu an yolda olan araçlar</p>
                </div>
                {activeDrivers.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
                    <div className="text-5xl mb-4">🚌</div>
                    <h3 className="font-bold text-slate-700 mb-1">Aktif Servis Yok</h3>
                    <p className="text-slate-400 text-sm">Şoförünüz sefere başladığında burada görünecektir.</p>
                    <button onClick={() => socketRef.current?.emit('getActiveDrivers')} className="mt-4 text-blue-600 text-sm font-medium hover:underline">Yenile</button>
                  </div>
                ) : activeDrivers.map(driver => (
                  <button key={driver.driverId} onClick={() => startWatching(driver)}
                    className="w-full bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-left flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">🚌</div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{driver.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-600 text-xs font-medium">Aktif — Yolda</span>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </>
            )}

            {/* ÖĞRENCİLER */}
            {tab === 'students' && (
              <>
                {students.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                    <p className="text-slate-400">Onaylı öğrenci bulunmuyor.</p>
                  </div>
                ) : students.map(s => {
                  const status = studentStatuses[s.id];
                  return (
                    <div key={s.id} className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4 ${
                      status === 'ABSENT' ? 'border-red-200 bg-red-50' :
                      status === 'BOARDED' ? 'border-green-200 bg-green-50' :
                      'border-slate-200'
                    }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                        status === 'BOARDED' ? 'bg-green-500 text-white' :
                        status === 'ABSENT' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {status === 'BOARDED' ? '✓' : s.name.substring(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500 truncate">{s.schoolName}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {status === 'BOARDED' && <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">🚌 Serviste</span>}
                        {status === 'DROPPED_OFF' && <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">✅ İndirildi</span>}
                        {status === 'ABSENT' && <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">⚠️ Binmedi</span>}
                        {!status && <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Bilgi Yok</span>}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* BİLDİRİMLER */}
            {tab === 'notifications' && (
              <>
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                    <div className="text-4xl mb-3">🔔</div>
                    <p className="text-slate-400">Henüz bildirim yok.</p>
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} className={`rounded-2xl p-4 border ${n.status === 'UNREAD' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
                    <p className={`text-sm font-medium ${n.status === 'UNREAD' ? 'text-orange-800' : 'text-slate-700'}`}>{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
