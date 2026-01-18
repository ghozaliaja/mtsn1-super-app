import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany({
        where: { class: 'VIII D' },
        select: { name: true, nisn: true, parentPhone: true },
    });

    console.log(`Total students in VIII D: ${students.length}`);
    const incomplete = students.filter(s => !s.nisn || !s.parentPhone);
    console.log(`Students with missing NISN or Parent Phone: ${incomplete.length}`);

    if (incomplete.length > 0) {
        console.log('Sample incomplete students:', incomplete.slice(0, 5));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
