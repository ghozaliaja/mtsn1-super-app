import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const students = [
    "AHSAN FAUZAN PUTRA SUGIONO",
    "ALBI MAHYA ZAINI",
    "ALBRIAN ALVARO DAULAY",
    "AMAR AL FARIZ SIAGIAN",
    "AZZAHRA NAHDA HAKIM NST",
    "DESRI HOLIZA HASIBUAN",
    "DZAKIRA TALITA NAILA",
    "EKA PUSPITA",
    "FARANNISA PUTRI",
    "HARISA DWIE PUTRI SEMBIRING",
    "JAFFAR AL HAJJ",
    "KHALIL AL GUFRON HASIBUAN",
    "KHUZAINI SYADID HASIBUAN",
    "M. YAFI SHIHAB",
    "MHD. NAZMIL DAFA SIPAYUNG",
    "MUAMMAR FATHAN ZUNA",
    "MUFIDA HANIM HASIBUAN",
    "NABILA AZZAHRA HASIBUAN",
    "NAUFAL AFKAR",
    "NAURA SALSABILUNA SAGALA",
    "NAYLA MUTHIA RAMADHANI",
    "NIZHAM MUHAMMAD AKBAR",
    "NUR AISYAH DWI PUTRI LUBIS",
    "Nur As-Syifah Aulia Purnama",
    "RADHIKA PRATAMA",
    "RAHMADANY LUBIS",
    "RIZKA KAMILA NASUTION",
    "SHAKILA RIZKA AL-ATTAYA LUBIS",
    "SHIFA RAIHANA RITONGA",
    "TENGKU BINTANG ZAWAHSA LEMARP",
    "ZAIZADA ZUHDU PARAPAT",
    "ZAKHIRA ZELDIN SIREGAR"
]

async function main() {
    console.log('Start seeding...')

    for (const name of students) {
        const student = await prisma.student.create({
            data: {
                name: name,
                class: 'VII A',
                // Optional: Generate a dummy NIS if needed, or leave it null
                nis: `7A${Math.floor(Math.random() * 10000)}` // Dummy NIS for now
            },
        })
        console.log(`Created student with id: ${student.id}`)
    }

    console.log('Seeding finished.')
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
