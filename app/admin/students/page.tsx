import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function StudentManagementPage() {
    // Get stats
    const totalStudents = await prisma.student.count();
    const classStats = await prisma.student.groupBy({
        by: ['class'],
        _count: {
            id: true,
        },
        orderBy: {
            class: 'asc',
        },
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manajemen Siswa</h1>

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
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Statistik Siswa ({totalStudents} Total)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {classStats.map((stat) => (
                        <div key={stat.class} className="bg-gray-50 p-4 rounded border text-center">
                            <div className="text-sm text-gray-500 font-medium">{stat.class}</div>
                            <div className="text-2xl font-bold text-gray-800">{stat._count.id}</div>
                            <div className="text-xs text-gray-400">Siswa</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
