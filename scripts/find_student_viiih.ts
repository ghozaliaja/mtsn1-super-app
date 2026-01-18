import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const searchName = 'ALSYANDI';
    console.log(`Searching for students with name containing "${searchName}"...`);

    const students = await prisma.student.findMany({
        where: {
            name: {
                contains: searchName,
                mode: 'insensitive',
            },
        },
    });

    console.log('Found students:', students);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
