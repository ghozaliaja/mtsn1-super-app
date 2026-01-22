import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Seeding Users via API...");

    try {
        // 1. Create Admin
        await prisma.user.upsert({
            where: { username: 'admin' },
            update: { password: 'adminmts' },
            create: { username: 'admin', password: 'adminmts', role: Role.ADMIN },
        });

        // 2. Create BK Users (ODOC 1-6)
        for (let i = 1; i <= 6; i++) {
            const username = `odoc${i}`;
            await prisma.user.upsert({
                where: { username: username },
                update: {},
                create: { username: username, password: 'guru', role: Role.BK },
            });
        }

        // 3. Create Main ODOC User
        await prisma.user.upsert({
            where: { username: 'odoc' },
            update: { password: 'bk' },
            create: { username: 'odoc', password: 'bk', role: Role.BK },
        });

        // 4. Create Wali Kelas
        const classes = [
            'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F', 'VII G', 'VII H', 'VII I',
            'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII F', 'VIII G', 'VIII H', 'VIII I',
            'IX A', 'IX B', 'IX C', 'IX D', 'IX E', 'IX F', 'IX G', 'IX H', 'IX I'
        ];

        for (const className of classes) {
            let classNum = className.split(' ')[0];
            if (classNum === 'VII') classNum = '7';
            if (classNum === 'VIII') classNum = '8';
            if (classNum === 'IX') classNum = '9';

            const classLetter = className.split(' ')[1].toLowerCase();
            const username = `kelas${classNum}${classLetter}`;

            await prisma.user.upsert({
                where: { username: username },
                update: {},
                create: {
                    username: username,
                    password: 'guru',
                    role: Role.WALIKELAS,
                    assignedClass: className,
                },
            });
        }

        return NextResponse.json({ message: 'User seeding successful', timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: 'Seeding failed', details: error }, { status: 500 });
    }
}
