
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateScan(qrCode: string) {
    console.log(`Simulating scan for QR Code: '${qrCode}'`);
    try {
        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { barcode: qrCode },
                    { nisn: qrCode }
                ]
            }
        });

        if (student) {
            console.log('SUCCESS: Student found!');
            console.log(`Name: ${student.name}`);
            console.log(`Class: ${student.class}`);
            console.log(`NISN: ${student.nisn}`);
        } else {
            console.log('FAILED: Student NOT found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Test with ARIF AHDIAN PRATAMA from VIII D
simulateScan('0127613870');
