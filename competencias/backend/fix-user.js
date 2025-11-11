import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixUser() {
  const email = 'obuitragocamelo@yahoo.es';
  const password = '//Ener19447/*';
  
  try {
    // Verificar si el usuario existe
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('Usuario no existe, creándolo...');
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          name: 'Octavio Buitrago',
          email: email,
          passwordHash: passwordHash,
          globalRole: 'superadmin'
        }
      });
      console.log('Usuario creado:', user);
    } else {
      console.log('Usuario existe, actualizando contraseña y rol...');
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { email },
        data: {
          passwordHash: passwordHash,
          globalRole: 'superadmin'
        }
      });
      console.log('Usuario actualizado:', { id: user.id, email: user.email, globalRole: user.globalRole });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();