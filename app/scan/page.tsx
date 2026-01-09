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
                                )}
                            </div >
                        </div >
                    </div >
                )}

<div className="text-center text-xs text-gray-600 mt-8">
    MTsN 1 Labuhanbatu Super App
</div>
            </div >
        </div >
    );
}
