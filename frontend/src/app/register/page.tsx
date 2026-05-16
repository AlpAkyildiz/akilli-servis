'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/config';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Kayıt başarısız.');

      setStatus({ loading: false, error: '', success: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...' });
      setTimeout(() => router.push('/login'), 2000);
      
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-yellow-400 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Veli Kayıt Formu</h2>
          <p className="text-blue-200 mt-2 text-sm font-medium">Sisteme katılıp öğrencinizi takip edin</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {status.error && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-sm text-center">{status.error}</div>}
          {status.success && <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-200 rounded-xl text-sm text-center">{status.success}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ad Soyad</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Ahmet Yılmaz" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">E-posta</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="ornek@mail.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telefon</label>
              <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="0532..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Şifre</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="••••••••" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Adres (İsteğe Bağlı)</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Ev adresi..."></textarea>
          </div>

          <button disabled={status.loading} type="submit" className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all">
            {status.loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Zaten hesabınız var mı? <Link href="/login" className="text-yellow-400 hover:underline">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
