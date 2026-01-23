import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    try {
        const where: any = {};
        if (studentId) where.studentId = parseInt(studentId);
        if (status) where.status = status;

        const loans = await prisma.libraryLoan.findMany({
            where,
            include: {
                student: {
                    select: { name: true, class: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(loans);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, bookTitle, notes } = body;

        if (!studentId || !bookTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Default 7 days loan

        const loan = await prisma.libraryLoan.create({
            data: {
                studentId,
                bookTitle,
                notes,
                dueDate,
                status: 'BORROWED'
            }
        });

        return NextResponse.json(loan);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
    }
}
