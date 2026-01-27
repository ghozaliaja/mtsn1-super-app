
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const newClasses = ['VII J', 'VII K'];

    for (const className of newClasses) {
        let classNum = '7'; // VII
        const classLetter = className.split(' ')[1].toLowerCase();
        const username = `kelas${classNum}${classLetter}`;

        console.log(`Creating user: ${username} for class ${className}`);

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

    console.log('Users created successfully.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
