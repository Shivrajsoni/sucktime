import { prisma } from "..";

const USER_ID = "3";
async function seed() {
    await prisma.user.create({
        data: {
            id:USER_ID,
            email: "test@test.com",
        }
    })

    const website = await prisma.website.create({
        data: {
            url: "https://test.com",
            userId: USER_ID
        }
    })

    const validator = await prisma.validator.create({
        data: {
            publicKey: "0x12341223123",
            location: "Delhi",
            ip: "127.0.0.1",
        }
    })

    await prisma.websiteTick.create({
        data: {
            websiteId: website.id,
            status: "Good",
            createdAt: new Date(),
            latency: 100,
            validatorId: validator.id
        }
    })

    await prisma.websiteTick.create({
        data: {
            websiteId: website.id,
            status: "Good",
            createdAt: new Date(Date.now() - 1000 * 60 *10),
            latency: 100,
            validatorId: validator.id
        }
    })

    await prisma.websiteTick.create({
        data: {
            websiteId: website.id,
            status: "Bad",
            createdAt: new Date(Date.now() - 1000 * 60 * 20),
            latency: 100,
            validatorId: validator.id
        }
    })
}

seed();