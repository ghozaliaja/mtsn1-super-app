@echo off
title STOP & BERSIHKAN ANTRIAN...
color 0C
echo ====================================================
echo        EMERGENCY STOP & CLEAN
echo ====================================================
echo.
echo 1. Mematikan paksa bot yang sedang jalan...
taskkill /F /IM node.exe >nul 2>&1

echo 2. Membersihkan antrian pesan...
node clear_queue.js

echo.
echo ====================================================
echo SELESAI. Bot sudah mati dan antrian bersih.
echo ====================================================
pause
