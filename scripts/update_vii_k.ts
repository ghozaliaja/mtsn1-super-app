import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(process.cwd(), 'data', 'students_vii_k_update.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const students = JSON.parse(rawData);

    console.log(`Found ${students.length} students to update for Class VII K...`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const s of students) {
        // Find student by name and class
        const existingStudent = await prisma.student.findFirst({
            where: {
                name: {
                    equals: s.name,
                    mode: 'insensitive', // Case-insensitive match
                },
                class: 'VII K',
            },
        });

        if (existingStudent) {
            // Update NISN and Parent Phone
            await prisma.student.update({
                where: { id: existingStudent.id },
                data: {
                    nisn: s.nisn,
                    parentPhone: s.parentPhone,
                },
            });
            console.log(`Updated: ${s.name}`);
            updatedCount++;
        } else {
            console.warn(`Student not found: ${s.name}`);
            notFoundCount++;
        }
    }

    console.log(`\nUpdate Complete.`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not Found: ${notFoundCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
