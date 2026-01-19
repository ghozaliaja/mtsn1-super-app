@echo off
echo MENGHAPUS DATA ABSENSI HARI INI...
echo.
cd ..
call npx tsx scripts/wipe_today.ts
echo.
echo SELESAI. Data hari ini sudah bersih.
pause
