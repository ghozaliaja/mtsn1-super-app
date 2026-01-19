
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWhitespace() {
    try {
        const students = await prisma.student.findMany({
            where: {
                class: 'VIII D'
            },
            select: {
                id: true,
                name: true,
                nisn: true
            }
        });

        console.log(`Checking ${students.length} students for whitespace issues...`);
        let issues = 0;
        students.forEach(s => {
            if (s.nisn) {
                if (s.nisn.trim() !== s.nisn) {
                    console.log(`[WHITESPACE] ${s.name}: '${s.nisn}' (Length: ${s.nisn.length})`);
                    issues++;
                }
                if (s.nisn.includes(' ')) {
                    console.log(`[INTERNAL SPACE] ${s.name}: '${s.nisn}'`);
                    issues++;
                }
            } else {
                console.log(`[NULL] ${s.name} has no NISN`);
                issues++;
            }
        });

        if (issues === 0) {
            console.log("No whitespace issues found in VIII D.");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkWhitespace();
