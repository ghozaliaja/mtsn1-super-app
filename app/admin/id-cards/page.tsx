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
                const today = new Date().toISOString().split('T')[0];
                const res = await fetch(`/api/attendance?class=${encodeURIComponent(selectedClass)}&date=${today}`);
                if (res.ok) {
                    const data = await res.json();
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
                    // Use the CLEAN template
                    const dataUrl = await generateIDCard(student, '/assets/idcard/front_clean.png');
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
        <div className="min-h-screen bg-slate-900 p-8 font-sans text-slate-100">
            <header className="mb-8 border-b border-slate-800 pb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Generate ID Cards</h1>
                <p className="text-slate-400 mt-2">Preview dan Download Kartu Identitas Siswa</p>
            </header>

            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Kelas</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                        >
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="w-full md:w-auto">
                        <button
                            onClick={handleDownloadAll}
                            disabled={downloading || students.length === 0}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${downloading
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/20'
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
                <div className="lg:col-span-1 bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Eye size={18} className="text-blue-400" />
                            Daftar Siswa ({students.length})
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                                <Loader2 size={24} className="animate-spin" />
                                Loading...
                            </div>
                        ) : (
                            students.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setPreviewStudent(student)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all ${previewStudent?.id === student.id
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                            : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                                        }`}
                                >
                                    <span className="font-medium truncate text-sm">{student.name}</span>
                                    {previewStudent?.id === student.id && <div className="w-2 h-2 rounded-full bg-blue-400"></div>}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2">
                    {previewStudent ? (
                        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8 sticky top-8 flex flex-col items-center">
                            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-700 w-full text-center">
                                Preview: <span className="text-blue-400">{previewStudent.name}</span>
                            </h2>
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
                                <IDCardPreview student={previewStudent} />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 p-12 text-center h-full flex flex-col items-center justify-center text-slate-500">
                            <Eye size={48} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">Pilih siswa untuk melihat preview ID Card</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
