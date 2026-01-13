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

            // Draw QR Code (Adjust coordinates based on design)
            // Assuming design: QR code is at the bottom center or specific box
            // Let's approximate based on typical ID cards, user can adjust
            // Based on previous artifacts, let's place it at:
            // x: 730, y: 350 (Approximate for landscape ID card right side)
            // Need to verify coordinates with user or trial/error. 
            // For now, I'll put it in a reasonable spot.
            // Looking at the artifact `id_card_front_updated...png` (I can't see it now but I recall it).
            // Let's assume a standard position.

            // COORD CONFIGURATION (To be tweaked)
            const qrX = 80;
            const qrY = 280;
            const qrSize = 280;

            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // Draw Text
            ctx.font = 'bold 42px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';

            // Name
            ctx.fillText(student.name.toUpperCase(), 400, 360);

            // NISN
            ctx.font = '36px Arial';
            ctx.fillText(`NISN: ${student.nisn || '-'}`, 400, 430);

            // Class
            ctx.fillText(`Kelas: ${student.class}`, 400, 490);

            resolve(canvas.toDataURL('image/png'));
        } catch (error) {
            reject(error);
        }
    });
};
