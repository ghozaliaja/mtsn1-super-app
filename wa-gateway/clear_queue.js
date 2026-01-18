const { Pool } = require('pg');

// Gunakan koneksi string yang sama dengan bot.js
const connectionString = 'postgresql://neondb_owner:npg_Kg3Wo7DivCXT@ep-curly-mountain-a1f3ag2w.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function clearQueue() {
    try {
        console.log('⏳ Sedang memeriksa antrian pesan...');

        // Cek detail pesan yang pending
        const res = await pool.query(`
            SELECT a.id, s.name, a."createdAt"
            FROM "Attendance" a
            JOIN "Student" s ON a."studentId" = s.id
            WHERE a."waStatus" = 'PENDING'
        `);

        const count = res.rows.length;

        if (count > 0) {
            console.log(`⚠️ Ditemukan ${count} pesan tertunda:`);
            res.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.name} (Dibuat: ${row.createdAt})`);
            });

            console.log('\nSedang membersihkan...');

            // Update status jadi CANCELLED biar gak dikirim
            await pool.query(`UPDATE "Attendance" SET "waStatus" = 'CANCELLED' WHERE "waStatus" = 'PENDING'`);

            console.log(`✅ SUKSES! ${count} pesan telah dibatalkan.`);
            console.log('Sekarang AMAN untuk menjalankan bot.');
        } else {
            console.log('✅ Antrian bersih. Tidak ada pesan tertunda.');
            console.log('Silakan jalankan bot.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

clearQueue();
