const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('=== TEST KONEKSI WHATSAPP DIKIRIM ===');
console.log('Script ini hanya mengetes apakah Bot bisa connect ke WA.');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
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
    console.log('Menunggu status READY...');
});

client.on('ready', async () => {
    console.log('✅ STATUS: READY!');
    console.log('Nomor Bot:', client.info.wid.user);

    console.log('Mencoba mengirim pesan ke diri sendiri (Saved Messages)...');
    try {
        await client.sendMessage(client.info.wid._serialized, 'Tes Koneksi Berhasil! Bot berfungsi normal.');
        console.log('✅ SUKSES! Pesan terkirim ke "Pesan Tersimpan" / Chat sendiri.');
    } catch (err) {
        console.error('❌ GAGAL KIRIM PESAN:', err);
    }
});

client.initialize();
