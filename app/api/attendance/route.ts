import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, date, prayer, status } = body;

        if (!studentId || !date || !prayer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find existing record
        const existingRecord = await prisma.attendance.findUnique({
            where: {
                studentId_date: {
                    studentId: Number(studentId),
                    date: date
                }
            }
        });

        if (existingRecord) {
            // Update existing record
            await prisma.attendance.update({
                where: { id: existingRecord.id },
                data: { [prayer]: status }
            });
        } else {
            // Create new record
            await prisma.attendance.create({
                data: {
                    studentId: Number(studentId),
                    date: date,
                    [prayer]: status
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving attendance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    try {
        // Fetch single student attendance
        if (studentId) {
            const record = await prisma.attendance.findUnique({
                where: {
                    studentId_date: {
                        studentId: Number(studentId),
                        date: date
                    }
                }
            });

            // Return formatted record or default false
            if (!record) {
                return NextResponse.json({
                    subuh: false, dhuha: false, dzuhur: false, ashar: false,
                    maghrib: false, isya: false, tahajjud: false, tarawih: false,
                    puasa: false, alquran: false
                });
            }

            return NextResponse.json({
                subuh: record.subuh, dhuha: record.dhuha, dzuhur: record.dzuhur,
                ashar: record.ashar, maghrib: record.maghrib, isya: record.isya,
                tahajjud: record.tahajjud, tarawih: record.tarawih,
                puasa: record.puasa, alquran: record.alquran
            });
        }

        if (!className) {
            return NextResponse.json({ error: 'Missing class parameter' }, { status: 400 });
        }

        const students = await prisma.student.findMany({
            where: { class: className },
            include: {
                attendance: {
                    where: { date: date }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Format response for frontend
        const data = students.map(student => {
            const record = student.attendance[0] || {};
            return {
                student: { id: student.id, name: student.name, class: student.class },
                record: {
                    date: date,
                    subuh: record.subuh || false,
                    dhuha: record.dhuha || false,
                    dzuhur: record.dzuhur || false,
                    ashar: record.ashar || false,
                    maghrib: record.maghrib || false,
                    isya: record.isya || false,
                    tahajjud: record.tahajjud || false,
                    tarawih: record.tarawih || false,
                    puasa: record.puasa || false,
                    alquran: record.alquran || false,
                }
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
