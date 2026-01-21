
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { resolution } = body;

        if (!resolution) {
            return NextResponse.json({ message: 'Catatan penyelesaian wajib diisi' }, { status: 400 });
        }

        const updatedCase = await prisma.counselingCase.update({
            where: { id: parseInt(id) },
            data: {
                status: 'RESOLVED',
                resolution: resolution,
                resolvedAt: new Date()
            }
        });

        return NextResponse.json(updatedCase);

    } catch (error) {
        console.error('Resolve Case Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
