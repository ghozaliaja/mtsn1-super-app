
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, FileText, CheckCircle, Clock, Search, Printer } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default function BKDashboard() {
    const router = useRouter();
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [resolution, setResolution] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            router.push('/admin/login');
            return;
        }
        const userData = JSON.parse(session);
        if (userData.role !== 'BK' && userData.role !== 'ADMIN') {
            router.push('/admin/dashboard');
            return;
        }
        setUser(userData);
        fetchCases(userData.id);
    }, []);

    const fetchCases = async (userId: number) => {
        try {
            const res = await fetch(`/api/bk/cases?userId=${userId}`);
            const data = await res.json();
            setCases(data);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedCase || !resolution) return;

        try {
            const res = await fetch(`/api/bk/cases/${selectedCase.id}/resolve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolution })
            });

            if (res.ok) {
                setIsModalOpen(false);
                setResolution('');
                fetchCases(user.id);
                alert('Kasus berhasil diselesaikan!');
            } else {
                alert('Gagal menyelesaikan kasus');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        }
    };

    const openResolveModal = (c: any) => {
        setSelectedCase(c);
        setResolution('');
        setIsModalOpen(true);
    };

    const handlePrint = async (c: any) => {
        try {
            const res = await fetch(`/api/bk/cases/${c.id}/pdf`);
            if (!res.ok) throw new Error('Gagal download PDF');

            const blob = await res.blob();

            if (Capacitor.isNativePlatform()) {
                // Native: Save and Share
                const fileName = `Berita_Acara_${c.student.name.replace(/\s/g, '_')}.pdf`;
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    // Remove prefix (data:application/pdf;base64,)
                    const base64Content = base64data.split(',')[1];

                    try {
                        const result = await Filesystem.writeFile({
                            path: fileName,
                            data: base64Content,
                            directory: Directory.Documents,
                        });

                        await Share.share({
                            title: 'Berita Acara BK',
                            text: `Berita Acara Konseling - ${c.student.name}`,
                            url: result.uri,
                            dialogTitle: 'Cetak / Simpan PDF',
                        });
                    } catch (e) {
                        console.error('Native save error', e);
                        alert('Gagal menyimpan file di Android. Coba cek izin penyimpanan.');
                    }
                };
            } else {
                // Web: Blob Download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Berita_Acara_${c.student.name.replace(/\s/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Gagal mendownload PDF.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        router.push('/');
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard BK (ODOC)</h1>
                    <p className="text-gray-500">One Day One Counseling</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                    <LogOut size={20} />
                    Keluar
                </button>
            </div>

            {/* Stats Cards (Optional - can add later) */}

            {/* Cases List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Daftar Kasus Siswa</h2>
                    {/* Filter/Search can go here */}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Siswa</th>
                                <th className="p-4">Kelas</th>
                                <th className="p-4">Pelanggaran</th>
                                <th className="p-4">Pelapor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cases.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">{new Date(c.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td className="p-4 font-medium text-gray-800">{c.student.name}</td>
                                    <td className="p-4 text-gray-600">{c.student.class}</td>
                                    <td className="p-4">
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                            {c.violationType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{c.reporter.username}</td>
                                    <td className="p-4">
                                        {c.status === 'PENDING' ? (
                                            <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm">
                                                <Clock size={14} /> Pending
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                                                <CheckCircle size={14} /> Selesai
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {c.status === 'PENDING' && (
                                                <button
                                                    onClick={() => openResolveModal(c)}
                                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                                >
                                                    Proses
                                                </button>
                                            )}
                                            {c.status === 'RESOLVED' && (
                                                <button
                                                    onClick={() => handlePrint(c)}
                                                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 border border-gray-300"
                                                >
                                                    <Printer size={14} /> Cetak
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {cases.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">Belum ada data kasus.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resolve Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Selesaikan Kasus</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1 font-semibold">Siswa</p>
                            <p className="font-medium text-gray-900">{selectedCase?.student.name} ({selectedCase?.student.class})</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1 font-semibold">Masalah</p>
                            <p className="font-medium text-gray-900">{selectedCase?.violationType} - {selectedCase?.description}</p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Penyelesaian / Hukuman</label>
                            <textarea
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 placeholder:text-gray-400"
                                placeholder="Tulis hasil konseling di sini..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleResolve}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Selesai & Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
