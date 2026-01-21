
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { CaseDocument } from '@/components/pdf/CaseDocument';
import React from 'react';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;

        const caseData = await prisma.counselingCase.findUnique({
            where: { id: parseInt(id) },
            include: {
                student: true,
                reporter: true
            }
        });

        if (!caseData) {
            return NextResponse.json({ message: 'Case not found' }, { status: 404 });
        }

        const stream = await renderToStream(<CaseDocument caseData={caseData} />);

        // Convert Node stream to Buffer
        const chunks: Buffer[] = [];
        // @ts-ignore
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Berita_Acara_${caseData.student.name.replace(/\s/g, '_')}.pdf"`
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
