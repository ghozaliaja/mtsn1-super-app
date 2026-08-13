'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { CLASSES } from '@/lib/constants';

interface ManualForm {
    name: string;
    nisn: string;
    class: string;
    parentPhone: string;
}

const EMPTY_FORM: ManualForm = { name: '', nisn: '', class: '', parentPhone: '' };

export default function ImportStudentsPage() {
    const router = useRouter();

    // --- Excel Import State ---
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

    // --- Manual Entry State ---
    const [form, setForm] = useState<ManualForm>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [savedStudent, setSavedStudent] = useState<any>(null);
    const [manualError, setManualError] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);

    // ---- Excel Handlers ----
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(sheet);

                const formattedData = parsedData.map((row: any) => {
                    const newRow: any = {};
                    Object.keys(row).forEach(key => {
                        const lowerKey = key.toLowerCase().trim();
                        if (lowerKey.includes('nisn')) newRow.nisn = row[key];
                        else if (lowerKey.includes('nama') || lowerKey.includes('name')) newRow.name = row[key];
                        else if (lowerKey.includes('kelas') || lowerKey.includes('class')) newRow.class = row[key];
                        else if (lowerKey.includes('hp') || lowerKey.includes('phone') || lowerKey.includes('wa')) newRow.parentPhone = row[key];
                    });
                    return newRow;
                });

                setPreviewData(formattedData);
                setUploadResult(null);
            } catch (error) {
                console.error("Error parsing excel:", error);
                alert("Gagal membaca file Excel. Pastikan format benar.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDownloadTemplate = () => {
        const template = [
            { "NISN": "1234567890", "Nama": "Contoh Siswa", "Kelas": "VII A", "No HP Orang Tua": "081234567890" }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
    };

    const handleUpload = async () => {
        if (!previewData.length) return;
        setIsUploading(true);
        try {
            const response = await fetch('/api/students/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: previewData }),
            });
            const result = await response.json();
            setUploadResult(result);
            if (response.ok) {
                setPreviewData([]);
                setFile(null);
            } else {
                alert('Import failed: ' + result.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    // ---- Manual Entry Handlers ----
    const handleManualSave = async () => {
        setManualError('');
        if (!form.name.trim()) { setManualError('Nama siswa wajib diisi.'); return; }
        if (!form.class) { setManualError('Kelas wajib dipilih.'); return; }

        setIsSaving(true);
        try {
            const response = await fetch('/api/students/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: [form] }),
            });
            const result = await response.json();
            if (response.ok && result.results?.success > 0) {
                setSavedStudent(form);
                setForm(EMPTY_FORM);
            } else {
                const errMsg = result.results?.errors?.[0] || result.error || 'Gagal menyimpan siswa.';
                setManualError(errMsg);
            }
        } catch {
            setManualError('Terjadi kesalahan sistem.');
        } finally {
            setIsSaving(false);
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
                <h1 className="text-2xl font-bold">Import Data Siswa</h1>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setIsManualMode(false)}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition ${!isManualMode ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                    📂 Import Excel (Massal)
                </button>
                <button
                    onClick={() => setIsManualMode(true)}
                    className={`flex items-center gap-1 px-5 py-2 rounded-lg font-medium text-sm transition ${isManualMode ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                    <UserPlus size={15} />
                    Tambah Siswa Manual
                </button>
            </div>

            {/* ===== EXCEL IMPORT ===== */}
            {!isManualMode && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">1. Upload File Excel</h2>
                            <button onClick={handleDownloadTemplate} className="text-sm text-blue-600 hover:text-blue-800 underline">
                                Download Template Excel
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Pastikan file Excel memiliki kolom: <strong>NISN, Nama, Kelas, No HP Orang Tua</strong>.
                        </p>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {previewData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h2 className="text-lg font-semibold mb-4">2. Preview Data ({previewData.length} Siswa)</h2>
                            <div className="overflow-x-auto max-h-64">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No HP Ortu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewData.slice(0, 10).map((student, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{student.class}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{student.nisn || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{student.parentPhone || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.length > 10 && (
                                    <p className="text-center text-sm text-gray-500 mt-2">...dan {previewData.length - 10} siswa lainnya</p>
                                )}
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className={`mt-4 w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white ${isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isUploading ? 'Sedang Memproses...' : 'Import Sekarang'}
                            </button>
                        </div>
                    )}

                    {uploadResult && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-2">Hasil Import</h2>
                            <div className="flex gap-4 mb-4">
                                <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
                                    <span className="font-bold text-xl">{uploadResult.results.success}</span> Berhasil
                                </div>
                                <div className="bg-red-100 text-red-800 px-4 py-2 rounded">
                                    <span className="font-bold text-xl">{uploadResult.results.failed}</span> Gagal
                                </div>
                            </div>
                            {uploadResult.results.errors.length > 0 && (
                                <div className="p-4 bg-red-50 rounded text-sm text-red-700 max-h-40 overflow-y-auto">
                                    <p className="font-bold mb-2">Error Detail:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {uploadResult.results.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                            <button onClick={() => setUploadResult(null)} className="mt-4 text-blue-600 text-sm underline">Upload Lagi</button>
                        </div>
                    )}
                </>
            )}

            {/* ===== MANUAL ENTRY ===== */}
            {isManualMode && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-1">Tambah Siswa Pindahan / Baru</h2>
                    <p className="text-sm text-gray-500 mb-6">QR Code absen akan dibuat otomatis setelah data tersimpan.</p>

                    {savedStudent && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-start gap-3">
                            <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={22} />
                            <div>
                                <p className="font-semibold text-green-800">Siswa berhasil ditambahkan!</p>
                                <p className="text-sm text-green-700 mt-1">
                                    <strong>{savedStudent.name}</strong> ({savedStudent.class}) sudah masuk ke sistem.
                                    Kartu QR tersedia di menu <strong>Cetak ID Card</strong>.
                                </p>
                                <button onClick={() => setSavedStudent(null)} className="mt-2 text-xs text-green-600 underline">
                                    Tambah Siswa Lagi
                                </button>
                            </div>
                        </div>
                    )}

                    {!savedStudent && (
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Ahmad Fathoni"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kelas <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.class}
                                    onChange={e => setForm({ ...form, class: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {CLASSES.filter(c => c !== 'TEST').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                                <input
                                    type="text"
                                    placeholder="Opsional"
                                    value={form.nisn}
                                    onChange={e => setForm({ ...form, nisn: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No HP Orang Tua / Wali</label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 081234567890 (Opsional)"
                                    value={form.parentPhone}
                                    onChange={e => setForm({ ...form, parentPhone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            {manualError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{manualError}</p>
                            )}

                            <button
                                onClick={handleManualSave}
                                disabled={isSaving}
                                className={`w-full py-3 rounded-lg font-semibold text-white text-sm transition ${isSaving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isSaving ? 'Menyimpan...' : '✅ Simpan & Buat QR Otomatis'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
