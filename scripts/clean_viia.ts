import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning dummy NISN for Class VII A...');

    // 1. Find all students in VII A
    const students = await prisma.student.findMany({
        where: {
            class: 'VII A',
        },
    });

    console.log(`Total students in VII A: ${students.length}`);

    let updatedCount = 0;

    for (const student of students) {
        // We want to keep the name but remove the NISN (set to null)
        // The user said "kalo belum ada data selain nama ya sudah nama aja letakkan bro"
        // And "jangan lagi buat data dummy bro"

        // Check if it has a value (it should, from seed)
        if (student.nisn !== null) {
            await prisma.student.update({
                where: { id: student.id },
                data: {
                    nisn: null,
                    barcode: null, // Also clear barcode if it was dummy
                    parentPhone: null // And parentPhone
                }
            });
            updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} students in VII A (NISN set to null).`);

    // Verify
    const finalStudents = await prisma.student.findMany({
        where: { class: 'VII A' },
        select: { name: true, nisn: true }
    });

    console.log('Current VII A Data:');
    finalStudents.forEach(s => {
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
