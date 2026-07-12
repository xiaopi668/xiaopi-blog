import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUsername = "admin";
  const existing = await prisma.user.findUnique({ where: { username: adminUsername } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        name: "管理员",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("管理员用户已创建 (admin / admin123)");
  } else {
    console.log("管理员用户已存在");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
