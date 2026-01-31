const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('=== TEST KONEKSI (GUI MODE) ===');
console.log('Jendela Chrome akan terbuka. JANGAN DITUTUP!');
console.log('Perhatikan apa yang terjadi di layar Chrome tersebut.');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false, // Membuka browser biar kelihatan
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
});

client.on('qr', (qr) => {
    console.log('SCAN QR DI BAWAH INI:');
    qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
    console.log(`Loading: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log('✅ BERHASIL LOGIN (Authenticated)!');
    console.log('Lihat di Chrome: Apakah stuck di loading bar? Atau error?');
});

client.on('ready', () => {
    console.log('✅ STATUS: READY!');
    console.log('Bot berhasil masuk sepenuhnya!');
});

// Log browser errors
client.on('remote_session_saved', () => {
    console.log('Remote session saved');
});

client.initialize();
