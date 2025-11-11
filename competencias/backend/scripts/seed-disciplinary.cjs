// Usage: node scripts/seed-disciplinary.cjs [organizationName]
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgNameArg = process.argv[2];
  // Resolve organization
  const organization = orgNameArg
    ? await prisma.organization.findFirst({ where: { name: orgNameArg } })
    : await prisma.organization.findFirst();
  if (!organization) {
    console.error('No organization found. Create an organization first.');
    process.exit(1);
  }
  console.log('Using organization:', organization.name, organization.id);

  // Find a superadmin user to attribute actions
  const superadmin = await prisma.user.findFirst({ where: { globalRole: 'superadmin' } });
  if (!superadmin) {
    console.error('No superadmin user found. Create or promote one first.');
    process.exit(1);
  }

  // Ensure a department exists
  const dept = await prisma.department.upsert({
    where: { id: `${organization.id}-dept-demo` },
    update: {},
    create: {
      id: `${organization.id}-dept-demo`,
      organizationId: organization.id,
      name: 'Operaciones',
      description: 'Departamento de Operaciones (demo)'
    }
  });

  // Seed employees (upsert by unique employeeNumber per org via composite custom logic)
  async function upsertEmployee(data) {
    const existing = await prisma.employee.findFirst({
      where: { organizationId: organization.id, employeeNumber: data.employeeNumber }
    });
    if (existing) return existing;
    return prisma.employee.create({ data });
  }

  const today = new Date();
  const employees = [];
  employees.push(await upsertEmployee({
    organizationId: organization.id,
    employeeNumber: 'E-0001',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana.perez@techcorp.demo',
    phone: null,
    identificationNumber: '12345678',
    identificationType: 'CC',
    departmentId: dept.id,
    positionId: null,
    hireDate: new Date(today.getFullYear() - 1, 0, 15),
    status: 'activo',
    salary: 3500000,
    vacationDays: 15,
    userId: null,
  }));
  employees.push(await upsertEmployee({
    organizationId: organization.id,
    employeeNumber: 'E-0002',
    firstName: 'Luis',
    lastName: 'Gómez',
    email: 'luis.gomez@techcorp.demo',
    phone: null,
    identificationNumber: '98765432',
    identificationType: 'CC',
    departmentId: dept.id,
    positionId: null,
    hireDate: new Date(today.getFullYear() - 2, 5, 1),
    status: 'activo',
    salary: 2800000,
    vacationDays: 15,
    userId: null,
  }));
  employees.push(await upsertEmployee({
    organizationId: organization.id,
    employeeNumber: 'E-0003',
    firstName: 'María',
    lastName: 'Rodríguez',
    email: 'maria.rodriguez@techcorp.demo',
    phone: null,
    identificationNumber: '55555555',
    identificationType: 'CC',
    departmentId: dept.id,
    positionId: null,
    hireDate: new Date(today.getFullYear() - 3, 8, 20),
    status: 'activo',
    salary: 4200000,
    vacationDays: 15,
    userId: null,
  }));

  console.log('Employees ready:', employees.map(e => ({ id: e.id, n: e.employeeNumber })));

  // Create a demo disciplinary case for first employee if none exists
  const targetEmp = employees[0];
  const existingCase = await prisma.disciplinaryCase.findFirst({
    where: { organizationId: organization.id, employeeId: targetEmp.id }
  });
  let dc;
  if (existingCase) {
    dc = existingCase;
    console.log('Existing disciplinary case found:', dc.id);
  } else {
    dc = await prisma.disciplinaryCase.create({
      data: {
        organizationId: organization.id,
        employeeId: targetEmp.id,
        status: 'open',
        reasonSummary: 'Incumplimiento reiterado del horario',
        details: 'Registros de asistencia muestran llegadas tardías en 5 ocasiones durante el último mes.',
        openedByUserId: superadmin.id,
        deadlines: null,
      }
    });
    console.log('Created disciplinary case:', dc.id);
  }

  // Add a demo charge if none exists
  const charge = await prisma.charge.findFirst({ where: { caseId: dc.id } });
  if (!charge) {
    const newCharge = await prisma.charge.create({
      data: {
        caseId: dc.id,
        title: 'Incumplimiento del horario laboral',
        description: 'Llegadas tardías recurrentes sin justificación documentada.',
        legalBasis: 'Reglamento Interno de Trabajo, art. 12; CST art. 58 (deberes del trabajador)',
        severity: 'medium',
        createdByUserId: superadmin.id,
      }
    });
    console.log('Added charge:', newCharge.id);
  } else {
    console.log('Charge already exists:', charge.id);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
