import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import { CLASSES } from '@/lib/constants';

const prisma = new PrismaClient();

export default async function StudentManagementPage() {
    // Only count active (non-alumni) students
    const totalStudents = await prisma.student.count({
        where: { class: { not: 'ALUMNI' } }
    });

    const classStats = await prisma.student.groupBy({
        by: ['class'],
        _count: { id: true },
    });

    // Build a map from the DB result
    const countMap = new Map<string, number>();
    classStats.forEach(stat => countMap.set(stat.class, stat._count.id));

    // Merge with all predefined classes so empty ones still show up
    const allClassStats = CLASSES.map(cls => ({
        class: cls,
        count: countMap.get(cls) ?? 0,
    }));

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/dashboard"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900 flex items-center justify-center"
                >
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/admin/students/import" className="block">
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg hover:bg-blue-100 transition shadow-sm">
                        <h2 className="text-xl font-semibold text-blue-800 mb-2">📥 Import Data Siswa</h2>
                        <p className="text-blue-600">
                            Upload file Excel untuk menambahkan siswa baru secara massal. Cocok untuk input siswa kelas 7 baru.
                        </p>
                    </div>
                </Link>

                <Link href="/admin/students/promote" className="block">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg hover:bg-green-100 transition shadow-sm">
                        <h2 className="text-xl font-semibold text-green-800 mb-2">🎓 Kenaikan Kelas (Promote)</h2>
                        <p className="text-green-600">
                            Pindahkan siswa dari satu kelas ke kelas lain secara massal. Gunakan ini saat pergantian tahun ajaran.
                        </p>
                    </div>
                </Link>

                <Link href="/admin/students/alumni" className="block md:col-span-2">
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg hover:bg-amber-100 transition shadow-sm">
                        <h2 className="text-xl font-semibold text-amber-800 mb-2">🏅 Daftar Alumni</h2>
                        <p className="text-amber-600">
                            Lihat seluruh data siswa yang telah lulus, lengkap dengan NISN dan tahun kelulusan. Filter per angkatan.
                        </p>
                    </div>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Statistik Siswa Aktif ({totalStudents} Total)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {allClassStats.map((stat) => (
                        <div
                            key={stat.class}
                            className={`p-4 rounded border text-center ${stat.count === 0
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className={`text-sm font-medium ${stat.count === 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                {stat.class}
                            </div>
                            <div className={`text-2xl font-bold ${stat.count === 0 ? 'text-red-300' : 'text-gray-800'}`}>
                                {stat.count}
                            </div>
                            <div className={`text-xs ${stat.count === 0 ? 'text-red-300' : 'text-gray-400'}`}>
                                {stat.count === 0 ? 'Kosong' : 'Siswa'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

