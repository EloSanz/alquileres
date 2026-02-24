
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const payments = await prisma.payment.findMany({
        where: {
            OR: [
                { dueDate: { gte: new Date('2026-01-01') } },
                { paymentDate: { gte: new Date('2026-01-01') } }
            ]
        },
        take: 10
    })

    console.log(JSON.stringify(payments, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
