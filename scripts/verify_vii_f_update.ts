import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany({
        where: { class: 'VII F' },
        orderBy: { name: 'asc' },
    });

    console.log(`\nVerifying Class VII F (${students.length} students):`);
    console.log('--------------------------------------------------------------------------------');
    console.log('| No | Name                               | NISN       | WA           | Status   |');
    console.log('--------------------------------------------------------------------------------');

    let completeCount = 0;

    students.forEach((s, index) => {
        const isComplete = s.nisn && s.parentPhone;
        if (isComplete) completeCount++;

        console.log(
            `| ${String(index + 1).padEnd(2)} | ${s.name.padEnd(34)} | ${String(s.nisn || '-').padEnd(10)} | ${String(s.parentPhone || '-').padEnd(12)} | ${isComplete ? 'OK' : 'MISSING'} |`
        );
    });

    console.log('--------------------------------------------------------------------------------');
    console.log(`Total Complete: ${completeCount}/${students.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
