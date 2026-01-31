'use client';

import React, { useState, useEffect } from 'react';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';

import { useRouter } from 'next/navigation';
import { Download, Users, FileSpreadsheet, Calendar, Filter, LogOut, Loader2, QrCode, IdCard } from 'lucide-react';
import { format } from 'date-fns';

import { CLASSES } from '../../../lib/constants';

// Dummy Data Types
interface Student {
    id: number;
    name: string;
    class: string;
}

interface AttendanceRecord {
    date: string;
    subuh: boolean;
    dhuha: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
    tahajjud: boolean;
    tarawih?: boolean;
    puasa?: boolean;
    alquran?: boolean;
    timeIn?: string;
    status?: string;
    timeOut?: string;
    statusOut?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { isRamadan } = usePrayerTimes();

    // State
    const [students, setStudents] = useState<Student[]>([]);
    const [classes] = useState(CLASSES); // Updated classes

    const [exportScope, setExportScope] = useState<'student' | 'class'>('class');
    const [exportPeriod, setExportPeriod] = useState<'daily' | 'monthly'>('daily');

    const [selectedClass, setSelectedClass] = useState<string>('VII A');
    const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [viewMode, setViewMode] = useState<'prayer' | 'school'>('prayer');

    const [previewData, setPreviewData] = useState<{ student: Student, record: AttendanceRecord & { timeIn?: string, status?: string } }[]>([]);
    const [mounted, setMounted] = useState(false);

    // Auth State
    const [userRole, setUserRole] = useState<'ADMIN' | 'teacher' | 'WALIKELAS' | null>(null);
    const [userClass, setUserClass] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);



    // Check Auth on Mount
    useEffect(() => {
        const session = localStorage.getItem('userSession');
        if (!session) {
            router.push('/admin/login');
            return;
        }

        try {
            const { role, assignedClass, id } = JSON.parse(session);
            setUserRole(role);
            setUserId(id);

            if ((role === 'teacher' || role === 'WALIKELAS') && assignedClass) {
                setUserClass(assignedClass);
                setSelectedClass(assignedClass);
            }
            setMounted(true);
        } catch (e) {
            localStorage.removeItem('userSession');
            router.push('/admin/login');
        }
    }, [router]);

    // Fetch data when class or date changes
    useEffect(() => {
        if (!mounted) return;

        async function fetchData() {
            try {
                const res = await fetch(`/api/attendance?class=${encodeURIComponent(selectedClass)}&date=${selectedDate}`);
                if (res.ok) {
                    const data = await res.json();
                    setPreviewData(data);

                    // Update students list for dropdown
                    const studentList = data.map((item: any) => item.student);
                    setStudents(studentList);

                    if (studentList.length > 0 && selectedStudentId === 0) {
                        setSelectedStudentId(studentList[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        }
        fetchData();
    }, [selectedClass, selectedDate, mounted]);

    // Helper to generate dummy attendance data (Now returns empty/false)
    const generateDummyAttendance = (studentName: string, date: string): AttendanceRecord => {
        return {
            date,
            subuh: false,
            dhuha: false,
            dzuhur: false,
            ashar: false,
            maghrib: false,
            isya: false,
            tahajjud: false,
            tarawih: false,
            puasa: false,
            alquran: false,
        };
    };

    // State for export loading
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Dynamically import libraries to avoid SSR/Build issues
            const XLSX = (await import('xlsx-js-style')).default || (await import('xlsx-js-style'));
            const { Capacitor } = await import('@capacitor/core');
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const { Share } = await import('@capacitor/share');

            const wb = XLSX.utils.book_new();
            let data: any[] = [];
            let fileName = '';
            let sheetName = '';
            let titleInfo: any[][] = [];

            if (exportScope === 'class') {
                const targetStudents = students.filter(s => s.class === selectedClass);

                if (exportPeriod === 'daily') {
                    // REPORT: Class - Daily
                    fileName = `Rekap_${viewMode === 'school' ? 'Absensi' : 'Ibadah'}_Kelas_${selectedClass}_${selectedDate}.xlsx`;
                    sheetName = `Harian ${selectedClass}`;

                    data = targetStudents.map((s, index) => {
                        // Find record from previewData
                        const studentData = previewData.find(p => p.student.id === s.id);
                        const record = studentData ? studentData.record : generateDummyAttendance(s.name, selectedDate);

                        if (viewMode === 'school') {
                            return {
                                No: index + 1,
                                Nama: s.name,
                                Kelas: s.class,
                                Tanggal: selectedDate,
                                'Jam Masuk': record.timeIn ? format(new Date(record.timeIn), 'HH:mm') : '-',
                                'Status': record.status || 'Belum Hadir'
                            };
                        } else {
                            return {
                                No: index + 1,
                                Nama: s.name,
                                Kelas: s.class,
                                Tanggal: selectedDate,
                                Subuh: record.subuh ? '✓' : '✗',
                                Dhuha: record.dhuha ? '✓' : '✗',
                                Dzuhur: record.dzuhur ? '✓' : '✗',
                                Ashar: record.ashar ? '✓' : '✗',
                                Maghrib: record.maghrib ? '✓' : '✗',
                                Isya: record.isya ? '✓' : '✗',
                                Tahajjud: record.tahajjud ? '✓' : '✗',
                                Tarawih: record.tarawih ? '✓' : '✗',
                                Puasa: record.puasa ? '✓' : '✗',
                                Quran: record.alquran ? '✓' : '✗',
                            };
                        }
                    });

                } else {
                    // REPORT: Class - Monthly
                    fileName = `Rekap_${viewMode === 'school' ? 'Absensi' : 'Ibadah'}_Bulanan_Kelas_${selectedClass}_${selectedMonth}.xlsx`;
                    sheetName = `Bulanan ${selectedClass}`;

                    // Fetch monthly data from API
                    const res = await fetch(`/api/attendance?class=${encodeURIComponent(selectedClass)}&month=${selectedMonth}`);
                    if (!res.ok) throw new Error('Failed to fetch monthly data');
                    const monthlyData = await res.json();

                    if (viewMode === 'school') {
                        // School Attendance Monthly Report
                        const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();

                        data = monthlyData.map((item: any, index: number) => {
                            const s = item.student;
                            const records = item.records || [];

                            const row: any = {
                                No: index + 1,
                                Nama: s.name,
                                Kelas: s.class,
                            };

                            let totalHadir = 0;
                            let totalTerlambat = 0;

                            for (let i = 1; i <= daysInMonth; i++) {
                                const dayDate = `${selectedMonth}-${String(i).padStart(2, '0')}`;
                                const record = records.find((r: any) => r.date === dayDate);

                                let status = '-';
                                if (record) {
                                    if (record.status === 'HADIR') { status = 'H'; totalHadir++; }
                                    else if (record.status === 'TERLAMBAT') { status = 'T'; totalTerlambat++; }
                                }

                                row[String(i)] = status;
                            }

                            row['Total Hadir'] = totalHadir;
                            row['Total Terlambat'] = totalTerlambat;

                            return row;
                        });

                    } else {
                        // Prayer Attendance Monthly Report
                        data = monthlyData.map((item: any, index: number) => {
                            const s = item.student;
                            const records = item.records || [];

                            // Calculate stats
                            let stats = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0, puasa: 0, quran: 0 };
                            records.forEach((r: any) => {
                                if (r.subuh) stats.subuh++;
                                if (r.dzuhur) stats.dzuhur++;
                                if (r.ashar) stats.ashar++;
                                if (r.maghrib) stats.maghrib++;
                                if (r.isya) stats.isya++;
                                if (r.puasa) stats.puasa++;
                                if (r.alquran) stats.quran++;
                            });

                            return {
                                No: index + 1,
                                Nama: s.name,
                                Kelas: s.class,
                                Bulan: selectedMonth,
                                'Total Subuh': stats.subuh,
                                'Total Dzuhur': stats.dzuhur,
                                'Total Ashar': stats.ashar,
                                'Total Maghrib': stats.maghrib,
                                'Total Isya': stats.isya,
                                'Total Puasa': stats.puasa,
                                'Total Quran': stats.quran,
                                'Total Kehadiran': stats.subuh + stats.dzuhur + stats.ashar + stats.maghrib + stats.isya
                            };
                        });
                    }
                }

            } else {
                // SCOPE: Student
                const student = students.find(s => s.id === Number(selectedStudentId));
                if (!student) {
                    alert('Silakan pilih siswa terlebih dahulu');
                    setIsExporting(false);
                    return;
                }

                if (exportPeriod === 'daily') {
                    fileName = `Laporan_${viewMode === 'school' ? 'Absensi' : 'Ibadah'}_Harian_${student.name.replace(/\s+/g, '_')}_${selectedDate}.xlsx`;
                    sheetName = 'Laporan Harian';

                    // Add Header Info
                    titleInfo = [
                        [`Laporan ${viewMode === 'school' ? 'Kehadiran' : 'Ibadah'} Harian Siswa MTsN 1 Labuhanbatu`],
                        [`Nama : ${student.name}`],
                        [`Kelas : ${student.class}`],
                        [''] // Spacer
                    ];

                    // Find record from previewData
                    const studentData = previewData.find(p => p.student.id === student.id);
                    const record = studentData ? studentData.record : generateDummyAttendance(student.name, selectedDate);

                    if (viewMode === 'school') {
                        data = [{
                            Tanggal: selectedDate,
                            'Jam Masuk': record.timeIn ? format(new Date(record.timeIn), 'HH:mm') : '-',
                            'Status': record.status || 'Belum Hadir'
                        }];
                    } else {
                        data = [{
                            Tanggal: selectedDate,
                            Subuh: record.subuh ? 'Hadir' : 'Tidak',
                            Dhuha: record.dhuha ? 'Hadir' : 'Tidak',
                            Dzuhur: record.dzuhur ? 'Hadir' : 'Tidak',
                            Ashar: record.ashar ? 'Hadir' : 'Tidak',
                            Maghrib: record.maghrib ? 'Hadir' : 'Tidak',
                            Isya: record.isya ? 'Hadir' : 'Tidak',
                            Tahajjud: record.tahajjud ? 'Hadir' : 'Tidak',
                            Tarawih: record.tarawih ? 'Hadir' : 'Tidak',
                            Puasa: record.puasa ? 'Ya' : 'Tidak',
                            Quran: record.alquran ? 'Ya' : 'Tidak',
                        }];
                    }

                } else {
                    // REPORT: Student - Monthly
                    fileName = `Laporan_${viewMode === 'school' ? 'Absensi' : 'Ibadah'}_Bulanan_${student.name.replace(/\s+/g, '_')}_${selectedMonth}.xlsx`;
                    sheetName = 'Laporan Bulanan';

                    // Format Month Year
                    const [year, month] = selectedMonth.split('-');
                    const monthNames = [
                        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                    ];
                    const monthName = monthNames[parseInt(month) - 1];
                    const formattedMonth = `${monthName} ${year}`;

                    // Add Header Info
                    titleInfo = [
                        [`Laporan ${viewMode === 'school' ? 'Kehadiran' : 'Ibadah'} Bulanan Siswa MTsN 1 Labuhanbatu`],
                        [`Nama : ${student.name}`],
                        [`Kelas : ${student.class}`],
                        [`Bulan : ${formattedMonth}`],
                        [''] // Spacer
                    ];

                    // Fetch monthly data for student
                    const res = await fetch(`/api/attendance?studentId=${student.id}&month=${selectedMonth}`);
                    if (!res.ok) throw new Error('Failed to fetch monthly data');
                    const records = await res.json();

                    const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();

                    for (let i = 1; i <= daysInMonth; i++) {
                        const dayDate = `${selectedMonth}-${String(i).padStart(2, '0')}`;
                        // Find record for this date
                        const record = records.find((r: any) => r.date === dayDate) || generateDummyAttendance(student.name, dayDate);

                        if (viewMode === 'school') {
                            data.push({
                                Tanggal: String(i).padStart(2, '0'),
                                'Jam Masuk': record.timeIn ? format(new Date(record.timeIn), 'HH:mm') : '-',
                                'Status': record.status || '-'
                            });
                        } else {
                            data.push({
                                Tgl: String(i).padStart(2, '0'),
                                Sbh: record.subuh ? 'v' : '',
                                Dha: record.dhuha ? 'v' : '',
                                Dzhr: record.dzuhur ? 'v' : '',
                                Ashr: record.ashar ? 'v' : '',
                                Magh: record.maghrib ? 'v' : '',
                                Isya: record.isya ? 'v' : '',
                                Tahaj: record.tahajjud ? 'v' : '',
                                Tarw: record.tarawih ? 'v' : '',
                                Psa: record.puasa ? 'v' : '',
                                Qrn: record.alquran ? 'v' : '',
                                Ket: ''
                            });
                        }
                    }
                }
            }

            // Determine start row for data (A1 is 0)
            const origin = titleInfo.length > 0 ? `A${titleInfo.length + 1}` : 'A1';
            const ws = XLSX.utils.json_to_sheet(data, { origin } as any);

            // Add Titles if any
            if (titleInfo.length > 0) {
                XLSX.utils.sheet_add_aoa(ws, titleInfo, { origin: 'A1' });
                // Style Title
                if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14 } };
                if (ws['A2']) ws['A2'].s = { font: { bold: true, sz: 11 } };
                if (ws['A3']) ws['A3'].s = { font: { bold: true, sz: 11 } };
                if (ws['A4']) ws['A4'].s = { font: { bold: true, sz: 11 } };
            }

            // Set Column Widths (Fit to Header Text - Optimized for A4)
            let colWidths = [];
            if (viewMode === 'school' && exportPeriod === 'monthly') {
                colWidths = [
                    { wch: 5 },  // No
                    { wch: 30 }, // Nama
                    { wch: 10 }, // Kelas
                    // Days 1-31
                    ...Array(31).fill({ wch: 3 }),
                    { wch: 10 }, // Total Hadir
                    { wch: 10 }, // Total Terlambat
                ];
            } else if (viewMode === 'school') {
                colWidths = [
                    { wch: 5 },  // No
                    { wch: 30 }, // Nama
                    { wch: 10 }, // Kelas
                    { wch: 15 }, // Tanggal
                    { wch: 15 }, // Jam Masuk
                    { wch: 15 }, // Status
                ];
            } else {
                colWidths = [
                    { wch: 5 },  // Tgl
                    { wch: 5 },  // Sbh
                    { wch: 5 },  // Dha
                    { wch: 5 },  // Dzhr
                    { wch: 5 },  // Ashr
                    { wch: 6 },  // Magh
                    { wch: 5 },  // Isya
                    { wch: 6 },  // Tahaj
                    { wch: 6 },  // Tarw
                    { wch: 5 },  // Psa
                    { wch: 5 },  // Qrn
                    { wch: 5 },  // Ket
                ];
            }
            ws['!cols'] = colWidths;

            // Apply Styles (Border & Font 11) to Data Range
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
            // Start applying styles from the data header row (after titleInfo)
            const dataStartRow = titleInfo.length > 0 ? titleInfo.length : 0;

            for (let R = dataStartRow; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cell_address]) continue;

                    // Default Style
                    ws[cell_address].s = {
                        font: { sz: 11, name: "Calibri" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        },
                        alignment: { horizontal: "center", vertical: "center" }
                    };

                    // Header Row Style (Bold)
                    if (R === dataStartRow) {
                        ws[cell_address].s.font.bold = true;
                        ws[cell_address].s.fill = { fgColor: { rgb: "EEEEEE" } };
                    }
                }
            }

            // Add Signature Block (Only for monthly reports or if titleInfo exists)
            if (titleInfo.length > 0) {
                XLSX.utils.sheet_add_aoa(ws, [
                    [''],
                    ['', '', '', '', '', '', '', 'Mengetahui,'],
                    ['', '', '', '', '', '', '', 'Wali Murid'],
                    [''],
                    [''],
                    [''],
                    ['', '', '', '', '', '', '', '(_____________________)']
                ], { origin: -1 });
            }

            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Check if Native Platform
            if (Capacitor.isNativePlatform()) {
                try {
                    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: wbout,
                        directory: Directory.Cache
                    });

                    await Share.share({
                        title: 'Download Excel',
                        text: `Berikut adalah file ${fileName}`,
                        url: savedFile.uri,
                        dialogTitle: 'Simpan atau Bagikan Excel'
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
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Gagal mengexport Excel. Silakan coba lagi.');
        } finally {
            setIsExporting(false);
        }
    };

    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (!confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data absensi HARI INI? Tindakan ini tidak dapat dibatalkan.')) return;

        setIsResetting(true);
        try {
            const res = await fetch('/api/attendance/reset', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                alert(`Berhasil! ${data.count} data absensi hari ini telah dihapus.`);
                window.location.reload(); // Reload to refresh data
            } else {
                alert('Gagal mereset data: ' + data.message);
            }
        } catch (error) {
            console.error('Reset error:', error);
            alert('Terjadi kesalahan sistem saat reset data.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        router.push('/');
    };



    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Dashboard {userRole === 'ADMIN' ? 'Admin' : `Guru Kelas ${userClass}`}
                    </h1>
                    <p className="text-gray-500">Absen Sholat MTsN 1 Labuhan Batu</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {userRole === 'ADMIN' && (
                        <>
                            <button onClick={() => router.push('/scan')} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm text-sm"><QrCode size={16} /> Scan</button>
                            <button onClick={() => router.push('/admin/id-cards')} className="flex items-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm text-sm"><IdCard size={16} /> ID Cards</button>
                            <button onClick={() => router.push('/admin/students')} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm text-sm"><Users size={16} /> Siswa</button>
                            <button onClick={handleReset} disabled={isResetting} className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm text-sm">
                                {isResetting ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} className="rotate-180" />} Reset Hari Ini
                            </button>
                        </>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"><LogOut size={16} /> Logout</button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users size={24} /></div>
                    <div><p className="text-sm text-gray-500">Total Siswa</p><p className="text-2xl font-bold text-gray-800">{students.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600"><FileSpreadsheet size={24} /></div>
                    <div><p className="text-sm text-gray-500">Kehadiran Hari Ini</p><p className="text-2xl font-bold text-gray-800">{students.length > 0 ? Math.round((previewData.filter(({ record }) => record.subuh || record.dhuha || record.dzuhur || record.ashar || record.maghrib || record.isya || record.tahajjud || record.tarawih).length / students.length) * 100) : 0}%</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Calendar size={24} /></div>
                    <div><p className="text-sm text-gray-500">Tanggal</p><p className="text-lg font-bold text-gray-800">{format(new Date(selectedDate), 'dd MMMM yyyy')}</p></div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={userRole === 'teacher' || userRole === 'WALIKELAS'} className="w-full md:w-48 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500">
                                {classes.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full md:w-48 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode Tampilan</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode('prayer')} className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'prayer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Sholat</button>
                                <button onClick={() => setViewMode('school')} className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'school' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Sekolah</button>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleExport} disabled={isExporting} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {isExporting ? <><Loader2 size={20} className="animate-spin" /> Generating Excel...</> : <><Download size={20} /> Download Excel</>}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50"><h2 className="text-lg font-semibold text-gray-800">Preview Data Hari Ini</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-800 font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 sticky left-0 bg-gray-100 z-10">Nama</th>
                                <th className="p-4">Kelas</th>
                                {viewMode === 'prayer' ? (
                                    <>
                                        <th className="p-4 text-center">Tahajjud</th>
                                        <th className="p-4 text-center">Subuh</th>
                                        <th className="p-4 text-center">Dhuha</th>
                                        <th className="p-4 text-center">Dzuhur</th>
                                        <th className="p-4 text-center">Ashar</th>
                                        <th className="p-4 text-center">Maghrib</th>
                                        <th className="p-4 text-center">Isya</th>
                                        {isRamadan && <th className="p-4 text-center">Tarawih</th>}
                                        {isRamadan && <th className="p-4 text-center">Puasa</th>}
                                        {isRamadan && <th className="p-4 text-center">Tadarus</th>}
                                    </>
                                ) : (
                                    <>
                                        <th className="p-4">Jam Masuk</th>
                                        <th className="p-4">Status Masuk</th>
                                        <th className="p-4">Jam Pulang</th>
                                        <th className="p-4">Status Pulang</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((student) => {
                                const record = previewData.find(d => d.student.id === student.id)?.record || {} as any;
                                return (
                                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">{student.name}</td>
                                        <td className="p-4">{student.class}</td>

                                        {viewMode === 'prayer' ? (
                                            <>
                                                <td className="p-4 text-center">{record.tahajjud ? '✅' : '-'}</td>
                                                <td className="p-4 text-center">{record.subuh ? '✅' : '-'}</td>
                                                <td className="p-4 text-center">{record.dhuha ? '✅' : '-'}</td>
                                                <td className="p-4 text-center">{record.dzuhur ? '✅' : '-'}</td>
                                                <td className="p-4 text-center">{record.ashar ? '✅' : '-'}</td>
                                                <td className="p-4 text-center">{record.maghrib ? '✅' : '-'}</td>
                                                <td className="p-4 text-center">{record.isya ? '✅' : '-'}</td>
                                                {isRamadan && <td className="p-4 text-center">{record.tarawih ? '✅' : '-'}</td>}
                                                {isRamadan && <td className="p-4 text-center">{record.puasa ? '✅' : '-'}</td>}
                                                {isRamadan && <td className="p-4 text-center">{record.alquran ? '✅' : '-'}</td>}
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4">{record.timeIn || '-'}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' : record.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{record.status || '-'}</span></td>
                                                <td className="p-4">{record.timeOut || '-'}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${record.statusOut === 'LATE' ? 'bg-yellow-100 text-yellow-700' : record.statusOut === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{record.statusOut || '-'}</span></td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}
