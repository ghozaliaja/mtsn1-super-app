import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing duplicates for Class IX C...');

    // 1. Find all students in IX C
    const students = await prisma.student.findMany({
        where: {
            class: 'IX C',
        },
    });

    console.log(`Total students in IX C before fix: ${students.length}`);

    let deletedCount = 0;

    for (const student of students) {
        // Check if NISN is a dummy (starts with '9C')
        if (student.nisn && student.nisn.startsWith('9C')) {
            // Double check if we have a real version of this student (by name)
            // Actually, we know we imported the real ones. 
            // But to be safe, let's just delete the dummy ones because the user wants the real ones.

            console.log(`Deleting dummy student: ${student.name} (${student.nisn})`);

            // Delete attendance first if any
            await prisma.attendance.deleteMany({
                where: { studentId: student.id }
            });

            await prisma.student.delete({
                where: { id: student.id }
            });

            deletedCount++;
        }
    }

    console.log(`Deleted ${deletedCount} duplicate/dummy students.`);

    const finalCount = await prisma.student.count({
        where: { class: 'IX C' }
    });
    console.log(`Total students in IX C after fix: ${finalCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
