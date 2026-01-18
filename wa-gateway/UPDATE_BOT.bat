@echo off
title UPDATE BOT (VERSI 10 - TEST CLASS ONLY)...
color 0A
echo ====================================================
echo        UPDATE SYSTEM BOT (TEST CLASS ONLY)
echo ====================================================
echo.
echo 1. Mematikan proses bot...
taskkill /F /IM node.exe >nul 2>&1

echo 2. Membersihkan antrian pesan lama...
node clear_queue.js

echo 3. Menyiapkan bot baru...
echo Bot sekarang HANYA akan mengirim pesan untuk kelas "TEST".
echo Siswa lain tidak akan dikirim WA.

echo.
echo ====================================================
echo        UPDATE SELESAI!
echo ====================================================
echo.
echo Silakan jalankan START_BOT.bat seperti biasa.
pause
