
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTodayAttendance() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const records = await prisma.attendance.findMany({
            where: {
                createdAt: {
                    gte: today
                }
            },
            include: {
                student: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Found ${records.length} attendance records for today:`);
        records.forEach(r => {
            console.log(`- ${r.student.name} (${r.student.class}) | Status: ${r.status} | WA: ${r.waStatus} | Created: ${r.createdAt.toLocaleTimeString()}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTodayAttendance();
