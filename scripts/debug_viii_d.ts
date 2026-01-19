
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkViiiD() {
    try {
        const students = await prisma.student.findMany({
            where: {
                class: 'VIII D'
            },
            select: {
                id: true,
                name: true,
                nisn: true,
                class: true
            }
        });

        console.log(`Found ${students.length} students in VIII D:`);
        students.forEach(s => {
            console.log(`- ${s.name} | NISN: '${s.nisn}' | ID: ${s.id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkViiiD();
