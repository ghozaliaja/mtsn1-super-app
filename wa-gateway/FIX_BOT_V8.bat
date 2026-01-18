@echo off
title UPDATE BOT (VERSI 8 - FINAL LIVE)...
color 0A
echo ====================================================
echo        UPDATE SYSTEM BOT (LIVE MODE)
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
echo Script bot.js sudah dalam MODE LIVE (SIAP KIRIM).
echo - Jeda aman: 5-10 detik.
echo - Anti-overlap: Aktif.
echo - Filter tanggal: Aktif (Hanya hari ini).
echo.
echo Silakan tutup dan jalankan START_BOT.bat
pause
