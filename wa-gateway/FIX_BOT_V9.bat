@echo off
title UPDATE BOT (VERSI 9 - DEBUG MODE)...
color 0E
echo ====================================================
echo        UPDATE SYSTEM BOT (DEBUG MODE)
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
echo Script bot.js sudah diupdate dengan fitur DEBUG.
echo Nanti akan muncul TANGGAL PEMBUATAN data di layar hitam.
echo Jadi ketahuan itu data lama atau data baru.
echo.
echo Silakan tutup dan jalankan START_BOT.bat
pause
