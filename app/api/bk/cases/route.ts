
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'User ID required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        let cases;

        if (user.role === 'WALIKELAS') {
            // Wali Kelas only sees cases they reported OR cases involving students in their class
            // Ideally, filter by class.
            cases = await prisma.counselingCase.findMany({
                where: {
                    student: {
                        class: user.assignedClass || ''
                    }
                },
                include: {
                    student: true,
                    reporter: {
                        select: { username: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Admin and BK see all
            cases = await prisma.counselingCase.findMany({
                include: {
                    student: true,
                    reporter: {
                        select: { username: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json(cases);

    } catch (error) {
        console.error('Get Cases Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, reporterId, violationType, description } = body;

        if (!studentId || !reporterId || !violationType) {
            return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
        }

        const newCase = await prisma.counselingCase.create({
            data: {
                studentId: parseInt(studentId),
                reporterId: parseInt(reporterId),
                violationType,
                description,
                status: 'PENDING'
            }
        });

        return NextResponse.json(newCase);

    } catch (error) {
        console.error('Create Case Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
