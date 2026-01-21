'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartHandshake, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function BKLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save user session
                localStorage.setItem('userSession', JSON.stringify(data.user));

                // Redirect based on role
                if (data.user.role === 'BK') {
                    router.push('/bk/dashboard');
                } else if (data.user.role === 'WALIKELAS') {
                    router.push('/bk/wali-kelas');
                } else {
                    // If Admin tries to login here, maybe allow it or redirect to admin dashboard?
                    // Let's redirect to admin dashboard for flexibility
                    router.push('/admin/dashboard');
                }
            } else {
                setError(data.message || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative">
                <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-center mb-8">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HeartHandshake className="text-red-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Login ODOC</h1>
                    <p className="text-gray-500">Bimbingan Konseling & Wali Kelas</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username / ID Kelas</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900"
                            placeholder="Contoh: kelas7a atau odoc1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900"
                            placeholder="Masukkan Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}
