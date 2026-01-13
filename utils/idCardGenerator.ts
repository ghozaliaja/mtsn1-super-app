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

            // MASKING DUMMY TEXT (Hack: Cover existing text with a box)
            // Adjust these coordinates to cover "NAMA : Ahmad Fulan" etc.
            // Assuming the background is white/light in that area.
            // We need to pick the color from the image or assume white.
            // Let's assume the text area background is white/light gray.
            ctx.fillStyle = '#ffffff'; // White mask
            // Coordinates based on estimation from typical ID cards
            // x: 380, y: 320, w: 600, h: 250
            ctx.fillRect(380, 320, 600, 250);

            // Generate QR Code
            const qrData = student.nisn || 'INVALID';
            const qrUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 200 }); // Smaller QR
            const qrImg = new Image();
            qrImg.src = qrUrl;
            await new Promise((r) => { qrImg.onload = r; });

            // Draw QR Code
            // Move it slightly left and down
            const qrX = 60;
            const qrY = 320;
            const qrSize = 220;
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // Draw Text
            ctx.textAlign = 'left';

            // Name Label
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#1a4d2e'; // Dark Green (School Theme)
            ctx.fillText('NAMA', 320, 360);
            ctx.fillText(':', 420, 360);

            // Name Value
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(student.name.toUpperCase(), 440, 360);

            // NISN Label
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#1a4d2e';
            ctx.fillText('NISN', 320, 410);
            ctx.fillText(':', 420, 410);

            // NISN Value
            ctx.font = '30px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(student.nisn || '-', 440, 410);

            // Class Label
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#1a4d2e';
            ctx.fillText('KELAS', 320, 460);
            ctx.fillText(':', 420, 460);

            // Class Value
            ctx.font = '30px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(student.class, 440, 460);

            resolve(canvas.toDataURL('image/png'));
        } catch (error) {
            reject(error);
        }
    });
};
