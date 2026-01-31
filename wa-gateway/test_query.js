const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Kg3Wo7DivCXT@ep-curly-mountain-a1f3ag2w.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testQuery() {
    console.log('Testing Bot SQL Query...');
    console.log('Connection String:', connectionString.split('@')[1]); // Log part for safety check

    try {
        const res = await pool.query(`
            SELECT a.id, a."timeIn", a.status, s.name, s.class, s."parentPhone", a."createdAt"
            FROM "Attendance" a
            JOIN "Student" s ON a."studentId" = s.id
            WHERE a."waStatus" = 'PENDING'
            AND s."parentPhone" IS NOT NULL
            AND a."createdAt" >= CURRENT_DATE
            LIMIT 5
        `);

        console.log(`Query Result Count: ${res.rowCount}`);
        if (res.rowCount > 0) {
            console.log('Record Found!');
            console.log(res.rows[0]);
        } else {
            console.log('No records found with this query.');

            // Debug: Remove CURRENT_DATE
            console.log('Trying without CURRENT_DATE check...');
            const res2 = await pool.query(`
                SELECT a.id, a."timeIn", a.status, s.name, a."createdAt"
                FROM "Attendance" a
                JOIN "Student" s ON a."studentId" = s.id
                WHERE a."waStatus" = 'PENDING'
                LIMIT 5
            `);
            console.log(`Query Result Count (No Date): ${res2.rowCount}`);
            if (res2.rowCount > 0) console.log('Found without date check. The issue is CURRENT_DATE.');
        }

    } catch (err) {
        console.error('SQL Error:', err);
    } finally {
        await pool.end();
    }
}

testQuery();
