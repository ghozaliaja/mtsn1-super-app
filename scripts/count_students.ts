import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.student.count();
    console.log(`Total students in database: ${count}`);

    const classes = await prisma.student.groupBy({
        by: ['class'],
        _count: {
            _all: true,
        },
    });

    console.log('Students per class:');
    classes.forEach((c) => {
        console.log(`${c.class}: ${c._count._all}`);
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
