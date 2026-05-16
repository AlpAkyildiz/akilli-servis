'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // Modal states
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: '', email: '', password: '', phone: '', licenseNumber: '' });
  const [driverStatus, setDriverStatus] = useState({ loading: false, error: '', success: '' });

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ licensePlate: '', capacity: '', model: '' });
  const [vehicleStatus, setVehicleStatus] = useState({ loading: false, error: '', success: '' });

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({ name: '', startPoint: '', endPoint: '', driverId: '', vehicleId: '' });
  const [routeStatus, setRouteStatus] = useState({ loading: false, error: '', success: '' });
  
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/login');
      }
      setUser(parsedUser);
      fetchStudents(userData);
      fetchDriversAndVehicles();
    }
  }, [router]);

  const fetchDriversAndVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const [dRes, vRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/staff/drivers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (dRes.ok) setDrivers(await dRes.json());
      if (vRes.ok) setVehicles(await vRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchStudents = async (userStr: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Students fetch error:', err);
    }
  };

  const handleApproveStudent = async (studentId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/students/${studentId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh list
        fetchStudents(''); 
      }
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setDriverStatus({ loading: true, error: '', success: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/staff', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...driverForm, role: 'DRIVER' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Şoför eklenemedi.');
      
      setDriverStatus({ loading: false, error: '', success: 'Şoför başarıyla eklendi!' });
      setDriverForm({ name: '', email: '', password: '', phone: '', licenseNumber: '' });
      setTimeout(() => { setIsDriverModalOpen(false); setDriverStatus(prev => ({...prev, success: ''})); }, 2000);
    } catch (err: any) {
      setDriverStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleStatus({ loading: true, error: '', success: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(vehicleForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Araç eklenemedi.');
      
      setVehicleStatus({ loading: false, error: '', success: 'Araç başarıyla eklendi!' });
      setVehicleForm({ licensePlate: '', capacity: '', model: '' });
      setTimeout(() => { setIsVehicleModalOpen(false); setVehicleStatus(prev => ({...prev, success: ''})); }, 2000);
    } catch (err: any) {
      setVehicleStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setRouteStatus({ loading: true, error: '', success: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/routes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(routeForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Rota eklenemedi.');
      
      setRouteStatus({ loading: false, error: '', success: 'Rota başarıyla oluşturuldu!' });
      setRouteForm({ name: '', startPoint: '', endPoint: '', driverId: '', vehicleId: '' });
      setTimeout(() => { setIsRouteModalOpen(false); setRouteStatus(prev => ({...prev, success: ''})); }, 2000);
    } catch (err: any) {
      setRouteStatus({ loading: false, error: err.message, success: '' });
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider">Akıllı Servis</span>
        </div>
        
        <nav className="flex-1 space-y-4">
          <a href="#" className="flex items-center gap-3 bg-white/10 p-3 rounded-xl text-yellow-400 font-medium transition-all hover:bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
            Ana Panel
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-xl text-slate-400 font-medium transition-all hover:bg-white/5 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
            Öğrenciler
          </a>
          <a href="#" className="flex items-center gap-3 p-3 rounded-xl text-slate-400 font-medium transition-all hover:bg-white/5 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            Şoförler ve Rotalar
          </a>
        </nav>

        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="mt-auto flex items-center gap-3 p-3 rounded-xl text-red-400 font-medium transition-all hover:bg-red-400/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
          Çıkış Yap
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-2xl font-bold text-slate-800">Yönetim Paneli</h2>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-medium">Hoş Geldiniz, <span className="text-slate-900 font-bold">{user.name}</span></span>
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-bold shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transform transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Toplam Veli/Öğrenci</p>
                <p className="text-2xl font-bold text-slate-800">124</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transform transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="bg-green-100 p-4 rounded-xl text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h5.05a2.5 2.5 0 014.9 0H22a1 1 0 001-1V9.528a2 2 0 00-.814-1.605L18 5.416a2 2 0 00-1.186-.388H15V4a1 1 0 00-1-1H3z" /></svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Aktif Servis Aracı</p>
                <p className="text-2xl font-bold text-slate-800">12</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transform transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Devam Eden Seferler</p>
                <p className="text-2xl font-bold text-slate-800">5</p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Son Eklenen Öğrenciler</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">Tümünü Gör</button>
              </div>
              <div className="p-0 overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="text-slate-500 text-sm border-b border-slate-100">
                      <th className="p-4 font-medium">İsim</th>
                      <th className="p-4 font-medium">Okul/Sınıf</th>
                      <th className="p-4 font-medium">Veli Adı</th>
                      <th className="p-4 font-medium">Durum</th>
                      <th className="p-4 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">Henüz öğrenci kaydı bulunmuyor.</td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                              {student.name.substring(0, 2)}
                            </div>
                            <span className="font-medium text-slate-800">{student.name}</span>
                          </td>
                          <td className="p-4 text-slate-600 text-sm">{student.schoolName} / {student.schoolNumber}</td>
                          <td className="p-4 text-slate-600 text-sm">{student.parent?.user?.name || '-'}</td>
                          <td className="p-4">
                            {student.status === 'PENDING' ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Onay Bekliyor</span>
                            ) : student.status === 'APPROVED' ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Onaylandı</span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Reddedildi</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {student.status === 'PENDING' && (
                              <button 
                                onClick={() => handleApproveStudent(student.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                Onayla
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-6">Hızlı İşlemler</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsDriverModalOpen(true)}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg></span>
                  Yeni Şoför Ekle
                </button>
                <button 
                  onClick={() => setIsVehicleModalOpen(true)}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-3">
                  <span className="bg-green-100 text-green-600 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg></span>
                  Yeni Araç Ekle
                </button>
                <button 
                  onClick={() => setIsRouteModalOpen(true)}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center gap-3">
                  <span className="bg-purple-100 text-purple-600 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></span>
                  Yeni Rota Oluştur
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Yeni Şoför Ekle</h3>
              <button onClick={() => setIsDriverModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateDriver} className="p-6 space-y-4">
              {driverStatus.error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{driverStatus.error}</div>}
              {driverStatus.success && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{driverStatus.success}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                  <input type="text" required value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                  <input type="email" required value={driverForm.email} onChange={e => setDriverForm({...driverForm, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                  <input type="password" required value={driverForm.password} onChange={e => setDriverForm({...driverForm, password: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon Numarası</label>
                  <input type="tel" required value={driverForm.phone} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ehliyet Numarası</label>
                  <input type="text" required value={driverForm.licenseNumber} onChange={e => setDriverForm({...driverForm, licenseNumber: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <button disabled={driverStatus.loading} type="submit" className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30">
                {driverStatus.loading ? 'Ekleniyor...' : 'Şoförü Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Yeni Araç Ekle</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateVehicle} className="p-6 space-y-4">
              {vehicleStatus.error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{vehicleStatus.error}</div>}
              {vehicleStatus.success && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{vehicleStatus.success}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Araç Plakası</label>
                <input type="text" required value={vehicleForm.licensePlate} onChange={e => setVehicleForm({...vehicleForm, licensePlate: e.target.value})} placeholder="Örn: 34 ABC 123" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yolcu Kapasitesi</label>
                  <input type="number" min="1" required value={vehicleForm.capacity} onChange={e => setVehicleForm({...vehicleForm, capacity: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Araç Modeli</label>
                  <input type="text" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} placeholder="Örn: Mercedes Sprinter" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
              </div>
              <button disabled={vehicleStatus.loading} type="submit" className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-600/30">
                {vehicleStatus.loading ? 'Ekleniyor...' : 'Aracı Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Yeni Rota Oluştur</h3>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateRoute} className="p-6 space-y-4">
              {routeStatus.error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{routeStatus.error}</div>}
              {routeStatus.success && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{routeStatus.success}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rota Adı</label>
                <input type="text" required value={routeForm.name} onChange={e => setRouteForm({...routeForm, name: e.target.value})} placeholder="Örn: Kadıköy - Şişli" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Noktası</label>
                  <input type="text" value={routeForm.startPoint} onChange={e => setRouteForm({...routeForm, startPoint: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş Noktası</label>
                  <input type="text" value={routeForm.endPoint} onChange={e => setRouteForm({...routeForm, endPoint: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Şoför Seçimi</label>
                  <select required value={routeForm.driverId} onChange={e => setRouteForm({...routeForm, driverId: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white">
                    <option value="">Şoför Seçiniz...</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.user?.name} ({d.licenseNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Araç Seçimi</label>
                  <select required value={routeForm.vehicleId} onChange={e => setRouteForm({...routeForm, vehicleId: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white">
                    <option value="">Araç Seçiniz...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.licensePlate} ({v.capacity} Kişi)</option>
                    ))}
                  </select>
                </div>
              </div>
              <button disabled={routeStatus.loading} type="submit" className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-600/30">
                {routeStatus.loading ? 'Oluşturuluyor...' : 'Rotayı Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
