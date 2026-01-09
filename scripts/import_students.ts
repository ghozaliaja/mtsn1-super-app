import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const filename = args[0];
    const className = args[1];

    if (!filename || !className) {
        console.error('Usage: npx tsx scripts/import_students.ts <filename> <classname>');
        console.error('Example: npx tsx scripts/import_students.ts students_ix_c.json "IX C"');
        process.exit(1);
    }

    const dataPath = path.join(process.cwd(), 'data', filename);

    if (!fs.existsSync(dataPath)) {
        console.error(`File not found: ${dataPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const students = JSON.parse(rawData);

    console.log(`Found ${students.length} students to import for class ${className}.`);

    for (const student of students) {
        try {
            // Check if student exists by name and class (to avoid duplicates if NISN is missing or wrong)
            // But NISN is unique, so upsert by NISN is best.

            const result = await prisma.student.upsert({
                where: { nisn: student.nisn },
                update: {
                    name: student.name,
                    class: className,
                    parentPhone: student.parentPhone,
                },
                create: {
                    nisn: student.nisn,
                    name: student.name,
                    class: className,
                    parentPhone: student.parentPhone,
                },
            });
            console.log(`Imported: ${result.name} (${result.nisn})`);
        } catch (error) {
            console.error(`Error importing ${student.name}:`, error);
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
