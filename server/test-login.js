const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function test() {
    const user = await prisma.user.findUnique({
        where: {
            email: "coordinator@siet-esports.in"
        }
    });

    console.log("User found:", !!user);
    console.log("Active:", user?.isActive);

    if (user) {
        const matches = await bcrypt.compare(
            "Coord@SIET2026",
            user.password
        );

        console.log("Password matches:", matches);
    }

    await prisma.$disconnect();
}

test();