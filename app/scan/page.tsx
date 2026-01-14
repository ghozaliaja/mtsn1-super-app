'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { Loader2, CheckCircle, XCircle, Camera, ArrowLeft } from 'lucide-react';

interface ScanResult {
    status: 'success' | 'error';
    message: string;
    student?: {
        name: string;
        class: string;
    };
    time?: string;
}

export default function ScanPage() {
    const router = useRouter();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanning = async () => {
        setScanning(true);
        setResult(null);

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "user" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {
                    // Success callback
                    await handleScan(decodedText);
                },
                (errorMessage) => {
                    // Error callback (ignore for now as it triggers on every frame without QR)
                }
            );
        } catch (err) {
            console.error("Error starting scanner", err);
            setScanning(false);
            setResult({
                status: 'error',
                message: 'Gagal membuka kamera. Pastikan izin kamera diberikan.'
            });
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                setScanning(false);
            } catch (err) {
                console.error("Error stopping scanner", err);
            }
        }
    };

    const handleScan = async (qrCode: string) => {
        if (loading) return;

        // Stop scanning temporarily
        await stopScanning();
        setLoading(true);

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode }),
            });

            const data = await res.json();

            if (res.ok || res.status === 200) { // API returns 200 even for "Already scanned"
                setResult({
                    status: 'success',
                    message: data.message || 'Berhasil Absen!',
                    student: data.student,
                    time: format(new Date(), 'HH:mm')
                });

                // Play success sound
                const audio = new Audio('/success.mp3'); // Assuming file exists, or just ignore
                audio.play().catch(() => { });

            } else {
                setResult({
                    status: 'error',
                    message: data.message || 'Gagal memproses absen'
                });
            }
        } catch (error) {
            setResult({
                status: 'error',
                message: 'Terjadi kesalahan sistem'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setResult(null);
        startScanning();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center relative">
            <button
                onClick={() => router.push('/admin/dashboard')}
                className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={24} />
                <span className="font-medium">Kembali</span>
            </button>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Scan QR Code</h1>
                    <p className="text-gray-400">Arahkan kamera ke kartu siswa</p>
                </div>

                <div className="bg-white rounded-2xl overflow-hidden shadow-xl relative min-h-[300px] flex flex-col items-center justify-center mb-6">
                    {/* Scanner Area */}
                    {!result && (
                        <div id="reader" className={`w-full ${!scanning ? 'hidden' : ''}`}></div>
                    )}

                    {/* Initial State */}
                    {!scanning && !result && !loading && (
                        <div className="p-8 text-center text-gray-800">
                            <Camera size={48} className="mx-auto mb-4 text-blue-500" />
                            <p className="mb-6">Siap untuk memindai</p>
                            <button
                                onClick={startScanning}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Mulai Scan
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 text-gray-800">
                            <Loader2 className="animate-spin mb-2 text-blue-600" size={40} />
                            <p>Memproses...</p>
                        </div>
                    )}

                    {/* Result State */}
                    {result && (
                        <div className="p-8 text-center w-full bg-white text-gray-800">
                            {result.status === 'success' ? (
                                <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                            ) : (
                                <XCircle className="mx-auto mb-4 text-red-500" size={64} />
                            )}

                            <h2 className="text-xl font-bold mb-2">
                                {result.status === 'success' ? 'Berhasil!' : 'Gagal!'}
                            </h2>

                            <p className={`mb-6 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {result.message}
                            </p>

                            {result.student && (
                                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                                    <p className="text-sm text-gray-500">Nama</p>
                                    <p className="font-bold text-lg mb-2">{result.student.name}</p>
                                    <p className="text-sm text-gray-500">Kelas</p>
                                    <p className="font-semibold">{result.student.class}</p>
                                    {result.time && (
                                        <>
                                            <p className="text-sm text-gray-500 mt-2">Waktu</p>
                                            <p className="font-semibold">{result.time}</p>
                                        </>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={resetScan}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Scan Lagi
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center text-xs text-gray-600 mt-8">
                    MTsN 1 Labuhanbatu Super App
                </div>
            </div>
        </div>
    );
}
