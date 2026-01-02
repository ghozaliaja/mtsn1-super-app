import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Force dynamic to avoid caching

export async function GET() {
    console.log("Seeding VII K started...");
    const studentsVIIK = [
        "ABRAHAM ALFATH RITONGA",
        "ADZRA ZHAAFIRAH TAMBUNAN",
        "AFIKA PAULENN",
        "AHMAD RAZAKI ARKAN NASUTION",
        "AQIFAH ARDINDA HARAHAP",
        "AYNI AYUNDA",
        "AZRA KHALILA AZWI LUBIS",
        "DASTAN DALIMUNTHE",
        "DINDA ASSYIFA SAMOSIR",
        "FADLAN NUR FADILLAH",
        "FADZKA AL-RIZKY SYAHPUTRA NASUTION",
        "FARHAN AL-HABSY RITONGA",
        "FAZRY ALFAREZA",
        "GHINAA AQIILAH",
        "HADI ADRYSMA",
        "JIHAN SYAFIRA",
        "MUHAMMAD ZAIDAAN",
        "MURSI ALHAPSI SIRAIT",
        "NAIRA SALSABILA AZZAHRA GULTOM",
        "NAZLA AULIA SHAFA",
        "NAZWA AQILAH RITONGA",
        "NURIYATUN ARBA RAMBE",
        "PATRAH KHOMARA",
        "QIANDRA FITRA RAMADHAN TAMBUNAN",
        "RAYYAN AUFAR",
        "RIFQAH RESHA IDILYA HASIBUAN",
        "RIVA PUTRI PADIRA",
        "SALMA AQILA",
        "SHEREN AQEELA NATASYA",
        "SYAFA RAHMA"
    ];

    try {
        // Seed VII K only
        for (const name of studentsVIIK) {
            await prisma.student.upsert({
                where: { nis: `7K-${name.replace(/\s+/g, '-').toLowerCase()}` },
                update: {},
                create: {
                    name: name,
                    class: 'VII K',
                    nis: `7K-${name.replace(/\s+/g, '-').toLowerCase()}`
                },
            });
        }

        const count = await prisma.student.count({
            where: { class: 'VII K' }
        });

        console.log(`Seeding finished. Count: ${count}`);

        return NextResponse.json({ message: 'Seeding successful for VII K', count: count, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: 'Seeding failed', details: error }, { status: 500 });
    }
}
