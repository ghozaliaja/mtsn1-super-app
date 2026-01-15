import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { qrCode } = await request.json();

        if (!qrCode) {
            return NextResponse.json({ message: 'QR Code tidak valid' }, { status: 400 });
        }

        // 1. Find Student by Barcode (or NIS if barcode is empty)
        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { barcode: qrCode },
                    { nisn: qrCode }
                ]
            }
        });

        if (!student) {
            return NextResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
        }



        // 3. Determine Time Slot & Status
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute; // Minutes since midnight

        let type = ''; // 'MORNING' or 'AFTERNOON'
        let status = 'HADIR'; // Default to HADIR (PRESENT)
        let message = '';

        // Schedule Configuration
        // Mon(1) - Thu(4)
        // Morning: 06:00 (360) - 07:30 (450)
        // Afternoon: 12:40 (760) - 13:15 (795)

        // Fri(5) - Sat(6)
        // Morning: 06:00 (360) - 07:30 (450)
        // Afternoon: 09:45 (585) - 10:05 (605)

        const isFriSat = day === 5 || day === 6;

        // Define Cutoffs (in minutes)
        const MORNING_LATE = 7 * 60 + 30;   // 07:30
        const MORNING_END = 11 * 60;        // 11:00 (Cutoff between Morning/Afternoon)

        let AFTERNOON_START, AFTERNOON_LATE;

        if (isFriSat) {
            AFTERNOON_START = 9 * 60 + 45;  // 09:45
            AFTERNOON_LATE = 10 * 60 + 5;   // 10:05
        } else {
            AFTERNOON_START = 12 * 60 + 40; // 12:40
            AFTERNOON_LATE = 13 * 60 + 15;  // 13:15
        }

        // Determine Slot
        if (currentTime < MORNING_END) {
            type = 'MORNING';
            if (currentTime > MORNING_LATE) status = 'TERLAMBAT';
        } else {
            type = 'AFTERNOON';
            if (currentTime > AFTERNOON_LATE) status = 'TERLAMBAT';
        }

        // 4. Find or Create Attendance Record
        const today = now.toISOString().split('T')[0];

        let attendance = await prisma.attendance.findUnique({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date: today
                }
            }
        });

        if (!attendance) {
            attendance = await prisma.attendance.create({
                data: {
                    studentId: student.id,
                    date: today,
                }
            });
        }

        // 5. Update Record based on Type
        if (type === 'MORNING') {
            if (attendance.timeIn) {
                return NextResponse.json({
                    message: 'Sudah absen masuk pagi ini',
                    student: { name: student.name, class: student.class }
                }, { status: 200 });
            }

            await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    timeIn: now,
                    status: status,
                    waStatus: 'PENDING' // Trigger WA
                }
            });
            message = status === 'TERLAMBAT' ? 'Absen Masuk (Terlambat)' : 'Absen Masuk Berhasil';

        } else {
            // AFTERNOON
            if (attendance.timeOut) {
                return NextResponse.json({
                    message: 'Sudah absen siang ini',
                    student: { name: student.name, class: student.class }
                }, { status: 200 });
            }

            await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    timeOut: now,
                    statusOut: status,
                    waStatus: 'PENDING' // Trigger WA
                }
            });
            message = status === 'TERLAMBAT' ? 'Absen Siang (Terlambat)' : 'Absen Siang Berhasil';
        }

        return NextResponse.json({
            message: message,
            student: {
                name: student.name,
                class: student.class
            }
        });

    } catch (error) {
        console.error('Scan Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
