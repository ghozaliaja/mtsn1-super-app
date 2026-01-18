const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_Kg3Wo7DivCXT@ep-curly-mountain-a1f3ag2w.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

async function listClasses() {
    try {
        const res = await pool.query('SELECT DISTINCT class FROM "Student" ORDER BY class');
        console.log('Classes found:', res.rows.map(r => r.class));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listClasses();
