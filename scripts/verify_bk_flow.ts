
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Starting BK Feature Verification...');

    // 1. Get Users
    const waliKelas = await prisma.user.findUnique({ where: { username: 'kelasviia' } });
    const bkUser = await prisma.user.findUnique({ where: { username: 'odoc' } });
    const student = await prisma.student.findFirst({ where: { class: 'VII A' } });

    if (!waliKelas || !bkUser || !student) {
        console.error('❌ Missing test data (Users/Student)');
        return;
    }

    console.log(`✅ Test Data: Wali=${waliKelas.username}, BK=${bkUser.username}, Student=${student.name}`);

    // 2. Create Case (Wali Kelas)
    console.log('\n📝 Testing Create Case...');
    const newCase = await prisma.counselingCase.create({
        data: {
            studentId: student.id,
            reporterId: waliKelas.id,
            violationType: 'PC',
            description: 'Test Violation Description',
            status: 'PENDING'
        }
    });
    console.log(`✅ Case Created: ID ${newCase.id}, Status: ${newCase.status}`);

    // 3. Fetch Cases (BK)
    console.log('\n🔍 Testing Fetch Cases (BK View)...');
    const cases = await prisma.counselingCase.findMany({
        where: { status: 'PENDING' },
        include: { student: true }
    });
    const found = cases.find(c => c.id === newCase.id);
    if (found) {
        console.log(`✅ Case found in BK list: ${found.student.name} - ${found.violationType}`);
    } else {
        console.error('❌ Case NOT found in BK list');
    }

    // 4. Resolve Case (BK)
    console.log('\n✅ Testing Resolve Case...');
    const resolvedCase = await prisma.counselingCase.update({
        where: { id: newCase.id },
        data: {
            status: 'RESOLVED',
            resolution: 'Counseling completed. Student promised not to repeat.',
            resolvedAt: new Date()
        }
    });
    console.log(`✅ Case Resolved: Status: ${resolvedCase.status}, Resolution: ${resolvedCase.resolution}`);

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.counselingCase.delete({ where: { id: newCase.id } });
    console.log('✅ Test case deleted.');

    console.log('\n🎉 Verification Completed Successfully!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
