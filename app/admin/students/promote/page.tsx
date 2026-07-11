'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CLASSES } from '@/lib/constants';

export default function PromoteStudentsPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<string[]>([]);
    const [sourceClass, setSourceClass] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [isManualSource, setIsManualSource] = useState(false);
    const [isManualTarget, setIsManualTarget] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);

    // Set baseline classes list
    useEffect(() => {
        const classList = [...CLASSES.filter(c => c !== 'TEST'), 'ALUMNI'];
        setClasses(classList);
    }, []);

    // Fetch students when source class changes
    useEffect(() => {
        if (!sourceClass) return;

        setIsLoading(true);
        // We need an endpoint to get students by class. 
        // Assuming GET /api/students?class=XXX exists or we create a simple fetcher here.
        // Since we don't have a dedicated endpoint, let's use a server action or assume one exists.
        // Actually, let's use the existing list_classes logic or similar.
        // Wait, we don't have a generic "get students by class" API yet.
        // Let's create a quick fetcher using the existing /api/scan logic or similar? 
        // No, better to assume we need to fetch. 
        // Let's try fetching from a new endpoint or existing.
        // I'll assume we can filter by class on a general students endpoint.
        // If not, I'll need to create one. Let's assume I need to create one or use a server action.
        // For simplicity, I'll use a direct fetch to a new endpoint: /api/students?class=${sourceClass}

        fetch(`/api/students?class=${encodeURIComponent(sourceClass)}`)
            .then(res => res.json())
            .then(data => {
                const studentList = Array.isArray(data) ? data : (data.students || []);
                setStudents(studentList);
                setSelectedStudents(studentList.map((s: any) => s.id)); // Select all by default
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [sourceClass]);

    const handlePromote = async () => {
        if (!targetClass || selectedStudents.length === 0) return;

        if (!confirm(`Yakin ingin memindahkan ${selectedStudents.length} siswa dari ${sourceClass} ke ${targetClass}?`)) return;

        setIsPromoting(true);
        try {
            const response = await fetch('/api/students/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: selectedStudents,
                    targetClass
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                // Refresh list
                setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
                setSelectedStudents([]);
            } else {
                alert('Gagal: ' + result.error);
            }
        } catch (error) {
            console.error('Promotion error:', error);
            alert('Terjadi kesalahan.');
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/admin/students')}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Kenaikan Kelas (Promote)</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Dari Kelas (Asal)</label>
                        <button
                            type="button"
                            onClick={() => {
                                setIsManualSource(!isManualSource);
                                setSourceClass('');
                            }}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {isManualSource ? 'Pilih dari daftar' : 'Ketik manual'}
                        </button>
                    </div>
                    {isManualSource ? (
                        <input
                            type="text"
                            placeholder="Contoh: VII J"
                            value={sourceClass}
                            onChange={(e) => setSourceClass(e.target.value.toUpperCase())}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        />
                    ) : (
                        <select
                            value={sourceClass}
                            onChange={(e) => setSourceClass(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        >
                            <option value="">Pilih Kelas</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Ke Kelas (Tujuan)</label>
                        <button
                            type="button"
                            onClick={() => {
                                setIsManualTarget(!isManualTarget);
                                setTargetClass('');
                            }}
                            className="text-xs text-green-600 hover:underline"
                        >
                            {isManualTarget ? 'Pilih dari daftar' : 'Ketik manual'}
                        </button>
                    </div>
                    {isManualTarget ? (
                        <input
                            type="text"
                            placeholder="Contoh: VIII J, ALUMNI, dll"
                            value={targetClass}
                            onChange={(e) => setTargetClass(e.target.value.toUpperCase())}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                        />
                    ) : (
                        <select
                            value={targetClass}
                            onChange={(e) => setTargetClass(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                        >
                            <option value="">Pilih Kelas</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {sourceClass && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Daftar Siswa {sourceClass} ({students.length})</h2>
                        <div className="text-sm text-gray-500">
                            {selectedStudents.length} dipilih
                        </div>
                    </div>

                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.length === students.length && students.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedStudents(students.map(s => s.id));
                                                    else setSelectedStudents([]);
                                                }}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedStudents([...selectedStudents, student.id]);
                                                        else setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.nisn || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handlePromote}
                            disabled={isPromoting || !targetClass || selectedStudents.length === 0}
                            className={`py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isPromoting || !targetClass || selectedStudents.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {isPromoting ? 'Memproses...' : 'Pindahkan Siswa'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
