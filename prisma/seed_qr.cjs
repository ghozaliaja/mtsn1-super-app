require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
    console.log('Start seeding QR test data...')

    // Create or Update a test student
    const student = await prisma.student.upsert({
        where: { barcode: '12345678' },
        update: {},
        create: {
            name: 'Ahmad Fulan (Test QR)',
            class: 'VII A',
            nis: '12345678',
            barcode: '12345678',
            parentPhone: '081234567890'
        },
    })

    console.log(`Created/Found test student: ${student.name} with barcode: ${student.barcode}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
