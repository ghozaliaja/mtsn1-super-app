'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ImportStudentsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

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

                // Map keys to standard format (case insensitive)
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
                setUploadResult(null); // Reset previous result
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
                // alert('Import successful!');
                setPreviewData([]); // Clear preview on success
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Import Data Siswa</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">1. Upload File Excel</h2>
                    <button
                        onClick={handleDownloadTemplate}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
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
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
            </div>

            {previewData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">2. Preview Data ({previewData.length} Siswa)</h2>
                    <div className="overflow-x-auto max-h-64">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No HP Ortu</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewData.slice(0, 10).map((student, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.nisn || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.parentPhone || '-'}</td>
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
                        className={`mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
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
                        <div className="mt-2 p-4 bg-red-50 rounded text-sm text-red-700 max-h-40 overflow-y-auto">
                            <p className="font-bold mb-2">Error Detail:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {uploadResult.results.errors.map((err: string, i: number) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={() => setUploadResult(null)}
                        className="mt-4 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                        Upload Lagi
                    </button>
                </div>
            )}
        </div>
    );
}
