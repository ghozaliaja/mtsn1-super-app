'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, User } from 'lucide-react';

export default function LibraryLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.user.role === 'LIBRARY' || data.user.role === 'ADMIN') {
                    localStorage.setItem('userSession', JSON.stringify(data.user));
                    router.push('/library/dashboard');
                } else {
                    alert('Akses ditolak. Bukan akun perpustakaan.');
                }
            } else {
                alert(data.error || 'Login gagal');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-amber-100">
                <div className="text-center mb-8">
                    <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                        <BookOpen size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Perpustakaan Digital</h1>
                    <p className="text-gray-500">MTsN 1 Labuhan Batu</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="pustakawan"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-md"
                    >
                        {loading ? 'Loading...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}
