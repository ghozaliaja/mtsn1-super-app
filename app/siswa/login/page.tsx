'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function StudentLogin() {
    const router = useRouter();
    const [nis, setNis] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple hardcoded check for Class VII A
        if (nis.toLowerCase() === 'kelasviia' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII A');
        } else if (nis.toLowerCase() === 'kelasviib' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII B');
        } else if (nis.toLowerCase() === 'kelasviic' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII C');
        } else if (nis.toLowerCase() === 'kelasviid' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII D');
        } else if (nis.toLowerCase() === 'kelasviie' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII E');
        } else if (nis.toLowerCase() === 'kelasviif' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII F');
        } else if (nis.toLowerCase() === 'kelasviig' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII G');
        } else if (nis.toLowerCase() === 'kelasviih' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII H');
        } else if (nis.toLowerCase() === 'kelasviii' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII I');
        } else if (nis.toLowerCase() === 'kelasviij' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII J');
        } else if (nis.toLowerCase() === 'kelasviik' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VII K');
        } else if (nis.toLowerCase() === 'kelasviiia' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII A');
        } else if (nis.toLowerCase() === 'kelasviiib' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII B');
        } else if (nis.toLowerCase() === 'kelasviiic' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII C');
        } else if (nis.toLowerCase() === 'kelasviiid' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII D');
        } else if (nis.toLowerCase() === 'kelasviiie' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII E');
        } else if (nis.toLowerCase() === 'kelasviiif' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII F');
        } else if (nis.toLowerCase() === 'kelasviiig' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII G');
        } else if (nis.toLowerCase() === 'kelasviiih' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII H');
        } else if (nis.toLowerCase() === 'kelasviiii' && password === 'siswa') {
            router.push('/siswa/pilih-siswa?kelas=VIII I');
        } else {
            alert('Username atau password salah!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative">
                <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-center mb-8">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Login Siswa</h1>
                    <p className="text-gray-500">Masuk untuk mengisi mutabaah</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username Kelas</label>
                        <input
                            type="text"
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                            placeholder="Masukkan username kelas"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                            placeholder="Masukkan Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}
