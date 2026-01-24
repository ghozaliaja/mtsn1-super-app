import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { studentId, purpose } = await request.json();

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        const visit = await prisma.libraryVisit.create({
            data: {
                studentId,
                purpose: purpose || 'VISIT'
            }
        });

        return NextResponse.json(visit);
    } catch (error) {
        console.error('Error recording visit:', error);
        return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM

    try {
        let whereClause = {};
        if (month) {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

            whereClause = {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        const visits = await prisma.libraryVisit.findMany({
            where: whereClause,
            include: {
                student: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(visits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
    }
}
