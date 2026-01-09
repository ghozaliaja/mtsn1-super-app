import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.log('DATABASE_URL is not set');
        return;
    }
    if (url.includes('neon.tech')) {
        console.log('Connected to Neon database');
    } else {
        console.log('Connected to: ' + url.split('@')[1]); // Show host only
    }
}

checkDb();
