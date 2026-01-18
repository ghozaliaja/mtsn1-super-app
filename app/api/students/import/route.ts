import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { students } = body;

        if (!Array.isArray(students) || students.length === 0) {
            return NextResponse.json(
                { error: 'Invalid data format. Expected an array of students.' },
                { status: 400 }
            );
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const student of students) {
            try {
                // Validate required fields
                if (!student.name || !student.class) {
                    throw new Error(`Missing name or class for student: ${JSON.stringify(student)}`);
                }

                // Check if student exists (by NISN if provided, otherwise by Name + Class)
                let existingStudent = null;

                if (student.nisn) {
                    existingStudent = await prisma.student.findUnique({
                        where: { nisn: String(student.nisn) },
                    });
                }

                if (!existingStudent) {
                    existingStudent = await prisma.student.findFirst({
                        where: {
                            name: { equals: student.name, mode: 'insensitive' },
                            class: student.class,
                        },
                    });
                }

                if (existingStudent) {
                    // Update existing student
                    await prisma.student.update({
                        where: { id: existingStudent.id },
                        data: {
                            nisn: student.nisn ? String(student.nisn) : existingStudent.nisn,
                            parentPhone: student.parentPhone ? String(student.parentPhone) : existingStudent.parentPhone,
                            class: student.class, // Update class just in case
                        },
                    });
                } else {
                    // Create new student
                    await prisma.student.create({
                        data: {
                            name: student.name,
                            class: student.class,
                            nisn: student.nisn ? String(student.nisn) : null,
                            parentPhone: student.parentPhone ? String(student.parentPhone) : null,
                        },
                    });
                }
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push(error.message);
            }
        }

        return NextResponse.json({
            message: `Processed ${students.length} students.`,
            results,
        });

    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
