import Image from 'next/image';
import Link from 'next/link';
import { User, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <Image
            src="/logo_kemenag.png"
            alt="Logo Kemenag"
            fill
            className="object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Absen Sholat<br />MTsN 1 Labuhan Batu</h1>
        <p className="text-gray-200">Jurnal Ibadah Harian & Kedisiplinan</p>
      </div>

      <div className="grid gap-6 w-full max-w-md">
        <Link
          href="/siswa/login"
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 flex items-center gap-4"
        >
          <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
            <User className="text-blue-600 group-hover:text-white transition-colors duration-300" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">Masuk sebagai Siswa</h2>
            <p className="text-sm text-gray-500">Isi jurnal ibadah harianmu</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/admin/login"
          className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 flex items-center gap-4"
        >
          <div className="bg-purple-100 p-4 rounded-xl group-hover:bg-purple-600 transition-colors duration-300">
            <ShieldCheck className="text-purple-600 group-hover:text-white transition-colors duration-300" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">Masuk sebagai Guru</h2>
            <p className="text-sm text-gray-500">Rekapitulasi & Monitoring</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1 bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-300">
        <p>&copy; {new Date().getFullYear()} MTsN 1 Labuhan Batu.</p>
      </footer>
    </main>
  );
}
