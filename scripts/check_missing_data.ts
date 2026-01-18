import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database audit for missing NISN and Parent Phone...');

    // Get all students
    const students = await prisma.student.findMany({
        select: {
            class: true,
            nisn: true,
            parentPhone: true,
        },
    });

    // Group by class
    const classStats: Record<string, { total: number; missing: number }> = {};

    for (const student of students) {
        const className = student.class;
        if (!classStats[className]) {
            classStats[className] = { total: 0, missing: 0 };
        }

        classStats[className].total++;

        // Check if NISN or Parent Phone is missing (null or empty string)
        if (!student.nisn || !student.parentPhone || student.nisn === '' || student.parentPhone === '') {
            classStats[className].missing++;
        }
    }

    // Convert to array and sort by missing count (descending)
    const results = Object.entries(classStats)
        .map(([className, stats]) => ({
            className,
            ...stats,
            percentage: ((stats.missing / stats.total) * 100).toFixed(1) + '%',
        }))
        .filter(stat => stat.missing > 0) // Only show classes with missing data
        .sort((a, b) => b.missing - a.missing);

    console.log('\n📊 SUMMARY OF MISSING DATA BY CLASS 📊');
    console.log('=======================================');
    if (results.length === 0) {
        console.log('✅ All classes have complete data!');
    } else {
        console.table(results);
        console.log('\nDetailed Breakdown:');
        results.forEach(r => {
            console.log(`- ${r.className}: ${r.missing} missing out of ${r.total} (${r.percentage})`);
        });
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
