'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { Loader2, CheckCircle, XCircle, Camera } from 'lucide-react';

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
    const [lastResult, setLastResult] = useState<ScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isScannerReady, setIsScannerReady] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        const startScanner = async () => {
            try {
                const scanner = new Html5Qrcode("reader");
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "user" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    onScanSuccess,
                    onScanFailure
                );
                setIsScannerReady(true);
            } catch (err) {
                console.error("Error starting scanner", err);
                setCameraError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (isProcessing.current) return;

        isProcessing.current = true;
        setIsLoading(true);

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode: decodedText }),
            });

            const data = await res.json();

            if (res.ok) {
                setLastResult({
                    status: 'success',
                    message: 'Absensi Berhasil!',
                    student: data.student,
                    time: format(new Date(), 'HH:mm:ss')
                });
                speakGreeting(data.student.name);
            } else {
                setLastResult({
                    status: 'error',
                    message: data.message || 'Gagal memproses absensi',
                });
                playSound('error');
            }
        } catch (error) {
            setLastResult({
                status: 'error',
                message: 'Terjadi kesalahan koneksi',
            });
            playSound('error');
        } finally {
            setIsLoading(false);
            // Delay before next scan
            setTimeout(() => {
                isProcessing.current = false;
            }, 3000);
        }
    };

    const onScanFailure = (error: any) => {
        // ignore
    };

    const speakGreeting = (name: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Terima kasih, ${name}`);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            playSound('success');
        }
    };

    const playSound = (type: 'success' | 'error') => {
        const audio = new Audio(type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3');
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2 flex flex-col items-center">
                    <img src="/logo_kemenag.png" alt="Logo" className="w-20 h-auto mb-2" />
                    <h1 className="text-2xl font-bold text-green-400">Absensi Siswa</h1>
                    <p className="text-gray-400">Silakan scan kartu pelajar Anda</p>
                </div>

                {/* Scanner Area */}
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 relative aspect-square bg-black">
                    <div id="reader" className="w-full h-full"></div>

                    {!isScannerReady && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                            <Camera className="w-12 h-12 mb-2 animate-pulse" />
                            <p>Memuat Kamera...</p>
                        </div>
                    )}

                    {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center">
                            <XCircle className="w-12 h-12 mb-2" />
                            <p>{cameraError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Result Display */}
                {lastResult && (
                    <div className={`p-6 rounded-xl border-l-4 shadow-lg transition-all transform duration-500 ${lastResult.status === 'success'
                            ? 'bg-green-900/50 border-green-500'
                            : 'bg-red-900/50 border-red-500'
                        }`}>
                        <div className="flex items-start gap-4">
                            {lastResult.status === 'success' ? (
                                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                            )}

                            <div className="space-y-1">
                                <h3 className={`text-lg font-bold ${lastResult.status === 'success' ? 'text-green-300' : 'text-red-300'
                                    }`}>
                                    {lastResult.message}
                                </h3>

                                {lastResult.student && (
                                    <div className="mt-2 text-white">
                                        <p className="text-2xl font-bold">{lastResult.student.name}</p>
                                        <p className="text-gray-300">{lastResult.student.class}</p>
                                        <p className="text-sm text-gray-400 mt-1">Waktu: {lastResult.time}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center text-xs text-gray-600 mt-8">
                    MTsN 1 Labuhanbatu Super App
                </div>
            </div>
        </div>
    );
}
