import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findUnique({
        where: {
            nis: '0114847909',
        },
        select: {
            name: true,
            nis: true,
            parentPhone: true,
        },
    });

    if (student) {
        console.log('Found Imported Student:');
        console.log(`Name: ${student.name}`);
        console.log(`NIS: ${student.nis}`);
        console.log(`Parent Phone: ${student.parentPhone}`);
    } else {
        console.log('Student with NIS 0114847909 not found.');
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
