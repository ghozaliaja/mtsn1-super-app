const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Load .env from root

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan QR Code ini dengan WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot WhatsApp Siap! Menunggu data absensi...');
    startPolling();
});

client.initialize();

// Polling Function
async function startPolling() {
    setInterval(async () => {
        try {
            // 1. Cari absensi yang status WA-nya PENDING dan dibuat HARI INI
            const query = `
                SELECT a.id, a.time_in, a.status, s.name, s.class, s.parent_phone 
                FROM "Attendance" a
                JOIN "Student" s ON a."studentId" = s.id
                WHERE a."waStatus" = 'PENDING' 
                AND s."parentPhone" IS NOT NULL
                AND a."createdAt" >= CURRENT_DATE
                LIMIT 5
            `;

            // Note: Adjust column names if Prisma maps them differently (usually camelCase in JS, but snake_case in DB if not specified)
            // Prisma default mapping: camelCase model -> camelCase column? No, usually keeps case unless @map.
            // Let's check schema. Prisma usually preserves case in DB if not mapped.
            // But raw SQL needs exact DB column names.
            // Safe bet: Use double quotes for mixed case if Prisma created them that way.
            // Actually, let's check the previous schema view.
            // "studentId", "waStatus", "createdAt", "parentPhone".

            const res = await pool.query(`
                SELECT a.id, a."timeIn", a.status, s.name, s.class, s."parentPhone"
                FROM "Attendance" a
                JOIN "Student" s ON a."studentId" = s.id
                WHERE a."waStatus" = 'PENDING'
                AND s."parentPhone" IS NOT NULL
                AND a."createdAt" >= CURRENT_DATE
                LIMIT 5
            `);

            for (const row of res.rows) {
                const { id, timeIn, status, name, class: className, parentPhone } = row;

                // Format Phone Number (62...)
                let phone = parentPhone.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                if (!phone.endsWith('@c.us')) phone += '@c.us';

                // Message Content
                const time = new Date(timeIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const message = `*Laporan Kehadiran Siswa*\n\nNama: *${name}*\nKelas: *${className}*\nStatus: *${status}*\nWaktu: *${time}*\n\nTerima kasih.\n_MTsN 1 Labuhanbatu_`;

                // Send Message
                try {
                    await client.sendMessage(phone, message);
                    console.log(`✅ Pesan terkirim ke ${name} (${phone})`);

                    // Update Status to SENT
                    await pool.query(`UPDATE "Attendance" SET "waStatus" = 'SENT' WHERE id = $1`, [id]);
                } catch (err) {
                    console.error(`❌ Gagal kirim ke ${name}:`, err);
                    // Update Status to FAILED so we don't retry forever
                    await pool.query(`UPDATE "Attendance" SET "waStatus" = 'FAILED' WHERE id = $1`, [id]);
                }

                // Delay to prevent ban
                await new Promise(r => setTimeout(r, 2000));
            }

        } catch (err) {
            console.error('Polling Error:', err);
        }
    }, 10000); // Check every 10 seconds
}
