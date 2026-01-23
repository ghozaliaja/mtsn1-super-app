import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);

        const loan = await prisma.libraryLoan.update({
            where: { id },
            data: {
                status: 'RETURNED',
                returnDate: new Date()
            }
        });

        return NextResponse.json(loan);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to return book' }, { status: 500 });
    }
}
