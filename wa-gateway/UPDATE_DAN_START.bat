@echo off
title UPDATE SYSTEM BOT
color 0E
cd /d "%~dp0"
echo ========================================================
echo        MEMPERBARUI SISTEM WHATSAPP (WWEBJS)...
echo      Mohon pastikan Internet Kencang & Stabil
echo ========================================================
echo.
echo Sedang mendownload update... (Bisa 1-2 menit)
call npm install whatsapp-web.js@latest
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] GAGAL UPDATE! Cek internet anda.
    echo Bot tidak akan dijalankan.
    pause
    exit
)

echo.
echo [SUKSES] Update Selesai!
echo.
echo ========================================================
echo              MENJALANKAN BOT BARU...
echo ========================================================
color 0A
node bot.js
pause
