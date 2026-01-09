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

        // 2. Check if already scanned today
        const today = new Date().toISOString().split('T')[0];

        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date: today
                }
            }
        });

        if (existingAttendance && existingAttendance.timeIn) {
            return NextResponse.json({
                message: 'Sudah absen hari ini!',
                student: {
                    name: student.name,
                    class: student.class
                }
            }, { status: 200 }); // Return success but with message
        }

        // 3. Determine Status (Late or Present)
        // Example: Late if after 07:30
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isLate = hour > 7 || (hour === 7 && minute > 30);
        const status = isLate ? 'TERLAMBAT' : 'HADIR';

        // 4. Create or Update Attendance
        if (existingAttendance) {
            await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    timeIn: now,
                    status: status
                }
            });
        } else {
            await prisma.attendance.create({
                data: {
                    date: today,
                    studentId: student.id,
                    timeIn: now,
                    status: status
                }
            });
        }

        // 5. Trigger WhatsApp (Placeholder)
        // sendWhatsApp(student.parentPhone, `Anak Anda ${student.name} telah hadir di sekolah pada pukul ${format(now, 'HH:mm')}`);

        return NextResponse.json({
            status: 'success',
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
