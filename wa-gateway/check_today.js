const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_Kg3Wo7DivCXT@ep-curly-mountain-a1f3ag2w.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkTodayData() {
    try {
        console.log('🔍 Memeriksa data absen tanggal 17 Januari 2026...');

        const res = await pool.query(`
            SELECT a.id, s.name, a."timeIn", a.status, a."waStatus", a."createdAt"
            FROM "Attendance" a
            JOIN "Student" s ON a."studentId" = s.id
            WHERE a."createdAt" >= CURRENT_DATE
            ORDER BY a."createdAt" ASC
        `);

        console.log(`\nDitemukan ${res.rows.length} data hari ini:`);
        res.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name} | Status: ${row.status} | WA: ${row.waStatus} | Jam: ${new Date(row.createdAt).toLocaleTimeString()}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

checkTodayData();
