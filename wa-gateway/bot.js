const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Load .env from root

// Database Connection
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_Kg3Wo7DivCXT@ep-curly-mountain-a1f3ag2w.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
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
let isProcessing = false;
const SAFE_MODE = false; // SUDAH AMAN. SIAP KIRIM!

async function startPolling() {
    if (SAFE_MODE) {
        console.log('\n⚠️  MODE AMAN (SAFE MODE) AKTIF  ⚠️');
        console.log('Bot TIDAK akan mengirim pesan WhatsApp.');
        console.log('Hanya akan mengecek antrian di database.\n');
    } else {
        console.log('\n🚀 MODE FULL AKTIF 🚀');
        console.log('Bot akan mengirim pesan untuk SEMUA KELAS.');
        console.log('Pastikan antrian sudah bersih sebelum mulai.\n');
    }

    setInterval(async () => {
        if (isProcessing) return;
        isProcessing = true;

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

            // Debug: Cek jumlah pending
            const check = await pool.query(`SELECT COUNT(*) FROM "Attendance" WHERE "waStatus" = 'PENDING' AND "createdAt" >= CURRENT_DATE`);
            if (parseInt(check.rows[0].count) > 0) {
                console.log(`Found ${check.rows[0].count} pending records.`);
            }

            const res = await pool.query(`
                SELECT a.id, a."timeIn", a.status, s.name, s.class, s."parentPhone", a."createdAt"
                FROM "Attendance" a
                JOIN "Student" s ON a."studentId" = s.id
                WHERE a."waStatus" = 'PENDING'
                AND s."parentPhone" IS NOT NULL
                AND a."createdAt" >= CURRENT_DATE
                LIMIT 5
            `);

            for (const row of res.rows) {
                const { id, timeIn, status, name, class: className, parentPhone, createdAt } = row;

                console.log(`[DEBUG] Memproses data: ${name} | Dibuat: ${new Date(createdAt).toLocaleString()}`);

                // Format Phone Number (62...)
                let phone = parentPhone.replace(/\D/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                if (!phone.endsWith('@c.us')) phone += '@c.us';

                // Message Content
                // Message Content
                const time = new Date(timeIn).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta' // Force WIB
                });

                const message = `Assalamualaikum Wr. Wb. / Salam Sejahtera,\n\nDiberitahukan bahwa anak Bapak/Ibu:\nNama: *${name}*\nKelas: *${className}*\nStatus: *${status}*\nWaktu: *${time} WIB*\n\nTerima kasih.\n_MTsN 1 Labuhanbatu_`;

                if (SAFE_MODE) {
                    console.log(`[SIMULASI] Akan mengirim ke: ${name} (${phone})`);
                    console.log(`[SIMULASI] Pesan: ${message.split('\n')[0]}...`);
                    // Tandai sebagai SENT_SIMULATED agar tidak muncul terus di log
                    // await pool.query(`UPDATE "Attendance" SET "waStatus" = 'SENT_SIM' WHERE id = $1`, [id]);
                    // ATAU: Biarkan saja PENDING biar user tau masih ada antrian.
                    console.log('❌ Pesan TIDAK dikirim (Safe Mode).');
                } else {
                    // Send Message
                    try {
                        await client.sendMessage(phone, message, { sendSeen: false });
                        console.log(`✅ Pesan terkirim ke ${name} (${phone})`);

                        // Update Status to SENT
                        await pool.query(`UPDATE "Attendance" SET "waStatus" = 'SENT' WHERE id = $1`, [id]);
                    } catch (err) {
                        console.error(`❌ Gagal kirim ke ${name}:`, err);
                        // Update Status to FAILED so we don't retry forever
                        await pool.query(`UPDATE "Attendance" SET "waStatus" = 'FAILED' WHERE id = $1`, [id]);
                    }
                }

                // Delay to prevent ban (Random 5-10 seconds)
                const delay = Math.floor(Math.random() * 5000) + 5000;
                console.log(`⏳ Menunggu ${delay / 1000} detik sebelum pesan berikutnya...`);
                await new Promise(r => setTimeout(r, delay));
            }

        } catch (err) {
            console.error('Polling Error:', err);
        } finally {
            isProcessing = false;
        }
    }, 10000); // Check every 10 seconds
}
