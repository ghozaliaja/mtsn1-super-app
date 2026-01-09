import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all students...');
    // Delete Attendance first due to foreign key constraint
    await prisma.attendance.deleteMany({});
    await prisma.student.deleteMany({});
    console.log('All students and attendance records deleted.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
