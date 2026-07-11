'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, GraduationCap } from 'lucide-react';

interface AlumniStudent {
    id: number;
    name: string;
    nisn: string | null;
    class: string;
    graduationYear: number | null;
}

export default function AlumniPage() {
    const router = useRouter();
    const [alumni, setAlumni] = useState<AlumniStudent[]>([]);
    const [filtered, setFiltered] = useState<AlumniStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [years, setYears] = useState<number[]>([]);

    useEffect(() => {
        fetch('/api/students?class=ALUMNI')
            .then(res => res.json())
            .then((data: AlumniStudent[]) => {
                setAlumni(data);
                setFiltered(data);
                // Extract unique years
                const uniqueYears = Array.from(
                    new Set(data.map(s => s.graduationYear).filter(Boolean) as number[])
                ).sort((a, b) => b - a);
                setYears(uniqueYears);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        let result = alumni;

        if (selectedYear !== 'all') {
            result = result.filter(s => s.graduationYear === parseInt(selectedYear));
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) || (s.nisn || '').includes(q)
            );
        }

        setFiltered(result);
    }, [search, selectedYear, alumni]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/admin/students')}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap size={28} className="text-amber-600" />
                        Daftar Alumni
                    </h1>
                    <p className="text-sm text-gray-500">{alumni.length} alumni terdaftar</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau NISN..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                </div>
                {/* Year Filter */}
                <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                    <option value="all">Semua Angkatan</option>
                    {years.map(y => (
                        <option key={y} value={String(y)}>Lulus {y}</option>
                    ))}
                    <option value="0">Tahun Tidak Diketahui</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Lulus</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Memuat data...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    Tidak ada data alumni{search ? ` untuk "${search}"` : ''}.
                                </td>
                            </tr>
                        ) : filtered.map((student, index) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{student.nisn || '-'}</td>
                                <td className="px-6 py-4">
                                    {student.graduationYear ? (
                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                                            Lulus {student.graduationYear}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Tidak diketahui</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
