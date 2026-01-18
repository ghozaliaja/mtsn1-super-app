import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dummyData = [
    { name: 'Guru Test 1', phone: '085262667247' },
    { name: 'Guru Test 2', phone: '081370000064' },
    { name: 'Guru Test 3', phone: '081396663190' },
    { name: 'Guru Test 4', phone: '085262435363' },
    { name: 'Guru Test 5', phone: '081264760788' },
];

async function main() {
    console.log('Start seeding dummy teachers...');

    for (let i = 0; i < dummyData.length; i++) {
        const teacher = dummyData[i];
        const nisn = `TEST00${i + 1}`;

        // Generate a simple unique barcode
        const barcode = `TEST-${Date.now()}-${i}`;

        const student = await prisma.student.upsert({
            where: { nisn: nisn },
            update: {
                name: teacher.name,
                class: 'TEST',
                parentPhone: teacher.phone,
                barcode: barcode // Update barcode if exists
            },
            create: {
                name: teacher.name,
                class: 'TEST',
                nisn: nisn,
                parentPhone: teacher.phone,
                barcode: barcode
            },
        });

        console.log(`Created/Updated: ${student.name} (${student.parentPhone})`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
