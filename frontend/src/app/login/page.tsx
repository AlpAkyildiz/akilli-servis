'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'DRIVER') router.push('/driver');
      else router.push('/parent');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <div className="bg-yellow-400 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h5.05a2.5 2.5 0 014.9 0H22a1 1 0 001-1V9.528a2 2 0 00-.814-1.605L18 5.416a2 2 0 00-1.186-.388H15V4a1 1 0 00-1-1H3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Akıllı Servis</h2>
          <p className="text-blue-200 mt-2 text-sm font-medium">Öğrenci Yönetim Sistemi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="ornek@okul.edu.tr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-300">
              <input type="checkbox" className="rounded border-slate-600 bg-slate-900 text-yellow-400 focus:ring-yellow-400" />
              <span className="ml-2">Beni Hatırla</span>
            </label>
            <a href="#" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Şifremi Unuttum?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all transform ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Yönetici, Şoför veya Veli olarak giriş yapabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
