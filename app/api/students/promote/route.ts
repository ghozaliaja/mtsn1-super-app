import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentIds, targetClass } = body;

        if (!Array.isArray(studentIds) || studentIds.length === 0 || !targetClass) {
            return NextResponse.json(
                { error: 'Invalid data. Expected studentIds array and targetClass.' },
                { status: 400 }
            );
        }

        // Update students
        const result = await prisma.student.updateMany({
            where: {
                id: { in: studentIds },
            },
            data: {
                class: targetClass,
            },
        });

        return NextResponse.json({
            message: `Successfully promoted ${result.count} students to ${targetClass}.`,
            count: result.count,
        });

    } catch (error: any) {
        console.error('Promotion error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
