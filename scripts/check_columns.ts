import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findFirst({
        where: {
            class: 'VIII A',
        },
        select: {
            name: true,
            nis: true,
            parentPhone: true,
        },
    });

    if (student) {
        console.log('Sample Student Data:');
        console.log(`Name: ${student.name}`);
        console.log(`NIS: ${student.nis}`);
        console.log(`Parent Phone: ${student.parentPhone}`);
    } else {
        console.log('No students found in VIII A');
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
