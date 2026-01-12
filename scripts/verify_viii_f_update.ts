import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.findMany({
            where: {
                class: 'VIII F',
            },
            select: {
                name: true,
                nisn: true,
                parentPhone: true,
            },
        });

        console.log(`Found ${students.length} students in Class VIII F.`);
        console.log('Sample data:');
        students.slice(0, 5).forEach(s => {
            console.log(`${s.name}: NISN=${s.nisn}, Phone=${s.parentPhone}`);
        });

        const missingData = students.filter(s => !s.nisn || !s.parentPhone);
        if (missingData.length > 0) {
            console.warn(`Warning: ${missingData.length} students still have missing data.`);
            missingData.forEach(s => console.log(`- ${s.name}`));
        } else {
            console.log('All students in Class VIII F have NISN and Parent Phone.');
        }

    } catch (error) {
        console.error('Error verifying students:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
