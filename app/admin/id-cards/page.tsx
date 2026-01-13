'use client';

import React, { useState, useEffect } from 'react';
import { CLASSES } from '../../../lib/constants';
import IDCardPreview from '../../../components/admin/IDCardPreview';
import { generateIDCard } from '../../../utils/idCardGenerator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, Eye, Loader2 } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    nisn: string | null;
    class: string;
}

export default function AdminIDCardsPage() {
    const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Fetch students when class changes
    useEffect(() => {
        async function fetchStudents() {
            setLoading(true);
            try {
                // Reuse existing API or create a new one?
                // We can use /api/attendance?class=... but it returns attendance records.
                // Better to have a dedicated endpoint or just filter from a general student list.
                // Let's try to use the existing /api/attendance endpoint for now as it returns student data.
                // Or better, let's assume we might need a simple student list endpoint.
                // Actually, let's use the same pattern as dashboard: fetch by class.
                // Wait, /api/attendance requires a date.
                // Let's check if we have a pure student endpoint.
                // If not, I might need to create one or use a workaround.
                // Workaround: Use /api/attendance with today's date.
                const today = new Date().toISOString().split('T')[0];
                const res = await fetch(`/api/attendance?class=${encodeURIComponent(selectedClass)}&date=${today}`);
                if (res.ok) {
                    const data = await res.json();
                    // Extract student objects from the response
                    const studentList = data.map((item: any) => item.student);
                    setStudents(studentList);
                }
            } catch (error) {
                console.error('Failed to fetch students', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, [selectedClass]);

    const handleDownloadAll = async () => {
        setDownloading(true);
        setProgress(0);
        try {
            const zip = new JSZip();
            const folder = zip.folder(`ID_Cards_${selectedClass}`);

            if (!folder) throw new Error('Failed to create zip folder');

            const total = students.length;
            let completed = 0;

            for (const student of students) {
                try {
                    const dataUrl = await generateIDCard(student, '/assets/idcard/front.png');
                    // Remove data:image/png;base64, prefix
                    const base64Data = dataUrl.split(',')[1];
                    folder.file(`${student.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`, base64Data, { base64: true });
                } catch (e) {
                    console.error(`Failed to generate for ${student.name}`, e);
                }

                completed++;
                setProgress(Math.round((completed / total) * 100));
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `ID_Cards_${selectedClass}.zip`);

        } catch (error) {
            console.error('Failed to download zip', error);
            alert('Gagal mendownload ZIP.');
        } finally {
            setDownloading(false);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Generate ID Cards</h1>
                <p className="text-gray-500">Preview dan Download Kartu Identitas Siswa</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="w-full md:w-auto">
                        <button
                            onClick={handleDownloadAll}
                            disabled={downloading || students.length === 0}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${downloading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow'
                                }`}
                        >
                            {downloading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating ({progress}%)
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Download ZIP ({students.length} Siswa)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Daftar Siswa ({students.length})</h2>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto p-2">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading...</div>
                        ) : (
                            <div className="space-y-1">
                                {students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => setPreviewStudent(student)}
                                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${previewStudent?.id === student.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <span className="font-medium truncate">{student.name}</span>
                                        <Eye size={16} className={previewStudent?.id === student.id ? 'text-blue-500' : 'text-gray-300'} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2">
                    {previewStudent ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                                Preview: {previewStudent.name}
                            </h2>
                            <IDCardPreview student={previewStudent} />
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center h-full flex flex-col items-center justify-center text-gray-400">
                            <Eye size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">Pilih siswa untuk melihat preview ID Card</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
