'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, Users, History, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    class: string;
}

interface Case {
    id: number;
    student: { name: string; class: string };
    violationType: string;
    description: string;
    status: 'PENDING' | 'PROCESSED' | 'RESOLVED';
    createdAt: string;
    resolution?: string;
}

export default function WaliKelasDashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [userClass, setUserClass] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'history'>('students');

    const [students, setStudents] = useState<Student[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(false);

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportStudent, setReportStudent] = useState<Student | null>(null);
    const [violationType, setViolationType] = useState('PC');
    const [violationDesc, setViolationDesc] = useState('');

    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            router.push('/admin/login');
            return;
        }

        try {
            const { role, className, id } = JSON.parse(session);
            if (role !== 'teacher' || !className) { // 'teacher' maps to WALIKELAS in login API
                router.push('/admin/login');
                return;
            }
            setUserClass(className);
            setUserId(id);
            setMounted(true);
        } catch (e) {
            localStorage.removeItem('userSession');
            router.push('/admin/login');
        }
    }, [router]);

    useEffect(() => {
        if (!mounted || !userClass) return;

        if (activeTab === 'students') {
            fetchStudents();
        } else {
            fetchCases();
        }
    }, [mounted, userClass, activeTab]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/students?class=${encodeURIComponent(userClass!)}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCases = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bk/cases');
            if (res.ok) {
                const data = await res.json();
                setCases(data);
            }
        } catch (error) {
            console.error('Failed to fetch cases', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        router.push('/admin/login');
    };

    const openReportModal = (student: Student) => {
        setReportStudent(student);
        setViolationType('PC');
        setViolationDesc('');
        setIsReportModalOpen(true);
    };

    const submitReport = async () => {
        if (!reportStudent || !userId) return;

        try {
            const res = await fetch('/api/bk/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: reportStudent.id,
                    reporterId: userId,
                    violationType,
                    description: violationDesc
                })
            });

            if (res.ok) {
                alert('Laporan berhasil dikirim ke BK');
                setIsReportModalOpen(false);
                // Switch to history tab to see the new case
                setActiveTab('history');
            } else {
                alert('Gagal mengirim laporan');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Selesai</span>;
            case 'PROCESSED':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Diproses</span>;
            default:
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Pending</span>;
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard Wali Kelas {userClass}</h1>
                        <p className="text-sm text-gray-500">ODOC - Bimbingan Konseling</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Keluar
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Users size={16} />
                        Daftar Siswa
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <History size={16} />
                        Riwayat Laporan
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            Loading data...
                        </div>
                    ) : activeTab === 'students' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-800 font-semibold uppercase text-xs tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 w-16 text-center">No</th>
                                        <th className="p-4">Nama Siswa</th>
                                        <th className="p-4">Kelas</th>
                                        <th className="p-4 text-center w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-center text-gray-400">{index + 1}</td>
                                            <td className="p-4 font-medium text-gray-900">{student.name}</td>
                                            <td className="p-4">{student.class}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => openReportModal(student)}
                                                    className="flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors w-full"
                                                >
                                                    <AlertTriangle size={14} />
                                                    Lapor
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                                Tidak ada data siswa.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-800 font-semibold uppercase text-xs tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Tanggal</th>
                                        <th className="p-4">Siswa</th>
                                        <th className="p-4">Pelanggaran</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Penyelesaian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cases.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">
                                                {c.student.name}
                                                <span className="block text-xs text-gray-400">{c.student.class}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-medium text-gray-800">{c.violationType}</span>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{c.description}</p>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(c.status)}
                                            </td>
                                            <td className="p-4 text-gray-500 italic text-xs">
                                                {c.resolution || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {cases.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">
                                                Belum ada riwayat laporan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle size={24} />
                                <h3 className="text-xl font-bold">Lapor Pelanggaran</h3>
                            </div>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Siswa yang dilaporkan</p>
                            <p className="font-bold text-lg text-gray-800">{reportStudent?.name}</p>
                            <p className="text-sm text-gray-600">{reportStudent?.class}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pelanggaran</label>
                                <select
                                    value={violationType}
                                    onChange={(e) => setViolationType(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                >
                                    <option value="PC">PC - Pacaran</option>
                                    <option value="CB">CB - Cabut / Bolos</option>
                                    <option value="BR">BR - Berkelahi</option>
                                    <option value="MK">MK - Merokok</option>
                                    <option value="TL">TL - Terlambat</option>
                                    <option value="ATTR">ATTR - Atribut</option>
                                    <option value="MC">MC - Mencuri</option>
                                    <option value="ST">ST - Senjata Tajam</option>
                                    <option value="BY">BY - Bullying</option>
                                    <option value="GL">GL - Geng Liar</option>
                                    <option value="MB">MB - Malas Belajar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Tambahan</label>
                                <textarea
                                    value={violationDesc}
                                    onChange={(e) => setViolationDesc(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                                    placeholder="Ceritakan kronologi singkat..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={submitReport}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                            >
                                Kirim Laporan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
