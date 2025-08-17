import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

async function main() {
  const email = "test@example.com";
  const password = "123456";
  const name = "Test User";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("User đã tồn tại:", email);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hash, name },
  });

  console.log("✅ Tạo user mẫu thành công:");
  console.log({ email, password });
}

main().finally(() => prisma.$disconnect());
