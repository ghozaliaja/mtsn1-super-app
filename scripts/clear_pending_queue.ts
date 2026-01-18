import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing pending WA queue...');

    const result = await prisma.attendance.updateMany({
        where: {
            waStatus: 'PENDING'
        },
        data: {
            waStatus: 'CANCELLED' // Mark as cancelled so they don't get sent
        }
    });

    console.log(`Cleared ${result.count} pending records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
