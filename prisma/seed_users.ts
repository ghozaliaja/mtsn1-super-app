
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Users...');

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: 'admin123', // Default password
            role: Role.ADMIN,
        },
    });
    console.log('Created Admin:', admin.username);

    // 2. Create BK User (ODOC)
    const bk = await prisma.user.upsert({
        where: { username: 'odoc' },
        update: {},
        create: {
            username: 'odoc',
            password: 'guru', // Default password
            role: Role.BK,
        },
    });
    console.log('Created BK User:', bk.username);

    // 3. Create Wali Kelas (Simpler IDs: kelas7a, kelas8b, etc.)
    const classes = [
        'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F', 'VII G', 'VII H', 'VII I',
        'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII F', 'VIII G', 'VIII H', 'VIII I',
        'IX A', 'IX B', 'IX C', 'IX D', 'IX E', 'IX F', 'IX G', 'IX H', 'IX I'
    ];

    for (const className of classes) {
        // Convert Roman to Arabic for username
        let classNum = className.split(' ')[0];
        if (classNum === 'VII') classNum = '7';
        if (classNum === 'VIII') classNum = '8';
        if (classNum === 'IX') classNum = '9';

        const classLetter = className.split(' ')[1].toLowerCase();
        const username = `kelas${classNum}${classLetter}`; // e.g., kelas7a

        const wali = await prisma.user.upsert({
            where: { username: username },
            update: {},
            create: {
                username: username,
                password: 'guru',
                role: Role.WALIKELAS,
                assignedClass: className, // Keep Roman for system compatibility
            },
        });
        console.log(`Created Wali Kelas: ${wali.username} -> ${className}`);
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
