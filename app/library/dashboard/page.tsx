'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, Search, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    class: string;
}

interface Loan {
    id: number;
    student: Student;
    bookTitle: string;
    borrowDate: string;
    dueDate: string;
    status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

export default function LibraryDashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [scanInput, setScanInput] = useState('');
    const [student, setStudent] = useState<Student | null>(null);
    const [bookTitle, setBookTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            router.push('/library/login');
            return;
        }
        const user = JSON.parse(session);
        if (user.role !== 'LIBRARY' && user.role !== 'ADMIN') {
            router.push('/');
            return;
        }
        setMounted(true);
        fetchLoans();

        // Focus scan input on load
        setTimeout(() => scanInputRef.current?.focus(), 500);
    }, []);

    const fetchLoans = async () => {
        try {
            const res = await fetch('/api/library/loans?status=BORROWED');
            if (res.ok) {
                const data = await res.json();
                setLoans(data);
            }
        } catch (error) {
            console.error('Failed to fetch loans');
        }
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanInput) return;

        setLoading(true);
        try {
            // Find student by ID card (barcode) or NISN
            // We can reuse the scan API or just search student API
            // Let's assume scanInput is the barcode/NISN
            // For now, let's use a direct student search API if available, or just fetch all and filter (inefficient but works for now)
            // Better: Use /api/scan logic but just to get student info

            // Or simpler: Search by name/class if manual, or barcode if scan
            // Let's try to fetch student by barcode via a new param in students API or just reuse existing

            // Workaround: Fetch all students for now (or implement search API later)
            // Actually, let's use the /api/scan endpoint logic but we need a dedicated "get student by barcode" endpoint.
            // Let's try to use /api/students?query=... if we implemented search there?
            // Checking /api/students... it usually filters by class.

            // Let's implement a quick lookup here using the existing scan API? 
            // No, scan API records attendance.

            // Let's just fetch all students and find in client for this MVP (if < 1000 students it's fast enough)
            // Or better: Add a search endpoint.
            // Let's try to fetch by ID if scanInput is numeric

            // TEMPORARY: Just use a simple fetch to /api/students/search if it existed.
            // Let's assume we can search by name for now manually if scan fails?

            // Let's try to find the student by barcode from the full list (cached?)
            // Or just add `barcode` query to /api/students

            const res = await fetch(`/api/students?barcode=${encodeURIComponent(scanInput)}`);
            // Note: We need to ensure /api/students supports barcode filtering or we filter client side

            // Let's try client side filter on a full fetch if API doesn't support it yet
            // But fetching all students is heavy.

            // Let's assume the user types a NAME or scans a BARCODE.
            // If it's a barcode, it usually matches `student.barcode` or `student.nisn`.

            // Let's try to fetch all students (it's cached usually)
            const allRes = await fetch('/api/students');
            const allStudents: any[] = await allRes.json();

            const found = allStudents.find(s =>
                s.barcode === scanInput ||
                s.nisn === scanInput ||
                s.name.toLowerCase().includes(scanInput.toLowerCase())
            );

            if (found) {
                setStudent(found);
                setScanInput(''); // Clear scan input
            } else {
                alert('Siswa tidak ditemukan');
            }
        } catch (error) {
            alert('Error searching student');
        } finally {
            setLoading(false);
        }
    };

    const handleLoan = async () => {
        if (!student || !bookTitle) return;

        try {
            const res = await fetch('/api/library/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: student.id,
                    bookTitle,
                    notes
                })
            });

            if (res.ok) {
                alert('Peminjaman berhasil dicatat!');
                setStudent(null);
                setBookTitle('');
                setNotes('');
                fetchLoans();
                scanInputRef.current?.focus();
            } else {
                alert('Gagal mencatat peminjaman');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        }
    };

    const handleReturn = async (id: number) => {
        if (!confirm('Tandai buku ini sudah kembali?')) return;

        try {
            const res = await fetch(`/api/library/loans/${id}/return`, {
                method: 'PUT'
            });

            if (res.ok) {
                fetchLoans();
            } else {
                alert('Gagal mengembalikan buku');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        router.push('/library/login');
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Perpustakaan</h1>
                            <p className="text-xs text-gray-500">MTsN 1 Labuhan Batu</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <LogOut size={16} /> Keluar
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Scan & Loan Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Scan Box */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Search size={20} className="text-amber-600" />
                            Cari Siswa
                        </h2>
                        <form onSubmit={handleScan}>
                            <input
                                ref={scanInputRef}
                                type="text"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-lg"
                                placeholder="Scan Kartu / Ketik Nama..."
                            />
                            <button type="submit" className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900">
                                Cari
                            </button>
                        </form>
                    </div>

                    {/* Loan Form */}
                    {student && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200 ring-1 ring-amber-100 animate-in slide-in-from-top-4">
                            <div className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Peminjam</p>
                                <p className="text-lg font-bold text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.class}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                                    <input
                                        type="text"
                                        value={bookTitle}
                                        onChange={(e) => setBookTitle(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="Contoh: Buku Paket IPA Kls 8"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="Kondisi buku, dll."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setStudent(null)}
                                        className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleLoan}
                                        disabled={!bookTitle}
                                        className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        Pinjam Buku
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Active Loans */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={20} className="text-blue-600" />
                                Sedang Dipinjam
                            </h2>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                {loans.length} Buku
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="p-4">Tgl Pinjam</th>
                                        <th className="p-4">Siswa</th>
                                        <th className="p-4">Buku</th>
                                        <th className="p-4">Jatuh Tempo</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loans.map((loan) => {
                                        const isOverdue = new Date(loan.dueDate) < new Date();
                                        return (
                                            <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-gray-500">
                                                    {new Date(loan.borrowDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-medium text-gray-900">{loan.student.name}</p>
                                                    <p className="text-xs text-gray-500">{loan.student.class}</p>
                                                </td>
                                                <td className="p-4 font-medium text-gray-800">{loan.bookTitle}</td>
                                                <td className="p-4">
                                                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                                                        {new Date(loan.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleReturn(loan.id)}
                                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all active:scale-95"
                                                    >
                                                        Kembalikan
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {loans.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-400">
                                                Tidak ada buku yang sedang dipinjam.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
