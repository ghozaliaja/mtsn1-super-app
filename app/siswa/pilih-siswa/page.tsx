'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function StudentSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const className = searchParams.get('kelas');
    const [students, setStudents] = useState<{ id: number; name: string; class: string; nis: string | null }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!className) {
            router.push('/siswa/login');
            return;
        }

        // Fetch students
        const fetchStudents = async () => {
            try {
                const res = await fetch(`/api/students?class=${encodeURIComponent(className)}`);
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

        fetchStudents();
    }, [className, router]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectStudent = (student: any) => {
        // Store student info in localStorage
        localStorage.setItem('studentData', JSON.stringify(student));
        router.push('/siswa/dashboard');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/siswa/login" className="mr-4 text-gray-600">
                        <ArrowLeft />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Pilih Nama Siswa</h1>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <p className="text-sm text-gray-500 mb-1">Kelas</p>
                    <p className="text-lg font-semibold text-blue-600">{className}</p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama anda..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {filteredStudents.map((student) => (
                        <button
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="bg-gray-100 p-2 rounded-full mr-4">
                                <User size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.nis || 'No NIS'}</p>
                            </div>
                        </button>
                    ))}
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nama tidak ditemukan
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SelectStudentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <StudentSelectionContent />
        </Suspense>
    );
}
