import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-black p-6 md:p-24 text-white relative overflow-hidden">
      {/* Arka plan dekoratif ışıklar */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000"></div>

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-16 shadow-2xl border border-white/20 text-center max-w-3xl w-full relative z-10">
        
        {/* İkon */}
        <div className="bg-gradient-to-tr from-yellow-400 to-amber-300 w-24 h-24 md:w-28 md:h-28 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(250,204,21,0.4)] rotate-3 transform hover:rotate-6 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-slate-950" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h5.05a2.5 2.5 0 014.9 0H22a1 1 0 001-1V9.528a2 2 0 00-.814-1.605L18 5.416a2 2 0 00-1.186-.388H15V4a1 1 0 00-1-1H3z" />
          </svg>
        </div>

        {/* Başlık */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-yellow-400">
          Akıllı Servis Yönetim Sistemi
        </h1>
        
        <p className="mt-4 text-lg md:text-2xl text-slate-300 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
          Öğrencilerinizin okul servisi yolculuğunu gerçek zamanlı haritadan izleyin, biniş ve iniş bildirimlerini anında alın.
        </p>

        {/* Buton Grubu */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-md mx-auto">
          <Link 
            href="/login" 
            className="w-full py-5 px-8 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-extrabold rounded-2xl shadow-[0_0_25px_rgba(250,204,21,0.4)] hover:shadow-[0_0_35px_rgba(250,204,21,0.6)] transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-3 group"
          >
            <span>Giriş Yap</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>

          <Link 
            href="/register" 
            className="w-full py-5 px-8 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/30 hover:border-white/50 shadow-lg backdrop-blur-md transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            <span>Veli Kayıt Ol</span>
          </Link>
        </div>

        {/* Alt Bilgi */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400 text-sm">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white mb-1">📍 Canlı GPS Takibi</h3>
            <p className="text-xs">Servisin nerede olduğunu saniye saniye haritadan izleyin.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white mb-1">🔔 Anında Bildirim</h3>
            <p className="text-xs">Çocuğunuz servise bindiğinde veya indiğinde haberdar olun.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <h3 className="font-bold text-white mb-1">🔒 Güvenli Altyapı</h3>
            <p className="text-xs">Şoför ve öğrenci eşleştirmesiyle tam güvenlik kontrolü.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
