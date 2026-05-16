'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

type View = 'dashboard' | 'students' | 'drivers';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<View>('dashboard');
  const [students, setStudents] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Modal states
  const [modal, setModal] = useState<'driver'|'vehicle'|'route'|null>(null);
  const [driverForm, setDriverForm] = useState({ name:'', email:'', password:'', phone:'', licenseNumber:'' });
  const [vehicleForm, setVehicleForm] = useState({ licensePlate:'', capacity:'', model:'' });
  const [routeForm, setRouteForm] = useState({ name:'', startPoint:'', endPoint:'', driverId:'', vehicleId:'' });
  const [formStatus, setFormStatus] = useState({ loading:false, error:'', success:'' });

  const token = () => localStorage.getItem('token');
  const authHeader = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const fetchAll = useCallback(async () => {
    const [sRes, dRes, vRes, rRes] = await Promise.all([
      fetch(`${API_URL}/api/students`, { headers: authHeader() }),
      fetch(`${API_URL}/api/auth/staff/drivers`, { headers: authHeader() }),
      fetch(`${API_URL}/api/vehicles`, { headers: authHeader() }),
      fetch(`${API_URL}/api/routes`, { headers: authHeader() }),
    ]);
    if (sRes.ok) setStudents(await sRes.json());
    if (dRes.ok) setDrivers(await dRes.json());
    if (vRes.ok) setVehicles(await vRes.json());
    if (rRes.ok) setRoutes(await rRes.json());
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/login');
    const u = JSON.parse(userData);
    if (u.role !== 'ADMIN') return router.push('/login');
    setUser(u);
    fetchAll();
  }, [router, fetchAll]);

  const openModal = (m: 'driver'|'vehicle'|'route') => {
    setFormStatus({ loading:false, error:'', success:'' });
    setModal(m);
  };

  const handleApprove = async (id: number) => {
    await fetch(`${API_URL}/api/students/${id}/approve`, { method:'PUT', headers: authHeader() });
    fetchAll();
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`${API_URL}/api/students/${id}`, { method:'DELETE', headers: authHeader() });
    if (!res.ok) { const data = await res.json(); alert(data.error || 'Silinirken hata oluştu.'); }
    fetchAll();
  };

  const handleDeleteDriver = async (id: number) => {
    if (!confirm('Bu şoförü silmek istediğinize emin misiniz? Atanmış rotaları da silinecektir.')) return;
    const res = await fetch(`${API_URL}/api/auth/staff/drivers/${id}`, { method:'DELETE', headers: authHeader() });
    if (!res.ok) { const data = await res.json(); alert(data.error || 'Silinirken hata oluştu.'); }
    fetchAll();
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz? Atanmış rotaları da silinecektir.')) return;
    const res = await fetch(`${API_URL}/api/vehicles/${id}`, { method:'DELETE', headers: authHeader() });
    if (!res.ok) { const data = await res.json(); alert(data.error || 'Silinirken hata oluştu.'); }
    fetchAll();
  };

  const handleDeleteRoute = async (id: number) => {
    if (!confirm('Bu rotayı silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`${API_URL}/api/routes/${id}`, { method:'DELETE', headers: authHeader() });
    if (!res.ok) { const data = await res.json(); alert(data.error || 'Silinirken hata oluştu.'); }
    fetchAll();
  };

  const submit = async (url: string, body: any) => {
    setFormStatus({ loading:true, error:'', success:'' });
    const res = await fetch(url, { method:'POST', headers: authHeader(), body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setFormStatus({ loading:false, error: data.error || 'Hata oluştu.', success:'' }); return; }
    setFormStatus({ loading:false, error:'', success:'Başarıyla kaydedildi!' });
    fetchAll();
    setTimeout(() => { setModal(null); setFormStatus({ loading:false, error:'', success:'' }); }, 1500);
  };

  const pendingCount = students.filter(s => s.status === 'PENDING').length;

  const NavBtn = ({ v, label, icon }: { v: View; label: string; icon: string }) => (
    <button onClick={() => setView(v)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all text-left ${view === v ? 'bg-white/10 text-yellow-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      <span className="text-lg">{icon}</span>{label}
    </button>
  );

  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-yellow-400 p-2 rounded-lg text-slate-900 text-xl">🚌</div>
          <span className="text-xl font-bold">Akıllı Servis</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavBtn v="dashboard" label="Ana Panel" icon="🏠" />
          <NavBtn v="students" label={`Öğrenciler ${pendingCount > 0 ? `(${pendingCount})` : ''}`} icon="🎒" />
          <NavBtn v="drivers" label="Şoförler ve Rotalar" icon="🚗" />
        </nav>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="mt-auto flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
          <span>🚪</span> Çıkış Yap
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            {view === 'dashboard' && 'Yönetim Paneli'}
            {view === 'students' && 'Öğrenci Yönetimi'}
            {view === 'drivers' && 'Şoförler ve Rotalar'}
          </h2>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden md:inline text-slate-500 text-sm">Hoş Geldiniz, <span className="font-bold text-slate-800">{user.name}</span></span>
            <div className="hidden md:flex w-10 h-10 bg-yellow-400 rounded-full items-center justify-center font-bold text-slate-900">A</div>
            <button onClick={() => window.location.reload()} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200" title="Sayfayı Yenile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            </button>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="md:hidden text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors font-medium flex items-center gap-2">
              Çıkış
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">

          {/* ===== DASHBOARD VIEW ===== */}
          {view === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {[
                  { label: 'Toplam Öğrenci', value: students.length, color: 'blue', icon: '🎒' },
                  { label: 'Onay Bekleyen', value: pendingCount, color: 'yellow', icon: '⏳' },
                  { label: 'Toplam Şoför', value: drivers.length, color: 'green', icon: '👨‍✈️' },
                  { label: 'Toplam Araç', value: vehicles.length, color: 'purple', icon: '🚌' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className={`text-3xl bg-${s.color}-100 p-3 rounded-xl`}>{s.icon}</div>
                    <div>
                      <p className="text-sm text-slate-500">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending students + Quick actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Onay Bekleyen Öğrenciler</h3>
                    <button onClick={() => setView('students')} className="text-sm text-blue-600 hover:underline">Tümünü Gör</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-sm border-b">
                        <tr><th className="p-4">İsim</th><th className="p-4">Okul</th><th className="p-4">Veli</th><th className="p-4">Durum</th><th className="p-4"></th></tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.status === 'PENDING').length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-slate-400">Onay bekleyen öğrenci yok ✅</td></tr>
                        ) : students.filter(s => s.status === 'PENDING').map(s => (
                          <tr key={s.id} className="border-b hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{s.name}</td>
                            <td className="p-4 text-slate-500 text-sm">{s.schoolName}</td>
                            <td className="p-4 text-slate-500 text-sm">{s.parent?.user?.name || '-'}</td>
                            <td className="p-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Bekliyor</span></td>
                            <td className="p-4 flex gap-2">
                              <button onClick={() => handleApprove(s.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">Onayla</button>
                              <button onClick={() => handleDeleteStudent(s.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors">Sil</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-5">Hızlı İşlemler</h3>
                  <div className="space-y-3">
                    <button onClick={() => openModal('driver')} className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-sm">👨‍✈️</span> Yeni Şoför Ekle
                    </button>
                    <button onClick={() => openModal('vehicle')} className="w-full py-3 px-4 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-200 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-3">
                      <span className="bg-green-100 text-green-600 p-2 rounded-lg text-sm">🚌</span> Yeni Araç Ekle
                    </button>
                    <button onClick={() => openModal('route')} className="w-full py-3 px-4 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-3">
                      <span className="bg-purple-100 text-purple-600 p-2 rounded-lg text-sm">🗺️</span> Yeni Rota Oluştur
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STUDENTS VIEW ===== */}
          {view === 'students' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Tüm Öğrenciler ({students.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm border-b">
                    <tr><th className="p-4">İsim</th><th className="p-4">Okul / No</th><th className="p-4">Veli</th><th className="p-4">Durum</th><th className="p-4">İşlem</th></tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-400">Henüz öğrenci kaydı yok.</td></tr>
                    ) : students.map(s => (
                      <tr key={s.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">{s.name.substring(0,2).toUpperCase()}</div>
                            <span className="font-medium text-slate-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">{s.schoolName} / {s.schoolNumber}</td>
                        <td className="p-4 text-slate-500 text-sm">{s.parent?.user?.name || '-'}</td>
                        <td className="p-4">
                          {s.status === 'PENDING' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Onay Bekliyor</span>}
                          {s.status === 'APPROVED' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Onaylandı</span>}
                          {s.status === 'REJECTED' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Reddedildi</span>}
                        </td>
                        <td className="p-4">
                          {s.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(s.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">Onayla</button>
                              <button onClick={() => handleDeleteStudent(s.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors">Sil</button>
                            </div>
                          )}
                          {s.status !== 'PENDING' && (
                            <button onClick={() => handleDeleteStudent(s.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors">Sil</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== DRIVERS VIEW ===== */}
          {view === 'drivers' && (
            <div className="space-y-6">
              <div className="flex gap-3 justify-end">
                <button onClick={() => openModal('driver')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md">+ Şoför Ekle</button>
                <button onClick={() => openModal('vehicle')} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md">+ Araç Ekle</button>
                <button onClick={() => openModal('route')} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md">+ Rota Oluştur</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drivers */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b"><h3 className="font-bold text-slate-800">Şoförler ({drivers.length})</h3></div>
                  <div className="divide-y">
                    {drivers.length === 0 ? <p className="p-8 text-center text-slate-400">Henüz şoför eklenmedi.</p> :
                      drivers.map(d => (
                        <div key={d.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                              {d.user?.name?.substring(0,1) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{d.user?.name}</p>
                              <p className="text-xs text-slate-400">{d.user?.email} • Ehliyet: {d.licenseNumber}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteDriver(d.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors">Sil</button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Vehicles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b"><h3 className="font-bold text-slate-800">Araçlar ({vehicles.length})</h3></div>
                  <div className="divide-y">
                    {vehicles.length === 0 ? <p className="p-8 text-center text-slate-400">Henüz araç eklenmedi.</p> :
                      vehicles.map(v => (
                        <div key={v.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-2xl">🚌</div>
                            <div>
                              <p className="font-bold text-slate-800">{v.licensePlate}</p>
                              <p className="text-xs text-slate-400">{v.model || 'Model belirtilmedi'} • {v.capacity} kişilik</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteVehicle(v.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors">Sil</button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Routes */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b"><h3 className="font-bold text-slate-800">Rotalar ({routes.length})</h3></div>
                <div className="divide-y">
                  {routes.length === 0 ? <p className="p-8 text-center text-slate-400">Henüz rota oluşturulmadı.</p> :
                    routes.map(r => (
                      <div key={r.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-2xl">🗺️</div>
                          <div>
                            <p className="font-bold text-slate-800">{r.name}</p>
                            <p className="text-xs text-slate-400">{r.startPoint} → {r.endPoint} • Şoför: {r.driver?.user?.name || '-'} • Araç: {r.vehicle?.licensePlate || '-'}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteRoute(r.id)} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors">Sil</button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== MODALS ===== */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-50 border-b p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {modal === 'driver' && 'Yeni Şoför Ekle'}
                {modal === 'vehicle' && 'Yeni Araç Ekle'}
                {modal === 'route' && 'Yeni Rota Oluştur'}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-red-500 transition-colors text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {formStatus.error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{formStatus.error}</div>}
              {formStatus.success && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm">{formStatus.success}</div>}

              {modal === 'driver' && (
                <form onSubmit={e => { e.preventDefault(); submit(`${API_URL}/api/auth/staff`, { ...driverForm, role: 'DRIVER' }); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[['Ad Soyad','text','name'],['E-posta','email','email'],['Şifre','password','password'],['Telefon','tel','phone']].map(([lbl,type,key]) => (
                      <div key={key}><label className="block text-sm font-medium text-slate-700 mb-1">{lbl}</label>
                        <input type={type} required value={(driverForm as any)[key]} onChange={e => setDriverForm({...driverForm, [key]: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div>
                    ))}
                    <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Ehliyet No</label>
                      <input required value={driverForm.licenseNumber} onChange={e => setDriverForm({...driverForm, licenseNumber: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"/></div>
                  </div>
                  <button disabled={formStatus.loading} type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                    {formStatus.loading ? 'Kaydediliyor...' : 'Şoförü Kaydet'}
                  </button>
                </form>
              )}

              {modal === 'vehicle' && (
                <form onSubmit={e => { e.preventDefault(); submit(`${API_URL}/api/vehicles`, vehicleForm); }} className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Plaka</label>
                    <input required value={vehicleForm.licensePlate} onChange={e => setVehicleForm({...vehicleForm, licensePlate: e.target.value})} placeholder="34 ABC 123" className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none uppercase"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Kapasite</label>
                      <input type="number" min="1" required value={vehicleForm.capacity} onChange={e => setVehicleForm({...vehicleForm, capacity: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"/></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                      <input value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} placeholder="Mercedes Sprinter" className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"/></div>
                  </div>
                  <button disabled={formStatus.loading} type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all">
                    {formStatus.loading ? 'Kaydediliyor...' : 'Aracı Kaydet'}
                  </button>
                </form>
              )}

              {modal === 'route' && (
                <form onSubmit={e => { e.preventDefault(); submit(`${API_URL}/api/routes`, routeForm); }} className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Rota Adı</label>
                    <input required value={routeForm.name} onChange={e => setRouteForm({...routeForm, name: e.target.value})} placeholder="Örn: Kadıköy - Şişli" className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç</label>
                      <input value={routeForm.startPoint} onChange={e => setRouteForm({...routeForm, startPoint: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"/></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Bitiş</label>
                      <input value={routeForm.endPoint} onChange={e => setRouteForm({...routeForm, endPoint: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"/></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Şoför</label>
                      <select required value={routeForm.driverId} onChange={e => setRouteForm({...routeForm, driverId: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none">
                        <option value="">Şoför seçin...</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.user?.name} ({d.licenseNumber})</option>)}
                      </select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Araç</label>
                      <select required value={routeForm.vehicleId} onChange={e => setRouteForm({...routeForm, vehicleId: e.target.value})} className="w-full p-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none">
                        <option value="">Araç seçin...</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} ({v.capacity} kişi)</option>)}
                      </select></div>
                  </div>
                  <button disabled={formStatus.loading} type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all">
                    {formStatus.loading ? 'Oluşturuluyor...' : 'Rotayı Kaydet'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
