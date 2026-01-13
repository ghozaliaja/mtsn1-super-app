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

            // Load Template
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = templateSrc;

            await new Promise((r) => { img.onload = r; });

            // Set Canvas Size to match Template
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw Template
            ctx.drawImage(img, 0, 0);

            // Generate QR Code
            const qrData = student.nisn || 'INVALID';
            const qrUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 250 });
            const qrImg = new Image();
            qrImg.src = qrUrl;
            await new Promise((r) => { qrImg.onload = r; });

            // Draw Text
            ctx.textAlign = 'center'; // Center alignment
            const centerX = canvas.width / 2;

            // Text Configuration
            // Start below the photo placeholder
            // Assuming photo ends around Y=600 (based on visual estimation of previous attempts)
            let currentY = 620;
            const lineHeight = 50;

            // Name
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#1a4d2e'; // Dark Green Label
            ctx.fillText('NAMA : ' + student.name.toUpperCase(), centerX, currentY);

            // NISN
            currentY += lineHeight;
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#1a4d2e';
            ctx.fillText('NISN : ' + (student.nisn || '-'), centerX, currentY);

            // Class
            currentY += lineHeight;
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#1a4d2e';
            ctx.fillText('KELAS : ' + student.class, centerX, currentY);

            // Draw QR Code
            // Position: Centered at the bottom
            const qrSize = 250;
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = currentY + 40; // Below the text

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            resolve(canvas.toDataURL('image/png'));
        } catch (error) {
            reject(error);
        }
    });
};
