'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        // Initialize Scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                videoConstraints: {
                    facingMode: "user"
                }
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
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
                // Speak Greeting
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
        // handle scan failure
    };

    const speakGreeting = (name: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Terima kasih, ${name}`);
            utterance.lang = 'id-ID'; // Indonesian
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback to beep if TTS not supported
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
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 relative">
                    <div id="reader" className="w-full"></div>
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
