'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/config';

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', schoolName: '', schoolNumber: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'PARENT') {
        router.push('/login');
      }
      setUser(parsedUser);
      fetchStudents();
    }
  }, [router]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/students`, {
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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Öğrenci eklenemedi.');

      setStatus({ loading: false, error: '', success: 'Öğrenci başarıyla eklendi! Yönetici onayı bekleniyor.' });
      setForm({ name: '', schoolName: '', schoolNumber: '' });
      fetchStudents();
      setTimeout(() => { setIsModalOpen(false); setStatus({ loading: false, error: '', success: '' }); }, 2000);
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-wide">Veli Paneli</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-medium text-blue-100">Merhaba, {user.name}</span>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Öğrencilerim</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-6 py-3 rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Yeni Öğrenci Ekle
          </button>
        </div>

        {/* Student Cards */}
        {students.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz öğrenci eklemediniz</h3>
            <p className="text-slate-500">Sistemi kullanmaya başlamak için yukarıdaki butondan çocuğunuzu ekleyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
              <div key={student.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${student.status === 'APPROVED' ? 'bg-green-500' : student.status === 'PENDING' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {student.name.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                      <p className="text-sm text-slate-500">{student.schoolName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Öğrenci No:</span>
                    <span className="font-medium text-slate-700">{student.schoolNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Durum:</span>
                    {student.status === 'APPROVED' ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Onaylandı</span>
                    ) : student.status === 'PENDING' ? (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Onay Bekliyor</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Reddedildi</span>
                    )}
                  </div>
                </div>
                
                {student.status === 'APPROVED' ? (
                  <Link
                    href="/tracking"
                    className="w-full py-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Canlı Takip Et
                  </Link>
                ) : (
                  <button disabled className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-medium cursor-not-allowed">
                    Takip İçin Onay Bekleniyor
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Yeni Öğrenci Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {status.error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">{status.error}</div>}
              {status.success && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium">{status.success}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Öğrenci Adı Soyadı</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Okul Adı</label>
                <input type="text" required value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} placeholder="Örn: Cumhuriyet İlkokulu" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Okul Numarası</label>
                <input type="text" required value={form.schoolNumber} onChange={e => setForm({...form, schoolNumber: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
              </div>

              <button disabled={status.loading} type="submit" className="w-full mt-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-400/30">
                {status.loading ? 'Ekleniyor...' : 'Öğrenciyi Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
