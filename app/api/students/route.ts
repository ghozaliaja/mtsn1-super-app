import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');

    if (!className) {
        return NextResponse.json({ error: 'Class is required' }, { status: 400 });
    }

    try {
        const students = await prisma.student.findMany({
            where: {
                class: className,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}
