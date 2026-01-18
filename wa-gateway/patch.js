const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'whatsapp-web.js', 'src', 'Client.js');

console.log('Checking file:', filePath);

try {
    if (!fs.existsSync(filePath)) {
        console.error('❌ FILE NOT FOUND! Install failed?');
        process.exit(1);
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already patched
    if (content.includes('window.WWebJS.markSeen(chatId)')) {
        console.log('✅ Already patched!');
    } else {
        // Replace sendSeen with markSeen
        // We use regex to replace all occurrences
        const newContent = content.replace(/window\.WWebJS\.sendSeen\(chatId\)/g, 'window.WWebJS.markSeen(chatId)');

        if (content === newContent) {
            console.log('⚠️ Pattern not found. Maybe the file changed?');
            console.log('Searching for "sendSeen"...');
            if (content.includes('sendSeen')) {
                console.log('Found "sendSeen" but regex failed. Trying simple replace...');
                const simpleReplace = content.split('window.WWebJS.sendSeen(chatId)').join('window.WWebJS.markSeen(chatId)');
                fs.writeFileSync(filePath, simpleReplace, 'utf8');
                console.log('✅ SUCCESS: Patched Client.js (Simple Method)');
            } else {
                console.log('❌ "sendSeen" not found in file.');
            }
        } else {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('✅ SUCCESS: Patched Client.js (Regex Method)');
        }
    }
} catch (err) {
    console.error('❌ Error patching:', err);
}
