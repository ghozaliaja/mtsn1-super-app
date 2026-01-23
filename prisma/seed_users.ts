
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Users...');

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: 'adminmts', // Force update to correct password
        },
        create: {
            username: 'admin',
            password: 'adminmts',
            role: Role.ADMIN,
        },
    });
    console.log('Created Admin:', admin.username);

    // 2. Create BK Users (ODOC 1-6)
    for (let i = 1; i <= 6; i++) {
        const username = `odoc${i}`;
        const bk = await prisma.user.upsert({
            where: { username: username },
            update: {},
            create: {
                username: username,
                password: 'guru', // Default password
                role: Role.BK,
            },
        });
        console.log(`Created BK User: ${bk.username}`);
    }

    // Create Librarian User
    const librarian = await prisma.user.upsert({
        where: { username: 'pustakawan' },
        update: {
            password: 'buku',
        },
        create: {
            username: 'pustakawan',
            password: 'buku',
            role: Role.LIBRARY,
        },
    });
    console.log('Created Librarian:', librarian.username);

    // Create Main ODOC User (Requested)
    const mainOdoc = await prisma.user.upsert({
        where: { username: 'odoc' },
        update: {
            password: 'bk', // Force update to requested password
        },
        create: {
            username: 'odoc',
            password: 'bk',
            role: Role.BK,
        },
    });
    console.log('Created Main ODOC User:', mainOdoc.username);

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
