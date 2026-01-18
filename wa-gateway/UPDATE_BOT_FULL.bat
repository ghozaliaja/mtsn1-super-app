@echo off
title UPDATE BOT (VERSI 11 - FULL ACCESS)...
color 0B
echo ====================================================
echo        UPDATE SYSTEM BOT (FULL ACCESS)
echo ====================================================
echo.
echo 1. Mematikan proses bot...
taskkill /F /IM node.exe >nul 2>&1

echo 2. Membersihkan antrian pesan lama (SAFETY)...
node clear_queue.js

echo 3. Menyiapkan bot baru...
echo Bot sekarang akan mengirim pesan untuk SEMUA KELAS.
echo Antrian lama sudah dibersihkan supaya tidak spam.

echo.
echo ====================================================
echo        UPDATE SELESAI!
echo ====================================================
echo.
echo Silakan jalankan START_BOT.bat seperti biasa.
pause
