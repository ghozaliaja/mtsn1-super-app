import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'students_ix_d_update.json');
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const studentsToUpdate = JSON.parse(fileContent);

        console.log(`Found ${studentsToUpdate.length} students to update.`);

        for (const studentData of studentsToUpdate) {
            const { name, nisn, parentPhone } = studentData;

            const student = await prisma.student.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive',
                    },
                    class: 'IX D'
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
