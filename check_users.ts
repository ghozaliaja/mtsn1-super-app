
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            username: {
                in: ['kelas7j', 'kelas7k']
            }
        }
    });

    console.log('Found users:', users);

    const allUsers = await prisma.user.findMany({
        select: { username: true, role: true }
    });
    console.log('All users:', allUsers.map(u => `${u.username} (${u.role})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
