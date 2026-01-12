import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'students_viii_a_update.json');
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const studentsToUpdate = JSON.parse(fileContent);

        console.log(`Found ${studentsToUpdate.length} students to update.`);

        for (const studentData of studentsToUpdate) {
            const { name, nisn, parentPhone } = studentData;

            // Find student by name (case-insensitive search might be safer, but let's try exact first as names usually match)
            // We'll try to find by name and class 'VIII A' to be sure, although the prompt said "VIII A"
            // However, the current data might not have class set perfectly or we might want to be flexible.
            // Let's search by name first.

            const student = await prisma.student.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive', // Handle potential casing differences
                    },
                    class: 'VIII A' // Ensure we are updating the right class
                },
            });

            if (student) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: {
                        nisn: nisn,
                        parentPhone: parentPhone,
                    },
                });
                console.log(`Updated: ${name}`);
            } else {
                console.warn(`Student not found: ${name}`);
            }
        }

        console.log('Update process completed.');
    } catch (error) {
        console.error('Error updating students:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
