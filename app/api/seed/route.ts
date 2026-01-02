import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Force dynamic to avoid caching

export async function GET() {
    console.log("Seeding VIII I started...");
    const studentsVIIII = [
        "ADILLA MIKAILA RITONGA",
        "AFIQA ADELIE NASTMAN",
        "AILA HASYA PUTRI HASIBUAN",
        "AISY FILZA",
        "ALIYA THALITA ATMADJA SILABAN",
        "AQILA FARISAH SIREGAR",
        "CHERRY LOVELY HARSALIA",
        "DAFFA HAFIDZ AL FARHAN POHAN",
        "DARYL ALDRIC RITONGA",
        "DIFA MAULANA LUBIS",
        "DITA AZANI HARAHAP",
        "FAIZ ALFARIZHIE NASUTION",
        "HUMAIRAH ANGGRAINI RITONGA",
        "INKA PRISILYA",
        "LATIFAH AZZAHRA NASUTION",
        "M.DAFFA LUBIS",
        "MHD. FAHRI WILDAN JULIANDI",
        "MIFTAHUR RIZKI",
        "MUKHTI DARMAWAN SYAHPUTRA RITONG",
        "MUTIA AZ ZAHRA SIAGIAN",
        "NAYLA ZUHRAH HASIBUAN",
        "NAZWA SHAKIRA ALKHAIRI",
        "QHEIRA ARTHA KHANAYA",
        "R. MUHAMMAD PARHANSYAH RITONGA",
        "RAFA KEANU ALPASHA",
        "RIFKY ADRIAN ASRURI",
        "RIFQI FRADANA HASIBUAN",
        "SHOQIA",
        "VANESSA CERELIA QUINN",
        "ZAFIRAH RAMADHANI",
        "ZAIRA RAMADANI",
        "ZAKI ANGGARA PUTRA",
        "ZAKY HILMIY"
    ];

    try {
        // Seed VIII I only
        for (const name of studentsVIIII) {
            await prisma.student.upsert({
                where: { nis: `8I-${name.replace(/\s+/g, '-').toLowerCase()}` },
                update: {},
                create: {
                    name: name,
                    class: 'VIII I',
                    nis: `8I-${name.replace(/\s+/g, '-').toLowerCase()}`
                },
            });
        }

        const count = await prisma.student.count({
            where: { class: 'VIII I' }
        });

        console.log(`Seeding finished. Count: ${count}`);

        return NextResponse.json({ message: 'Seeding successful for VIII I', count: count, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: 'Seeding failed', details: error }, { status: 500 });
    }
}
