
const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, '.wwebjs_auth');
const cachePath = path.join(__dirname, '.wwebjs_cache');

function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}

console.log('Clearing WhatsApp Session...');
try {
    if (fs.existsSync(authPath)) {
        console.log('Deleting .wwebjs_auth...');
        deleteFolderRecursive(authPath);
    }
    if (fs.existsSync(cachePath)) {
        console.log('Deleting .wwebjs_cache...');
        deleteFolderRecursive(cachePath);
    }
    console.log('Session cleared! Please Run START_BOT.bat again to re-scan QR.');
} catch (err) {
    console.error('Error clearing session:', err);
}
