import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking for duplicate students...');

        // Group students by name and class
        const students = await prisma.student.findMany({
            select: {
                id: true,
                name: true,
                class: true,
                nisn: true,
            },
        });

        const studentMap = new Map<string, any[]>();

        for (const student of students) {
            const key = `${student.name.trim().toLowerCase()}|${student.class.trim()}`;
            if (!studentMap.has(key)) {
                studentMap.set(key, []);
            }
            studentMap.get(key)?.push(student);
        }

        let duplicateCount = 0;

        for (const [key, group] of studentMap.entries()) {
            if (group.length > 1) {
                duplicateCount++;
                const [name, className] = key.split('|');
                console.log(`Duplicate found: ${name} (Class: ${className})`);
                group.forEach(s => {
                    console.log(`  - ID: ${s.id}, NISN: ${s.nisn}`);
                });
            }
        }

        if (duplicateCount === 0) {
            console.log('No duplicates found based on Name and Class.');
        } else {
            console.log(`Found ${duplicateCount} sets of duplicates.`);
        }

    } catch (error) {
        console.error('Error checking duplicates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
