import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany({
        where: {
            class: 'VII J',
            OR: [
                { nisn: null },
                { parentPhone: null }
            ]
        },
    });

    console.log('Students with missing data in VII J:');
    students.forEach(s => {
        console.log(`- ${s.name} (NISN: ${s.nisn}, WA: ${s.parentPhone})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
