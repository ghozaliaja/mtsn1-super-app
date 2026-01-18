import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(process.cwd(), 'data', 'students_viii_g_update.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const students = JSON.parse(rawData);

    console.log(`Found ${students.length} students to update for class VIII G...`);

    for (const student of students) {
        try {
            // Find student by name and class (case-insensitive name match)
            const existingStudent = await prisma.student.findFirst({
                where: {
                    name: {
                        equals: student.name,
                        mode: 'insensitive',
                    },
                    class: 'VIII G',
                },
            });

            if (existingStudent) {
                // Update NISN and Parent Phone
                await prisma.student.update({
                    where: { id: existingStudent.id },
                    data: {
                        nisn: student.nisn,
                        parentPhone: student.parentPhone,
                    },
                });
                console.log(`✅ Updated: ${student.name}`);
            } else {
                console.log(`❌ Student not found: ${student.name}`);
            }
        } catch (error) {
            console.error(`Error updating ${student.name}:`, error);
        }
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
