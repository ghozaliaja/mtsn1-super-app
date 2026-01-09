import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const filename = args[0];
    const className = args[1];

    if (!filename || !className) {
        console.error('Usage: npx tsx scripts/import_names.ts <filename> <classname>');
        console.error('Example: npx tsx scripts/import_names.ts students_vii_b.json "VII B"');
        process.exit(1);
    }

    const dataPath = path.join(process.cwd(), 'data', filename);

    if (!fs.existsSync(dataPath)) {
        console.error(`File not found: ${dataPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const names = JSON.parse(rawData);

    console.log(`Found ${names.length} names to import for class ${className}.`);

    let importedCount = 0;

    for (const name of names) {
        try {
            // Check if student exists by name and class
            const existing = await prisma.student.findFirst({
                where: {
                    name: name,
                    class: className
                }
            });

            if (existing) {
                console.log(`Skipped (already exists): ${name}`);
            } else {
                await prisma.student.create({
                    data: {
                        name: name,
                        class: className,
                        nisn: null, // Explicitly null
                        barcode: null,
                        parentPhone: null
                    }
                });
                console.log(`Imported: ${name}`);
                importedCount++;
            }
        } catch (error) {
            console.error(`Error importing ${name}:`, error);
        }
    }

    console.log(`Finished. Imported ${importedCount} new students.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
