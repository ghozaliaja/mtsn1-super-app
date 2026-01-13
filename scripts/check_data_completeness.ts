import { PrismaClient } from '@prisma/client';
import { CLASSES } from '../lib/constants';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking data completeness...');

    const allStudents = await prisma.student.findMany();
    const studentsByClass: Record<string, typeof allStudents> = {};

    // Group by class
    allStudents.forEach(s => {
        if (!studentsByClass[s.class]) {
            studentsByClass[s.class] = [];
        }
        studentsByClass[s.class].push(s);
    });

    console.log('\n--- Data Completeness by Class ---');
    console.log('Class\t| Total\t| NISN\t| WA\t| Complete (NISN+WA)');
    console.log('----------------------------------------------------');

    const existingClasses = Object.keys(studentsByClass).sort();

    existingClasses.forEach(className => {
        const students = studentsByClass[className];
        const total = students.length;
        const hasNisn = students.filter(s => s.nisn).length;
        const hasWa = students.filter(s => s.parentPhone).length;
        const complete = students.filter(s => s.nisn && s.parentPhone).length;

        console.log(`${className}\t| ${total}\t| ${hasNisn}\t| ${hasWa}\t| ${complete}`);
    });

    console.log('\n--- Missing Classes ---');
    const missingClasses = CLASSES.filter(c => !existingClasses.includes(c));
    if (missingClasses.length > 0) {
        console.log(missingClasses.join(', '));
    } else {
        console.log('None');
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
