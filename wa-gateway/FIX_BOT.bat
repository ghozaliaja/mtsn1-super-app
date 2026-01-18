@echo off
title MEMPERBAIKI BOT (METODE PATCH)...
color 0A
echo ====================================================
echo        SEDANG MEMPERBAIKI SYSTEM BOT
echo ====================================================
echo.
echo 1. Mematikan proses bot...
taskkill /F /IM node.exe >nul 2>&1

echo 2. Membersihkan file lama...
rmdir /s /q node_modules
del package-lock.json

echo 3. Install ulang library (Original)...
call npm install whatsapp-web.js@latest

echo 4. Menjalankan Patch...
node patch.js

echo.
echo ====================================================
echo        PERBAIKAN SELESAI!
echo ====================================================
echo.
echo Cek tulisan diatas, harusnya ada "SUCCESS".
echo Silakan tutup jendela ini, lalu jalankan START_BOT.bat lagi.
pause
