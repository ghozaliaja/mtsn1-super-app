import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const studentsVIIA = [
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

const studentsIXA = [
    "ABDUL FAJAR SITOMPUL",
    "AFRINA FATHIYA DALIMUNTHE",
    "AHMAD DAIROBI RAMBE",
    "ALYA ANISA PUTRI RITONGA",
    "AMANDA AZZAHRA HARAHAP",
    "ANNISA' FITRI",
    "APRILLIANI SYAHPUTRI",
    "ATHAYA AKBAR DWITAMA NST",
    "BARA OLOAN SIREGAR",
    "DEA AFLORIN",
    "FAUJI SULAIMAN RITONGA",
    "IBRAHIM MOVICH",
    "IKHSAN ALFITRA",
    "ISHMAH MUJAHIDAH MANURUNG",
    "M. AZKA ALFAROBY SINAMBELA",
    "MELSYA NAURA DAHMI",
    "MUHAMMAD GHALIB RAFANDI",
    "MUHAMMAD SULTAN ARIF RITONGA",
    "NABILA LUNA KHAIRANI RITONGA",
    "NUR CAHYATI",
    "PADILATUR RISKIYA SITORUS",
    "PRAYUGA AL HAFIAN",
    "RAJA MAHMUD ALFAUZAN MUNTHE",
    "RANGGITA WULAN SARI SIREGAR",
    "RIFQI ADWATAMA R",
    "RIZKY AULIA PRATAMA RAMBE",
    "SALWA AULIA",
    "SYAHIRAH HAFIZAH NASUTION",
    "SYAHRAINI FITRI AMELIA",
    "SYAREEFA AULIA AZZAHRA",
    "SYIFA AL-CHAIR",
    "ZAHIRAH ZAHRA MUNTHE"
]

const studentsIXB = [
    "AIDA QUUDS FITHRIYYAH BR DALIMUNTHE",
    "ALFIRA RAYRUNNISA LUBIS",
    "DAFA HAFIZHUR RASYID LUBIS",
    "DAFFA FADILLAH SIREGAR",
    "FAHRI AKBAR LUBIS",
    "FAKHIRA SHAKIRAH",
    "FAQIH AHMAD FATHIR RAMBE",
    "FARHAN ALZAKKY",
    "FIRZA AL-RAMADHAN NASUTION",
    "FITRAH RAMADHAN SIREGAR",
    "INAYAH FADHLA HASIBUAN",
    "IRGI FAHREZI POHAN",
    "M. FAHRI ABDILLAH RITONGA",
    "M. SUTAN BANUA SAGALA",
    "MEITHA ADHA",
    "MUTIA FLOWRENDILA NASUTION",
    "NADIYA KIRANA HERDIANI",
    "NAYLA SYAFIRA",
    "NUR HAFIZHAH",
    "NURUL AQILA",
    "RAFA AULIA",
    "RAFI ATHAYA POHAN",
    "RAKHA AL KASYAFII RAMBE",
    "RESKY ALFADHILLAH MANALU",
    "RISKI ADITIA FRIMA PANJAITAN",
    "SALSABILA HASIBUAN",
    "SALSABILA NASUTION",
    "SARTA BARITA SAIR PUTRA RITONGA",
    "SHIFWAH NISRINA FARAH SIREGAR",
    "TEGUH ABDILLAH DALIMUNTHE",
    "YUANDRA AZ ZUMAR AL-AMIN HSB"
]

const studentsIXC = [
    "ASTRI AULIA HASIBUAN",
    "AYU DIRANI",
    "CHAISEY KHAIRANI ZULADI",
    "ELVAN TERITO",
    "FAKHRI S ARROFI RAMBE",
    "HADI KURNIAWAN",
    "HADZAIRA ANGGRAINI",
    "HAMDANI SAGIDAN BAIJASNI PANE",
    "IRSAN ZACKI SIREGAR",
    "JACINDA CALISTA",
    "MUHAMMAD FAKHRI AZMI",
    "MUHAMMAD HAFIDZUL IHSAN",
    "MUHAMMAD IKHSAN GARAMBA",
    "MUHAMMAD RASYD AL HAFIZ",
    "MUHAMMAD SAIFATUL HAKIM SARAGIH",
    "MUKTARUSSYARIF",
    "NAILA SUHAILAH SIREGAR",
    "NASYWA PUTRI NURINSYAH",
    "NAUFAL HARIRI SIREGAR",
    "NINDY AFIFAH",
    "RAISA RAFANIA",
    "RAJA DOLY IBRAHIM HASIBUAN",
    "RATIH PRATIKA PRABAWATI",
    "RIZKY IHSAN SIMANJUNTAK",
    "RIZKY NAFISAH",
    "SAFIRA ZAKIYYATUN NUFUS",
    "SALWA NIRWANA HARAHAP",
    "SYFA NAUBIL ZAHRA HARAHAP",
    "TSANIYAH SRI RIZKY SIREGAR",
    "YUSFA NAJILA RITONGA",
    "ZEIDAN AL HAFIZ FINDA HARAHAP",
    "ZIVA LETISHA SIREGAR"
]

const studentsIXD = [
    "ABDI PRATAMA NASUTION",
    "ADE TAMIMA APRIANI NST",
    "ADELIA ERWIANI",
    "AHMAD FIKRI RAMADHAN RITONGA",
    "AJMAL FAIDHUL ANWAR",
    "ALFA REZY ADHA",
    "ALMIRA NURHASANAH PULUNGAN",
    "ANGGA SYAHPUTRA",
    "AUREL NAZMI SYAH HASIBUAN",
    "CENDE ALFARIZI HARAHAP",
    "DZAKI FIKRI NASUTION",
    "JAKI WIRA SYAHPUTRA",
    "KAIRA ADIVA DONGORAN",
    "KHAYLA ADNI FADHILAH HRP",
    "M. FAHRIZAL RITONGA",
    "MAULI SYAHRINI DALIMUNTHE",
    "MUHAMMAD FATHIR ALRAFA",
    "MUHAMMAD HAFIS SIREGAR",
    "NABILA",
    "NAJLA RUHAYA DAULAY",
    "NAKHWAN SAHID RITONGA",
    "NANDA AL-AYUMI NASUTION",
    "NAOURA ANNAJWA IRAWAN",
    "NAZWA CINDYA PUTRI POHAN",
    "NUR ASSYIFA",
    "PUTRI ASYRA POHAN",
    "QAILA AQILA HANUN NASUTION",
    "RATU ANISA",
    "SAZKYA PUTRI SIREGAR",
    "SITI FADILA SYAHIRA NST",
    "SYAKIRAH ATHAYA HASIBUAN",
    "ZULFA AZ-ZAHRA HASIBUAN"
]

const studentsIXE = [
    "AHMAD AL HAFIZI NST",
    "AHMAD AL MUCHTAR SIAGIAN",
    "AIDIL MAHDIYA HILMY HASIBUAN",
    "ALPIN DALIMUNTHE",
    "ALVINO IBRAZA MATONDANG",
    "AUFA SYAH KANSA NASUTION",
    "BAIHAQI FAHREZI",
    "DINDA RAHMAYANI NASUTION",
    "FATTAHUR RIZQY ABDI SIREGAR",
    "HAURA NAJIHA RAMBE",
    "HAYATUL MAFROH ROKAN",
    "KALIFA ZUKHRUF RATU SALINA",
    "MAULIDA FEBRIYANI",
    "MUHAMMAD SOLEH SIREGAR",
    "NASYA ANNAYA BALQIES",
    "OKA DWI ARIANSYAH. S",
    "QUINSHA NAMIRA SIREGAR",
    "RAFA AIN MULK",
    "RAFI AULIA",
    "RAFIFAH DALIMUNTHE",
    "RANI PRATIWI",
    "RERI RAHAYU SIREGAR",
    "REVI ELVIANA",
    "SAHIRA NEEZMARA EFRIL LUBIS",
    "SANDI BOY ALBANJARI",
    "SHIFA AZ ZAHRA NASUTION",
    "SYAHRIAL FAZRI SIREGAR",
    "SYIFA SANIKA HUSNA",
    "TULUS BIMANTORO",
    "VIONA AULIA NASUTION",
    "YUSNA NASUTION",
    "ZAHROTU SHIFA"
]

const studentsIXF = [
    "ADE AL-THOFUNNISA RITONGA",
    "ADE RIZKY AL KAHFI",
    "AIDIL ADHA",
    "AQSHAL DZAKI RAMADHAN RITONGA",
    "ATIKA DARWININGSIH SIREGAR",
    "AZRIANO PRASETYA",
    "BAYU FAHRINSAL",
    "FABIAN AZKA AULIA SIREGAR",
    "FELICIA SEPIO MARWAH",
    "FITHRA FADHILA",
    "JUNITA SYAHQILA NAZWAH",
    "LISTA HAFIZA",
    "MUHAMMAD FAHRI DASOPANG",
    "NABILA SALSABILA",
    "NAJLA ARIFAH MUNTHE",
    "NANDA ASIFAH",
    "NAZWA AYU SAHIRA HASIBUAN",
    "NOVI YANTI",
    "NURI APRILIA",
    "RAFLY ALHAMID NST",
    "RAJA AHMAD FIRDAUS",
    "RAJALI SITOMPUL",
    "RAYHAN PRAMUDIA SIREGAR",
    "RIZKI AULIA NUR FADILA MUNTHE",
    "RIZKY ANANDA",
    "RIZQY ANANDA HASUGIAN",
    "SABRIYANSYAH ILHAM",
    "SALSABILAH SIHOMBING",
    "SALSABILAH STEVANY",
    "ZAHIRA MUTIARA SIREGAR",
    "ZHAAFIRAH HUMAIRA"
]

const studentsIXG = [
    "AIDIL RIZKY DEBRIADI",
    "ANDINI RANIAH PUTRI SAMOSIR",
    "BELLA SRI APRIYANTI",
    "CIKA PUTRI BR SINURAT",
    "DINDA AUDINA",
    "DINDA ZASKIA SALSABILLA",
    "FADIYA KANAYA MILYUNA ZILIWU",
    "FAIEZA NAPIL GUSRI DAULAY",
    "FATHUR RAHMAN",
    "HABIB HAYRUDDIN NASUTION",
    "HAFIZ DWI PUTRA SANDI",
    "HANIF RAJULUN 'AQIL",
    "HILYA NAFISA RITONGA",
    "JIHAN MARITZA SIREGAR",
    "KHAIRANI YUNISKA",
    "KHAIRUN NISA SIREGAR",
    "MESIFA ADRIANI DALIMUNTHE",
    "MUTHIA HAMIDAH SIREGAR",
    "NADIN TAZKIAH HARAHAP",
    "NURLIZA RAHMA",
    "PUTRI NAJA AMIRA",
    "RAFKA AJIE ARDHIKA",
    "RAHMAD SYAHPUTRA HARAHAP",
    "REIHAN ARAFAH",
    "RERARA NABILA DALIMUNTHE",
    "RIZKI ARMANDA RAMBE",
    "SAINDARAN NASUTION",
    "SITI ALPI RAMADANI",
    "STEVANLI APRILIANO",
    "TASYA SYAFRIKA HARAHAP",
    "USWATUN HASANAH"
]

const studentsIXH = [
    "ADITYA DAXENA PERMANA",
    "AFFAN ABRAR",
    "AHMAD ZAKI",
    "ALFINA NINGSIH",
    "ANUGRAH ZAIN NASUTION",
    "ATIQAH ENNO ZHAFIRAH GINTING",
    "DWI AZHARA SALSA BILA",
    "DZAKIY ZUHAIR",
    "FIKRI RITONGA",
    "FITHRAH ZAIDAN AFKAR NASUTION",
    "FRIZELLA AURYA ARTHA",
    "KHUMAYRAH PUTRI KASORA DALIMUNTHE",
    "LATIFAH ZUKHRUF RATU SALINA",
    "MAYA JELITA",
    "MUHAMMAD AL FAHREZI",
    "MUHAMMAD IBNU RIZQULLAH",
    "MUHAMMAD WAHYU SANJAYA",
    "NADIENT AUERELIA RHENITA RHEHULINA B",
    "NAYRA RIZKINA PUTRI",
    "NAZHAN AL FATIR LUBIS",
    "NAZWA ALYA AZIZAH BR RITONGA",
    "NAZWA NABILA RITONGA",
    "R. SELLA RISTIANI SUMEGO",
    "RATU BALQIS SYAFRIA",
    "RAYHANS FAHLEVI",
    "ROFIQOH ADZKIYA DALIMUNTHE",
    "SALSA NABILA RITONGA",
    "SASKIA RIZKI QEYSA",
    "SYAHIRA DYANDRA SIREGAR",
    "TANIA RAMADHANI HARAHAP",
    "VANESA KHUMAIRAH"
]

const studentsIXI = [
    "AISYAH RIHAN ABYA NISA RAMBE",
    "ALFIZAH RITONGA",
    "ALYA NABILA FIDIANSYAH",
    "ALYA SYAHBILA PANE",
    "ANDREA AL FATIH",
    "AQILA MUTIARA",
    "ARN HABIBI RITONGA",
    "BAMBANG ADITYA SANTOSO",
    "CAHAYA TRI ANNISA RAMBE",
    "DAFFA HERI FIRDAUS",
    "DINI ARSANTI SITEPU",
    "DINO KURNIAWAN RITONGA",
    "KHAIRUL LUTHFI NASUTION",
    "KHALISYAH NOVA PRATIWI MATONDANG",
    "MUHAMMAD ALKINDY NASUTION",
    "MUHAMMAD DWI ANDHIKA LUBIS",
    "MUHAMMAD FARHAN HARAHAP",
    "MUHAMMAD NANDARUDDIN",
    "MUHAMMAD RIZKY HARAHAP",
    "NABILA RAMADANI",
    "NIKY IRWANSYAH",
    "NIZAM HUSAIN",
    "NURUL SA'BANI HASIBUAN",
    "RADHI AL HAFIZ",
    "RADITHIA ALFATHAN RIZKY",
    "RAJJA HUWAIDI HASIBUAN",
    "RICO AFANDI",
    "RIZKY RAMADHAN LUBIS",
    "SYAHID AQIL YUSRIL LUBIS",
    "ZAKWAN AFIF SIMAMORA"
]

const studentsIXJ = [
    "AFRIZA FIRMANSYAH",
    "AISYAH",
    "AKBAR AL HAFIDZ",
    "AMIRA AFRIL LINDA",
    "ANNISA PUTRI MAHARANI",
    "ASMA YUNITA RITONGA",
    "ASYIFA AZZUMARI PANANGIAN SIMBOLON",
    "AULIA ROCA AL MULFY",
    "CHANAYA HIJRIYAH",
    "CINTA NAYLA",
    "ELSA NARTA DINATA",
    "FARA DIRA NUR",
    "FAUZAN AZHIMA DALIMUNTHE",
    "FIKA AULIA FEBRIANI",
    "HABIB RAMBE",
    "MAULANNA HASBI",
    "MUHAMMAD AZAM",
    "MUHAMMAD HABIBI",
    "MUHAMMAD IHSAN",
    "MUHAMMAD RAKAN",
    "NADIN PRADILA",
    "NOVI ERLIANI",
    "SINDY FEBRIANI RITONGA",
    "SUCI NUR AZWA"
]

const studentsIXK = [
    "AFKAR NADHIF DZIKRA SIREGAR",
    "ANGGUN HARTINI",
    "ASHIFA",
    "AZZURIS DEFWAL",
    "BALQIES ROSA SAGALA",
    "CAHAYA LUTHFIYYAH SIREGAR",
    "CIKA PARADILA",
    "DWI FEBRIAN HSB",
    "ELSA MAYLANDA",
    "FITRAH RAMADHAN",
    "KEVIN ADRIAN",
    "KEYSA ALFARO LUBIS",
    "MHD. AZKA BAYNU",
    "MHD. GANDA PATIH",
    "MUHAMMAD NAUVAL",
    "NAYLA LATIFAH QUEENDA",
    "SABRINA KHAIRUNISA",
    "SILVIA NURHAIRIN LASE",
    "SUCI HARDIANTI",
    "ZAHRA RAHMADANI"
]

async function main() {
    console.log('Start seeding...')

    // Seed VII A
    for (const name of studentsVIIA) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'VII A' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'VII A',
                    nis: `7A${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX A
    for (const name of studentsIXA) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX A' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX A',
                    nis: `9A${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX B
    for (const name of studentsIXB) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX B' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX B',
                    nis: `9B${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX C
    for (const name of studentsIXC) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX C' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX C',
                    nis: `9C${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX D
    for (const name of studentsIXD) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX D' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX D',
                    nis: `9D${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX E
    for (const name of studentsIXE) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX E' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX E',
                    nis: `9E${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX F
    for (const name of studentsIXF) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX F' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX F',
                    nis: `9F${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX G
    for (const name of studentsIXG) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX G' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX G',
                    nis: `9G${Math.floor(Math.random() * 10000)}`
                },
            })
        }
    }

    // Seed IX H
    for (const name of studentsIXH) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX H' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX H',
                    nis: `9H${Math.floor(Math.random() * 100000)}`
                },
            })
        }
    }

    // Seed IX I
    for (const name of studentsIXI) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX I' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX I',
                    nis: `9I${Math.floor(Math.random() * 100000)}`
                },
            })
        }
    }

    // Seed IX J
    for (const name of studentsIXJ) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX J' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX J',
                    nis: `9J${Math.floor(Math.random() * 100000)}`
                },
            })
        }
    }

    // Seed IX K
    for (const name of studentsIXK) {
        const exists = await prisma.student.findFirst({ where: { name, class: 'IX K' } });
        if (!exists) {
            await prisma.student.create({
                data: {
                    name: name,
                    class: 'IX K',
                    nis: `9K${Math.floor(Math.random() * 100000)}`
                },
            })
        }
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
