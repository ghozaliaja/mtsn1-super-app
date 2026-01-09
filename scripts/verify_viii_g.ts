import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.student.count({
        where: {
            class: 'VIII G',
        },
    });

    console.log(`Total students in VIII G: ${count}`);

    const students = await prisma.student.findMany({
        where: {
            class: 'VIII G',
        },
        orderBy: {
            name: 'asc',
        },
    });

    console.log('Students:');
    students.forEach((s) => {
        console.log(`- ${s.name} (NISN: ${s.nisn})`);
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
