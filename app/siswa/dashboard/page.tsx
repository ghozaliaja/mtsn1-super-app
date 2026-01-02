'use client';

import React, { useState, useEffect } from 'react';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import PrayerItem from '../../components/PrayerItem';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, MapPin, LogOut } from 'lucide-react';

export default function StudentDashboard() {
    const router = useRouter();
    const { prayerTimes, isRamadan, loading, error, city } = usePrayerTimes();
    const [statuses, setStatuses] = useState<Record<string, boolean>>({});
    const [currentTime, setCurrentTime] = useState<string>('');
    const [student, setStudent] = useState<{ name: string; class: string } | null>(null);

    useEffect(() => {
        const storedStudent = localStorage.getItem('studentData');
        if (storedStudent) {
            setStudent(JSON.parse(storedStudent));
        } else {
            // Redirect to login if no student data found
            router.push('/siswa/login');
        }
    }, [router]);

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

    const toggleStatus = (id: string) => {
        setStatuses(prev => ({ ...prev, [id]: !prev[id] }));
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
