'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        router.push('/admin/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative">
                <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-center mb-8">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-purple-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Login Guru</h1>
                    <p className="text-gray-500">Masuk ke dashboard admin</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900"
                            placeholder="Masukkan Username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900"
                            placeholder="Masukkan Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}
