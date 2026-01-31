
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPendingWA() {
    console.log('Checking for PENDING WA messages...');

    // Check pending count
    const pendingCount = await prisma.attendance.count({
        where: {
            waStatus: 'PENDING'
        }
    });

    console.log(`Total Pending: ${pendingCount}`);

    // Get recent pending
    const pendingList = await prisma.attendance.findMany({
        where: {
            waStatus: 'PENDING',
        },
        include: {
            student: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5
    });

    if (pendingList.length > 0) {
        console.log('Recent Pending Records:');
        pendingList.forEach(p => {
            console.log(`- ${p.student.name} (${p.student.class}) | ${p.status} | Created: ${p.createdAt.toLocaleString()} | Phone: ${p.student.parentPhone}`);
        });
    } else {
        console.log('No pending records found.');
    }

    // Also check the specific student "Guru Test 1" if possible, or just recent successful scans
    console.log('\n--- Recent Attendance Records (Any Status) ---');
    const recent = await prisma.attendance.findMany({
        take: 5,
        orderBy: {
            updatedAt: 'desc'
        },
        include: {
            student: true
        }
    });
    recent.forEach(p => {
        console.log(`- ${p.student.name} | WA Status: ${p.waStatus} | Updated: ${p.updatedAt.toLocaleString()}`);
    });
}

checkPendingWA()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
