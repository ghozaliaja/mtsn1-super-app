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
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
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
        };
        reader.readAsBinaryString(file);
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
                alert('Import successful!');
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
                <h2 className="text-lg font-semibold mb-4">1. Upload File Excel</h2>
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
                    <p className="text-green-600">Berhasil: {uploadResult.results.success}</p>
                    <p className="text-red-600">Gagal: {uploadResult.results.failed}</p>
                    {uploadResult.results.errors.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            <p className="font-bold">Error Detail:</p>
                            <ul className="list-disc pl-5">
                                {uploadResult.results.errors.slice(0, 5).map((err: string, i: number) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
