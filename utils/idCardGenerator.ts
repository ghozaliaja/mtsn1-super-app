import QRCode from 'qrcode';

interface Student {
    id: number;
    name: string;
    nisn: string | null;
    class: string;
}

export const generateIDCard = async (student: Student, templateSrc: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            // Load Template (Use the CLEAN template by default if passed, or we force it here if needed)
            // But the component passes the path. We should ensure the component passes the clean one.
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = templateSrc;

            await new Promise((r) => { img.onload = r; });

            // Set Canvas Size to match Template
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw Template
            ctx.drawImage(img, 0, 0);

            // NO MASKING NEEDED (We are using a clean template)

            // Generate QR Code
            const qrData = student.nisn || 'INVALID';
            ctx.fillText('NISN', textXLabel, startY + lineHeight);
            ctx.fillText(':', textXColon, startY + lineHeight);

            // NISN Value
            ctx.font = '30px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(student.nisn || '-', textXValue, startY + lineHeight);

            // Class Label
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#1a4d2e';
            ctx.fillText('KELAS', textXLabel, startY + (lineHeight * 2));
            ctx.fillText(':', textXColon, startY + (lineHeight * 2));

            // Class Value
            ctx.font = '30px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(student.class, textXValue, startY + (lineHeight * 2));

            resolve(canvas.toDataURL('image/png'));
        } catch (error) {
            reject(error);
        }
    });
};
