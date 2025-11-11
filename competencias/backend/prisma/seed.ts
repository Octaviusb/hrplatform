import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Permissions catalog (minimal)
  const permKeys = [
    'organizations.read',
    'organizations.create',
    'employees.read',
    'employees.create',
    'payroll.read',
    'payroll.send_dian',
  ];
  await Promise.all(
    permKeys.map(key => prisma.permission.upsert({ where: { key }, update: {}, create: { key } }))
  );

  // Superadmin user
  const superEmail = 'superadmin@competencias.local';
  const superPass = await bcrypt.hash('supersecret', 10);
  const superadmin = await prisma.user.upsert({
    where: { email: superEmail },
    update: { globalRole: 'superadmin' },
    create: { name: 'Super Admin', email: superEmail, passwordHash: superPass, globalRole: 'superadmin' },
  });

  // Demo org and admin
  const org = await prisma.organization.upsert({
    where: { nit: '900000001' },
    update: {},
    create: { name: 'Demo Org', nit: '900000001', size: 'small' },
  });

  const adminEmail = 'admin@demo.com';
  const adminPass = await bcrypt.hash('demo123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: 'Admin Demo', email: adminEmail, passwordHash: adminPass, globalRole: 'user' },
  });

  const membership = await prisma.membership.upsert({
    where: { userId_organizationId: { userId: adminUser.id, organizationId: org.id } },
    update: {},
    create: { userId: adminUser.id, organizationId: org.id },
  });

  // Org roles
  const orgAdmin = await prisma.role.upsert({
    where: { organizationId_roleKey: { organizationId: org.id, roleKey: 'org_admin' } },
    update: {},
    create: { organizationId: org.id, name: 'Administrador', roleKey: 'org_admin' },
  });

  // Grant all perms to org_admin
  const allPerms = await prisma.permission.findMany();
  await Promise.all(
    allPerms.map(p => prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: orgAdmin.id, permissionId: p.id } },
      update: {},
      create: { roleId: orgAdmin.id, permissionId: p.id },
    }))
  );

  // Assign role to admin membership
  await prisma.userRole.upsert({
    where: { membershipId_roleId: { membershipId: membership.id, roleId: orgAdmin.id } },
    update: {},
    create: { membershipId: membership.id, roleId: orgAdmin.id },
  });

  console.log('Seed completed:', { superadmin: superadmin.email, demoAdmin: adminUser.email, org: org.name });
}

main().finally(() => prisma.$disconnect());
