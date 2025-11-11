// Usage: node scripts/make-superadmin.js <email>
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/make-superadmin.js <email>');
    process.exit(1);
  }
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { globalRole: 'superadmin' },
    });
    console.log('User updated to superadmin:', { id: user.id, email: user.email, globalRole: user.globalRole });
  } catch (e) {
    console.error('Failed to update user. Ensure the email exists.', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
