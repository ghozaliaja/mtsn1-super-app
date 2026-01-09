import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');

    console.log('Fetching students for class:', className);

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
        console.log(`Found ${students.length} students for class ${className}`);
        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}
