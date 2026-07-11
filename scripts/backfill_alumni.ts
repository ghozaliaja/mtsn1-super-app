import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.student.updateMany({
        where: {
            class: 'ALUMNI',
            graduationYear: null,
        },
        data: {
            graduationYear: 2026,
        },
    });

    console.log(`✅ Berhasil update ${result.count} alumni dengan tahun lulus 2026.`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
