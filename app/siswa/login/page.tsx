'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { CLASSES } from '../../../lib/constants';

export default function StudentLogin() {
    const router = useRouter();
    const [nis, setNis] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const inputClass = nis.toLowerCase().replace(/\s/g, '');
        const matchedClass = CLASSES.find(c =>
            `kelas${c.toLowerCase().replace(/\s/g, '')}` === inputClass
        );

        if (matchedClass && password === 'siswa') {
            router.push(`/siswa/pilih-siswa?kelas=${encodeURIComponent(matchedClass)}`);
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
