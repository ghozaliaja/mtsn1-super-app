
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function updateViiiI() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'students_vii_i_update.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const studentsToUpdate = JSON.parse(rawData);

        console.log(`Starting update for ${studentsToUpdate.length} students in Class VII I...`);

        let updatedCount = 0;
        let notFoundCount = 0;

        for (const student of studentsToUpdate) {
            // Find student by name and class (case insensitive for name)
            const existingStudent = await prisma.student.findFirst({
                where: {
                    name: {
                        equals: student.name,
                        mode: 'insensitive'
                    },
                    class: 'VII I'
                }
            });

            if (existingStudent) {
                await prisma.student.update({
                    where: { id: existingStudent.id },
                    data: {
                        nisn: student.nisn,
                        parentPhone: student.parentPhone
                    }
                });
                console.log(`✅ Updated: ${student.name}`);
                updatedCount++;
            } else {
                console.log(`❌ Not Found: ${student.name}`);
                notFoundCount++;
            }
        }

        console.log('\nUpdate Summary:');
        console.log(`Total Processed: ${studentsToUpdate.length}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Not Found: ${notFoundCount}`);

    } catch (error) {
        console.error('Error updating students:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateViiiI();
