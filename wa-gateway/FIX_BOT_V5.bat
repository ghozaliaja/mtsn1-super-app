@echo off
title MEMPERBAIKI BOT (VERSI 5 - DATE FILTER)...
color 0D
echo ====================================================
echo        UPDATE SYSTEM BOT (ANTI-SPAM LAMA)
echo ====================================================
echo.
echo 1. Mematikan proses bot...
taskkill /F /IM node.exe >nul 2>&1

echo 2. Membersihkan file lama...
rmdir /s /q node_modules
del package-lock.json

echo 3. Install ulang library...
call npm install whatsapp-web.js@latest

echo.
echo ====================================================
echo        UPDATE SELESAI!
echo ====================================================
echo.
echo Script bot.js sudah diupdate:
echo 1. HANYA mengirim absen HARI INI (yang lama diabaikan).
echo 2. Jeda 5-10 detik biar aman.
echo.
echo Silakan tutup dan jalankan START_BOT.bat
pause
