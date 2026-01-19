
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipeToday() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('🧹 Wiping attendance records for today...');

        const { count } = await prisma.attendance.deleteMany({
            where: {
                createdAt: {
                    gte: today
                }
            }
        });

        console.log(`✅ DELETED ${count} records.`);
        console.log('Bot should be quiet now.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

wipeToday();
