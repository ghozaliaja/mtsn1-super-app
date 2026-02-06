const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Load .env from root

// Database Connection
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_Kg3Wo7DivCXT@ep-curly-mountain-a1f3ag2w.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Logs Detail
client.on('qr', (qr) => {
    console.log('Scan QR Code ini dengan WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Bot WhatsApp Siap! Menunggu data absensi...');
    console.log('✅ FITUR ANTI-SPAM AKTIF: Hanya mengirim data 30 menit terakhir.');
    console.log('⏰ JAM OPERASIONAL: 07:00 - 09:00 WIB. (Hanya Kedatangan Pagi).');
    startPolling();
});

console.log('Initializing client...');
client.initialize();

// Polling Function
let isProcessing = false;
const SAFE_MODE = false;

async function startPolling() {
    console.log('\n🚀 MODE FULL AKTIF (Interval 30s) 🚀');

    // Polling setiap 30 detik (Hemat Database)
    setInterval(async () => {
        // 1. Cek Jam Operasional (HANYA 07:00 - 09:00 WIB)
        // Gunakan Intl agar fix WIB tidak peduli setting jam laptop
        const now = new Date();
        const wibTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const currentHour = wibTime.getHours();

        // Strict: Hanya jam 7 sampai jam 9 kurang (07:00 - 08:59)
        if (currentHour < 7 || currentHour >= 9) {
            // Diluar jam kerja, skip
            if (isProcessing) isProcessing = false;
            return;
        }

        if (isProcessing) return;
        isProcessing = true;

        try {
            // 1. Cari absensi yang status WA-nya PENDING dan dibuat HARI INI
            const res = await pool.query(`
                SELECT a.id, a."timeIn", a.status, s.name, s.class, s."parentPhone", a."createdAt"
                FROM "Attendance" a
                JOIN "Student" s ON a."studentId" = s.id
                WHERE a."waStatus" = 'PENDING'
                AND s."parentPhone" IS NOT NULL
                AND a."createdAt" > NOW() - INTERVAL '30 minutes'
                LIMIT 5
            `);

            if (res.rowCount > 0) {
                console.log(`[DEBUG] Menemukan ${res.rowCount} data pending...`);
            }

            for (const row of res.rows) {
                const { id, timeIn, status, name, class: className, parentPhone, createdAt } = row;

                console.log(`[PROSES] Data: ${name} | Jam: ${new Date(createdAt).toLocaleTimeString()} WIB`);

                // Format Phone Number (62...)
                let phone = parentPhone.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                if (!phone.endsWith('@c.us')) phone += '@c.us';

                // Message Content
                const time = new Date(timeIn).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta', // Force WIB
                    hour12: false
                });

                const message = `Assalamualaikum Wr. Wb.,\n\nDiberitahukan bahwa anak Bapak/Ibu:\nNama: *${name}*\nKelas: *${className}*\nStatus: *${status}*\n\nTerima kasih.\n_MTsN 1 Labuhanbatu_`;

                if (SAFE_MODE) {
                    console.log(`[SIMULASI] Would send to: ${phone}`);
                } else {
                    try {
                        await client.sendMessage(phone, message, { sendSeen: false });
                        console.log(`✅ TERKIRIM ke ${name}`);
                        await pool.query(`UPDATE "Attendance" SET "waStatus" = 'SENT' WHERE id = $1`, [id]);
                    } catch (err) {
                        console.error(`❌ GAGAL kirim ke ${name}:`, err);
                        await pool.query(`UPDATE "Attendance" SET "waStatus" = 'FAILED' WHERE id = $1`, [id]);
                    }
                }

                // Random delay 5-10s
                const delay = Math.floor(Math.random() * 5000) + 5000;
                await new Promise(r => setTimeout(r, delay));
            }

        } catch (err) {
            console.error('Polling Error:', err);
        } finally {
            isProcessing = false;
        }
    }, 30000); // 30 Detik
}
