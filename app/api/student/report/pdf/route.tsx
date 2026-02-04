
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { StudentReportDocument } from '@/components/pdf/StudentReportDocument';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type') as 'prayer' | 'school'; // prayer | school
    const period = searchParams.get('period') as 'daily' | 'monthly'; // daily | monthly
    const date = searchParams.get('date'); // YYYY-MM-DD for daily, YYYY-MM for monthly

    if (!studentId || !type || !period || !date) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const student = await prisma.student.findUnique({
            where: { id: Number(studentId) }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        let data = [];
        let dateTitle = '';

        if (period === 'monthly') {
            const [year, month] = date.split('-');
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            dateTitle = `${monthNames[parseInt(month) - 1]} ${year}`;

            const records = await prisma.attendance.findMany({
                where: {
                    studentId: Number(studentId),
                    date: { startsWith: date }
                },
                orderBy: { date: 'asc' }
            });

            const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = `${date}-${String(i).padStart(2, '0')}`;
                const record = records.find(r => r.date === dayDate);

                data.push({
                    dateLabel: String(i),
                    ...{
                        subuh: false, dhuha: false, dzuhur: false, ashar: false, maghrib: false, isya: false, tahajjud: false, tarawih: false, puasa: false, alquran: false,
                        timeIn: null, status: null, timeOut: null, statusOut: null,
                        ...record // overwrite defaults if record exists
                    }
                });
            }

        } else {
            // Daily
            const dateObj = new Date(date);
            dateTitle = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

            const record = await prisma.attendance.findUnique({
                where: {
                    studentId_date: {
                        studentId: Number(studentId),
                        date: date
                    }
                }
            });

            data.push({
                dateLabel: date,
                ...{
                    subuh: false, dhuha: false, dzuhur: false, ashar: false, maghrib: false, isya: false, tahajjud: false, tarawih: false, puasa: false, alquran: false,
                    timeIn: null, status: null, timeOut: null, statusOut: null,
                    ...record // overwrite defaults if record exists
                }
            });
        }

        const stream = await renderToStream(
            <StudentReportDocument 
                student={ student } 
                data = { data } 
                period = { period } 
                type = { type } 
                dateTitle = { dateTitle }
            />
        );

        const chunks: Buffer[] = [];
        // @ts-ignore
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        const filename = `Laporan_${type}_${period}_${student.name.replace(/\s+/g, '_')}_${date}.pdf`;

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
