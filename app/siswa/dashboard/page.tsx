'use client';

import React, { useState, useEffect } from 'react';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import PrayerItem from '../../components/PrayerItem';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, MapPin, LogOut, Download, X } from 'lucide-react';

export default function StudentDashboard() {
    const router = useRouter();
    const { prayerTimes, isRamadan, loading, error, city } = usePrayerTimes();
    const [statuses, setStatuses] = useState<Record<string, boolean>>({});
    const [currentTime, setCurrentTime] = useState<string>('');
    const [student, setStudent] = useState<{ id: number; name: string; class: string } | null>(null);

    // Export State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportPeriod, setExportPeriod] = useState<'daily' | 'monthly'>('daily');
    const [viewMode, setViewMode] = useState<'prayer' | 'school'>('prayer');
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

    useEffect(() => {
        const storedStudent = localStorage.getItem('studentData');
        if (storedStudent) {
            setStudent(JSON.parse(storedStudent));
        } else {
            // Redirect to login if no student data found
            router.push('/siswa/login');
        }
    }, [router]);

    // Fetch initial attendance from DB
    useEffect(() => {
        if (student) {
            const fetchAttendance = async () => {
                try {
                    const date = format(new Date(), 'yyyy-MM-dd');
                    const res = await fetch(`/api/attendance?studentId=${student.id}&date=${date}`);
                    if (res.ok) {
                        const data = await res.json();
                        setStatuses(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch attendance', error);
                }
            };
            fetchAttendance();
        }
    }, [student]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(format(new Date(), 'HH:mm'));
        }, 1000);
        setCurrentTime(format(new Date(), 'HH:mm'));
        return () => clearInterval(timer);
    }, []);

    const prayers = [
        { id: 'tahajjud', name: 'Sholat Tahajjud', time: '03:00' },
        { id: 'subuh', name: 'Sholat Subuh', time: prayerTimes?.Fajr || '05:00' },
        { id: 'dhuha', name: 'Sholat Dhuha', time: prayerTimes?.Sunrise || '06:30' },
        { id: 'dzuhur', name: 'Sholat Dzuhur', time: prayerTimes?.Dhuhr || '12:30' },
        { id: 'ashar', name: 'Sholat Ashar', time: prayerTimes?.Asr || '15:30' },
        { id: 'maghrib', name: 'Sholat Maghrib', time: prayerTimes?.Maghrib || '18:15' },
        { id: 'isya', name: 'Sholat Isya', time: prayerTimes?.Isha || '19:30' },
        { id: 'alquran', name: 'Baca Al Qur\'an', time: 'Sepanjang hari' },
    ];

    if (isRamadan) {
        prayers.splice(7, 0, { id: 'tarawih', name: 'Sholat Tarawih', time: '20:00' });
        prayers.splice(8, 0, { id: 'puasa', name: 'Puasa', time: 'Sepanjang hari' });
    }

    const isTimePassed = (timeStr: string) => {
        if (timeStr === 'Sepanjang hari') return true;
        if (!timeStr) return false;
        const now = new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);
        return now >= prayerDate;
    };

    const toggleStatus = async (id: string) => {
        const newStatus = !statuses[id];
        setStatuses(prev => ({ ...prev, [id]: newStatus }));

        if (student) {
            try {
                const date = format(new Date(), 'yyyy-MM-dd');
                await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: student.id,
                        date: date,
                        prayer: id,
                        status: newStatus
                    })
                });
            } catch (error) {
                console.error('Failed to save attendance', error);
            }
        }
    };

    const handleExport = async () => {
        if (!student) return;
        setIsExporting(true);
        try {
            // Dynamically import libraries
            const XLSX = (await import('xlsx-js-style')).default || (await import('xlsx-js-style'));
            const { Capacitor } = await import('@capacitor/core');
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const { Share } = await import('@capacitor/share');

            const wb = XLSX.utils.book_new();
            let data: any[] = [];
            let fileName = '';
            let sheetName = '';
            let titleInfo: any[][] = [];

            if (exportPeriod === 'daily') {
                fileName = `Laporan_${viewMode === 'school' ? 'Absensi' : 'Ibadah'}_Harian_${student.name.replace(/\s+/g, '_')}_${selectedDate}.xlsx`;
                sheetName = 'Laporan Harian';

                titleInfo = [
                    [`Laporan ${viewMode === 'school' ? 'Kehadiran' : 'Ibadah'} Harian Siswa MTsN 1 Labuhanbatu`],
                    [`Nama : ${student.name}`],
                    [`Kelas : ${student.class}`],
                    ['']
                ];

                // Fetch daily data specific to selected date
                const res = await fetch(`/api/attendance?studentId=${student.id}&date=${selectedDate}`);
                const record = await res.json(); // returns object with status fields

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
                // MONTHLY
                fileName = `Laporan_${viewMode === 'school' ? 'Absensi' : 'Ibadah'}_Bulanan_${student.name.replace(/\s+/g, '_')}_${selectedMonth}.xlsx`;
                sheetName = 'Laporan Bulanan';

                const [year, month] = selectedMonth.split('-');
                const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const formattedMonth = `${monthNames[parseInt(month) - 1]} ${year}`;

                titleInfo = [
                    [`Laporan ${viewMode === 'school' ? 'Kehadiran' : 'Ibadah'} Bulanan Siswa MTsN 1 Labuhanbatu`],
                    [`Nama : ${student.name}`],
                    [`Kelas : ${student.class}`],
                    [`Bulan : ${formattedMonth}`],
                    ['']
                ];

                const res = await fetch(`/api/attendance?studentId=${student.id}&month=${selectedMonth}`);
                const records = await res.json(); // returns array of records
                const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();

                for (let i = 1; i <= daysInMonth; i++) {
                    const dayDate = `${selectedMonth}-${String(i).padStart(2, '0')}`;
                    const record = records.find((r: any) => r.date === dayDate) || {};

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

            const origin = titleInfo.length > 0 ? `A${titleInfo.length + 1}` : 'A1';
            const ws = XLSX.utils.json_to_sheet(data, { origin } as any);
            if (titleInfo.length > 0) {
                XLSX.utils.sheet_add_aoa(ws, titleInfo, { origin: 'A1' });
                // Simple Header Styling
                ['A1', 'A2', 'A3', 'A4'].forEach(cell => { if (ws[cell]) ws[cell].s = { font: { bold: true } }; });
            }

            // Column Widths
            if (viewMode === 'school') {
                ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
            } else {
                ws['!cols'] = Array(12).fill({ wch: 5 });
            }

            // Add simple borders
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
            const dataStartRow = titleInfo.length > 0 ? titleInfo.length : 0;
            for (let R = dataStartRow; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cell_address]) {
                        ws[cell_address].s = {
                            border: {
                                top: { style: "thin" }, bottom: { style: "thin" },
                                left: { style: "thin" }, right: { style: "thin" }
                            },
                            alignment: { horizontal: "center" }
                        };
                        if (R === dataStartRow) ws[cell_address].s.font = { bold: true };
                    }
                }
            }

            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            if (Capacitor.isNativePlatform()) {
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
                await Filesystem.writeFile({
                    path: fileName,
                    data: wbout,
                    directory: Directory.Cache
                });
                const savedFile = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
                await Share.share({
                    title: 'Download Report',
                    text: `Laporan ${fileName}`,
                    url: savedFile.uri,
                    dialogTitle: 'Bagikan Laporan'
                });
            } else {
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }, 100);
            }

            setIsExportModalOpen(false);
        } catch (e) {
            console.error('Export Error:', e);
            alert('Gagal download laporan. Silakan coba lagi.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('studentData');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">MTsN1 Super App</h1>
                        <p className="text-blue-100 text-sm">Jurnal Ibadah Harian</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleLogout}
                            className="bg-blue-500 hover:bg-blue-400 p-2 rounded-lg transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{currentTime}</div>
                            <div className="text-xs text-blue-200">{format(new Date(), 'dd MMMM yyyy')}</div>
                        </div>
                    </div>
                </div>

                {/* Student Info */}
                <div className="mb-4 bg-blue-700/30 p-3 rounded-xl border border-blue-500/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-100 text-sm">Nama :</span>
                        <span className="font-semibold truncate max-w-[200px]">{student?.name || 'Siswa'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-100 text-sm">Kelas :</span>
                        <span className="font-semibold">{student?.class || '-'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-100 bg-blue-700/50 p-2 rounded-lg backdrop-blur-sm mb-2">
                    <MapPin size={16} />
                    <span>{city}</span>
                </div>

                <div className="text-center">
                    <p className="text-xs text-yellow-200 italic font-medium">
                        "Mohon diisi dengan jujur, karena Allah Maha Melihat"
                    </p>
                </div>
            </header>

            {/* Download Button Section */}
            <div className="px-4 mt-4 mb-2 flex justify-end">
                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Download size={16} />
                    Download Laporan
                </button>
            </div>

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Download Laporan</h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Mode Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('prayer')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'prayer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Ibadah
                                    </button>
                                    <button
                                        onClick={() => setViewMode('school')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'school' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Sekolah
                                    </button>
                                </div>
                            </div>

                            {/* Period Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setExportPeriod('daily')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${exportPeriod === 'daily' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Harian
                                    </button>
                                    <button
                                        onClick={() => setExportPeriod('monthly')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${exportPeriod === 'monthly' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Bulanan
                                    </button>
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {exportPeriod === 'daily' ? 'Pilih Tanggal' : 'Pilih Bulan'}
                                </label>
                                {exportPeriod === 'daily' ? (
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                ) : (
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                )}
                            </div>

                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 mt-2"
                            >
                                {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                {isExporting ? 'Generating...' : 'Download Excel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prayer List */}
            <div className="p-4 -mt-2">
                {prayers.map((prayer) => {
                    const isLocked = prayer.time === 'Sepanjang hari' ? false : !isTimePassed(prayer.time);

                    return (
                        <PrayerItem
                            key={prayer.id}
                            name={prayer.name}
                            time={prayer.time}
                            isLocked={isLocked}
                            isDone={!!statuses[prayer.id]}
                            onToggle={() => toggleStatus(prayer.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
