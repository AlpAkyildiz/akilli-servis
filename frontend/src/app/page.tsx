import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-24 text-white">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 text-center max-w-2xl">
        <div className="bg-yellow-400 w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(250,204,21,0.4)] rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h5.05a2.5 2.5 0 014.9 0H22a1 1 0 001-1V9.528a2 2 0 00-.814-1.605L18 5.416a2 2 0 00-1.186-.388H15V4a1 1 0 00-1-1H3z" />
            </svg>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
          Akıllı Servis Yönetim Sistemi
        </h1>
        <p className="mt-4 text-xl text-blue-200 mb-10">
          Veli, Şoför ve Yönetici Paneline Hoş Geldiniz
        </p>
        <Link 
          href="/login" 
          className="inline-block py-4 px-8 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all transform hover:-translate-y-1 text-lg"
        >
          Sisteme Giriş Yap
        </Link>
      </div>
    </main>
  );
}
