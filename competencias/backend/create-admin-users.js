import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUsers() {
  try {
    console.log('Creating admin users...');

    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@hrplatform.com',
        password: 'admin123',
        globalRole: 'superadmin'
      },
      {
        name: 'Admin Usuario',
        email: 'admin@hrplatform.com', 
        password: 'admin123',
        globalRole: 'user'
      },
      {
        name: 'Director RH',
        email: 'director@hrplatform.com',
        password: 'admin123', 
        globalRole: 'user'
      },
      {
        name: 'Usuario Demo',
        email: 'test@test.com',
        password: '123456',
        globalRole: 'user'
      }
    ];

    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            passwordHash: hashedPassword,
            globalRole: userData.globalRole
          }
        });
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    console.log('\n📋 Credenciales de acceso:');
    console.log('Super Admin: superadmin@hrplatform.com / admin123');
    console.log('Admin: admin@hrplatform.com / admin123');
    console.log('Director: director@hrplatform.com / admin123');
    console.log('Demo: test@test.com / 123456');

  } catch (error) {
    console.error('Error creating admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers();