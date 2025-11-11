import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Usuario Test',
      email: 'test@test.com',
      passwordHash: hashedPassword,
    },
  });
  
  console.log('Usuario creado:', user);
}

createTestUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());