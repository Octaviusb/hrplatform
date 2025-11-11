const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateCredentials() {
  try {
    // Actualizar credenciales del superadmin
    const hashedPassword = await bcrypt.hash('Ener19447/*', 10);
    
    await prisma.user.upsert({
      where: { email: 'obuitragocamelo@yahoo.es' },
      update: {
        passwordHash: hashedPassword,
        name: 'Super Admin',
        globalRole: 'superadmin'
      },
      create: {
        email: 'obuitragocamelo@yahoo.es',
        passwordHash: hashedPassword,
        name: 'Super Admin',
        globalRole: 'superadmin'
      }
    });

    console.log('✅ Credenciales de superadmin actualizadas');
    console.log('Email: obuitragocamelo@yahoo.es');
    console.log('Password: Ener19447/*');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCredentials();