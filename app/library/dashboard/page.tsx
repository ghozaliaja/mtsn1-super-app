'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, Search, Plus, CheckCircle, Clock, AlertCircle, Camera, X, FileSpreadsheet } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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
    const [scanning, setScanning] = useState(false);

    const scanInputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

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

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    // Scanner Logic
    useEffect(() => {
        if (scanning && !scannerRef.current) {
            const startScanner = async () => {
                try {
                    await new Promise(r => setTimeout(r, 100)); // Wait for DOM
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;

                    await html5QrCode.start(
                        { facingMode: "user" }, // Front camera
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        async (decodedText) => {
                            setScanning(false);
                            setScanInput(decodedText);
                            handleSearch(decodedText);

                            // Stop scanner after success
                            if (scannerRef.current) {
                                await scannerRef.current.stop();
                                scannerRef.current = null;
                            }
                        },
                        () => { }
                    );
                } catch (err) {
                    console.error("Error starting scanner", err);
                    setScanning(false);
                    alert("Gagal membuka kamera");
                }
            };
            startScanner();
        } else if (!scanning && scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current = null;
            }).catch(console.error);
        }
    }, [scanning]);

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

    const handleSearch = async (query: string) => {
        if (!query) return;
        setLoading(true);
        try {
            // Fetch all students (cached usually) and find match
            const allRes = await fetch('/api/students');
            const allStudents: any[] = await allRes.json();

            const found = allStudents.find(s =>
                s.barcode === query ||
                s.nisn === query ||
                s.name.toLowerCase().includes(query.toLowerCase())
            );

            if (found) {
                setStudent(found);
                setScanInput(''); // Clear input
                // Play sound
                new Audio('/success.mp3').play().catch(() => { });
            } else {
                alert('Siswa tidak ditemukan');
            }
        } catch (error) {
            alert('Error searching student');
        } finally {
            setLoading(false);
        }
    };

    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(scanInput);
    };

    const handleVisit = async () => {
        if (!student) return;

        try {
            const res = await fetch('/api/library/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: student.id,
                    purpose: 'VISIT'
                })
            });

            if (res.ok) {
                alert('Kunjungan berhasil dicatat!');
                setStudent(null);
                setScanInput('');
                scanInputRef.current?.focus();
            } else {
                alert('Gagal mencatat kunjungan');
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        }
    };

    const handleLoan = async () => {
        if (!student || !bookTitle) return;

        try {
            // 1. Record Loan
            const resLoan = await fetch('/api/library/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: student.id,
                    bookTitle,
                    notes
                })
            });

            // 2. Record Visit (Purpose: BORROW)
            await fetch('/api/library/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: student.id,
                    purpose: 'BORROW'
                })
            });

            if (resLoan.ok) {
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

    const handleExportVisits = async () => {
        const month = prompt('Masukkan bulan (YYYY-MM):', new Date().toISOString().slice(0, 7));
        if (!month) return;

        try {
            const res = await fetch(`/api/library/visits?month=${month}`);
            const visits = await res.json();

            if (!visits || visits.length === 0) {
                alert('Tidak ada data kunjungan pada bulan ini.');
                return;
            }

            // Dynamically import libraries
            const XLSX = (await import('xlsx-js-style')).default || (await import('xlsx-js-style'));

            const data = visits.map((v: any, index: number) => ({
                No: index + 1,
                Tanggal: new Date(v.date).toLocaleDateString('id-ID'),
                Jam: new Date(v.date).toLocaleTimeString('id-ID'),
                Nama: v.student.name,
                Kelas: v.student.class,
                Keperluan: v.purpose === 'BORROW' ? 'Pinjam Buku' : 'Baca / Kunjungan'
            }));

            const ws = XLSX.utils.json_to_sheet(data);

            // Auto width
            const wscols = [
                { wch: 5 },
                { wch: 15 },
                { wch: 10 },
                { wch: 30 },
                { wch: 10 },
                { wch: 20 }
            ];
            ws['!cols'] = wscols;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Laporan Kunjungan");

            // Check if Native Platform
            if (Capacitor.isNativePlatform()) {
                try {
                    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
                    const fileName = `Laporan_Kunjungan_Perpus_${month}.xlsx`;

                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: wbout,
                        directory: Directory.Documents
                    });

                    await Share.share({
                        title: 'Laporan Kunjungan Perpus',
                        text: `Laporan Kunjungan Perpustakaan Bulan ${month}`,
                        url: savedFile.uri,
                        dialogTitle: 'Bagikan Laporan Excel'
                    });
                } catch (e) {
                    console.error('Error saving/sharing file', e);
                    alert('Gagal menyimpan file di HP. Pastikan izin penyimpanan aktif.');
                }
            } else {
                // Web Download
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Laporan_Kunjungan_Perpus_${month}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }

        } catch (error) {
            console.error(error);
            alert('Gagal export laporan');
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
                            <h1 className="text-xl font-bold text-gray-900">Perpustakaan</h1>
                            <p className="text-xs text-gray-500">MTsN 1 Labuhan Batu</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportVisits} className="text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <FileSpreadsheet size={16} /> Laporan
                        </button>
                        <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Scan & Loan Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Scan Box */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Search size={20} className="text-amber-600" />
                            Cari Siswa
                        </h2>

                        {/* Camera Area */}
                        {scanning ? (
                            <div className="mb-4 relative rounded-lg overflow-hidden bg-black">
                                <div id="reader" className="w-full"></div>
                                <button
                                    onClick={() => setScanning(false)}
                                    className="absolute top-2 right-2 bg-white/20 text-white p-1 rounded-full hover:bg-white/40"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setScanning(true)}
                                className="w-full mb-4 bg-blue-50 text-blue-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                <Camera size={20} />
                                Buka Kamera (Depan)
                            </button>
                        )}

                        <form onSubmit={handleScanSubmit}>
                            <input
                                ref={scanInputRef}
                                type="text"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-lg text-gray-900 placeholder:text-gray-400"
                                placeholder="Scan Kartu / Ketik Nama..."
                            />
                            <button type="submit" className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900">
                                Cari Manual
                            </button>
                        </form>
                    </div>

                    {/* Loan Form */}
                    {student && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200 ring-1 ring-amber-100 animate-in slide-in-from-top-4">
                            <div className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Pengunjung</p>
                                <p className="text-lg font-bold text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-700">{student.class}</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleVisit}
                                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Catat Kunjungan (Baca)
                                </button>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">ATAU PINJAM BUKU</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                                    <input
                                        type="text"
                                        value={bookTitle}
                                        onChange={(e) => setBookTitle(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                                        placeholder="Contoh: Buku Paket IPA Kls 8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 placeholder:text-gray-400"
                                        placeholder="Kondisi buku, dll."
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setStudent(null)}
                                        className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
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
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
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
                                                <td className="p-4 text-gray-700">
                                                    {new Date(loan.borrowDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-medium text-gray-900">{loan.student.name}</p>
                                                    <p className="text-xs text-gray-600">{loan.student.class}</p>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{loan.bookTitle}</td>
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
                                            <td colSpan={5} className="p-12 text-center text-gray-500">
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
