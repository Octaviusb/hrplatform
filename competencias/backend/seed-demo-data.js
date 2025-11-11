import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Iniciando población de datos de demo...');

  // 1. Crear superadministrador si no existe
  let superAdmin = await prisma.user.findUnique({
    where: { email: 'superadmin@hrplatform.com' }
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrador',
        email: 'superadmin@hrplatform.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        globalRole: 'superadmin'
      }
    });
    console.log('✅ Superadministrador creado: superadmin@hrplatform.com');
  }

  // Verificar si ya existe la organización
  let organization = await prisma.organization.findUnique({
    where: { nit: '900123456-7' }
  });

  if (!organization) {
    // 1. Crear organización demo
    organization = await prisma.organization.create({
      data: {
        name: 'TechCorp Solutions',
        nit: '900123456-7',
        size: 'medium',
        address: 'Calle 100 #15-20, Bogotá',
        phone: '+57 1 234-5678',
        email: 'info@techcorp.com',
        industry: 'Tecnología'
      }
    });
  }

  // 2. Crear usuarios demo si no existen
  const userEmails = ['ana.garcia@techcorp.com', 'carlos.rodriguez@techcorp.com', 'maria.lopez@techcorp.com'];
  const users = [];
  
  for (let i = 0; i < userEmails.length; i++) {
    let user = await prisma.user.findUnique({ where: { email: userEmails[i] } });
    if (!user) {
      const names = ['Ana García', 'Carlos Rodríguez', 'María López'];
      user = await prisma.user.create({
        data: {
          name: names[i],
          email: userEmails[i],
          passwordHash: await bcrypt.hash('123456', 10),
          globalRole: 'user'
        }
      });
    }
    users.push(user);
  }
  
  // Verificar si ya tienen membresía
  for (const user of users) {
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id
        }
      }
    });
    
    if (!existingMembership) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id
        }
      });
    }
  }

  // 3. Crear departamentos
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Desarrollo de Software',
        description: 'Equipo encargado del desarrollo de aplicaciones',
        organizationId: organization.id
      }
    }),
    prisma.department.create({
      data: {
        name: 'Recursos Humanos',
        description: 'Gestión del talento humano',
        organizationId: organization.id
      }
    }),
    prisma.department.create({
      data: {
        name: 'Marketing Digital',
        description: 'Estrategias de marketing y comunicación',
        organizationId: organization.id
      }
    })
  ]);

  // 4. Crear posiciones
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        title: 'Desarrollador Senior',
        description: 'Desarrollo de aplicaciones web y móviles',
        level: 'Senior',
        organizationId: organization.id,
        departmentId: departments[0].id
      }
    }),
    prisma.position.create({
      data: {
        title: 'Especialista en RRHH',
        description: 'Gestión de procesos de recursos humanos',
        level: 'Intermedio',
        organizationId: organization.id,
        departmentId: departments[1].id
      }
    }),
    prisma.position.create({
      data: {
        title: 'Analista de Marketing',
        description: 'Análisis y estrategias de marketing digital',
        level: 'Junior',
        organizationId: organization.id,
        departmentId: departments[2].id
      }
    })
  ]);

  // 5. Crear empleados
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        userId: users[0].id,
        organizationId: organization.id,
        employeeNumber: 'EMP001',
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@techcorp.com',
        phone: '+57 300 123-4567',
        identificationNumber: '12345678',
        identificationType: 'CC',
        departmentId: departments[0].id,
        positionId: positions[0].id,
        hireDate: new Date('2023-01-15'),
        status: 'active',
        salary: 4500000,
        vacationDays: 15
      }
    }),
    prisma.employee.create({
      data: {
        userId: users[1].id,
        organizationId: organization.id,
        employeeNumber: 'EMP002',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@techcorp.com',
        phone: '+57 300 234-5678',
        identificationNumber: '23456789',
        identificationType: 'CC',
        departmentId: departments[1].id,
        positionId: positions[1].id,
        hireDate: new Date('2023-03-20'),
        status: 'active',
        salary: 3800000,
        vacationDays: 15
      }
    }),
    prisma.employee.create({
      data: {
        userId: users[2].id,
        organizationId: organization.id,
        employeeNumber: 'EMP003',
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@techcorp.com',
        phone: '+57 300 345-6789',
        identificationNumber: '34567890',
        identificationType: 'CC',
        departmentId: departments[2].id,
        positionId: positions[2].id,
        hireDate: new Date('2023-06-10'),
        status: 'active',
        salary: 2800000,
        vacationDays: 15
      }
    })
  ]);

  // 6. Crear observaciones de ejemplo
  await Promise.all([
    prisma.observation.create({
      data: {
        employeeId: employees[0].id,
        observedBy: users[1].id,
        organizationId: organization.id,
        type: 'formal',
        category: 'Liderazgo',
        content: 'Ana demostró excelentes habilidades de liderazgo durante el proyecto de migración de la base de datos.',
        rating: 5,
        date: new Date('2024-10-15')
      }
    }),
    prisma.observation.create({
      data: {
        employeeId: employees[1].id,
        observedBy: users[0].id,
        organizationId: organization.id,
        type: 'informal',
        category: 'Comunicación',
        content: 'Carlos mostró gran capacidad para comunicar ideas complejas de manera clara en la reunión de equipo.',
        rating: 4,
        date: new Date('2024-10-20')
      }
    })
  ]);

  // 7. Crear entrevistas de ejemplo
  await Promise.all([
    prisma.interview.create({
      data: {
        employeeId: employees[0].id,
        interviewedBy: users[1].id,
        organizationId: organization.id,
        type: 'performance',
        scheduledDate: new Date('2024-11-15T10:00:00'),
        status: 'scheduled',
        notes: 'Evaluación trimestral de desempeño'
      }
    }),
    prisma.interview.create({
      data: {
        employeeId: employees[2].id,
        interviewedBy: users[1].id,
        organizationId: organization.id,
        type: 'development',
        scheduledDate: new Date('2024-10-25T14:00:00'),
        completedDate: new Date('2024-10-25T15:30:00'),
        status: 'completed',
        notes: 'Plan de desarrollo profesional',
        outcome: 'Se definió un plan de capacitación en herramientas de análisis de datos'
      }
    })
  ]);

  // 8. Crear solicitudes de vacaciones
  await Promise.all([
    prisma.vacation.create({
      data: {
        employeeId: employees[0].id,
        organizationId: organization.id,
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-30'),
        days: 8,
        status: 'approved',
        approvedBy: users[1].id,
        approvedDate: new Date('2024-11-01'),
        comments: 'Vacaciones de fin de año aprobadas'
      }
    }),
    prisma.vacation.create({
      data: {
        employeeId: employees[2].id,
        organizationId: organization.id,
        startDate: new Date('2024-11-25'),
        endDate: new Date('2024-11-29'),
        days: 5,
        status: 'pending',
        comments: 'Solicitud para puente festivo'
      }
    })
  ]);

  // 9. Crear registros de asistencia
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    for (const employee of employees) {
      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          organizationId: organization.id,
          date: date,
          checkIn: new Date(date.setHours(8, Math.floor(Math.random() * 30))),
          checkOut: new Date(date.setHours(17, Math.floor(Math.random() * 60))),
          hoursWorked: 8 + Math.random() * 2,
          status: 'present'
        }
      });
    }
  }

  // 10. Crear nóminas de ejemplo
  for (const employee of employees) {
    await prisma.payroll.create({
      data: {
        employeeId: employee.id,
        organizationId: organization.id,
        period: '2024-10',
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-10-31'),
        baseSalary: employee.salary || 3000000,
        bonuses: Math.floor(Math.random() * 500000),
        deductions: Math.floor(Math.random() * 200000),
        netSalary: (employee.salary || 3000000) + Math.floor(Math.random() * 500000) - Math.floor(Math.random() * 200000),
        status: 'processed'
      }
    });
  }

  console.log('✅ Datos de demo creados exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   - Organización: ${organization.name}`);
  console.log(`   - Usuarios: ${users.length}`);
  console.log(`   - Departamentos: ${departments.length}`);
  console.log(`   - Posiciones: ${positions.length}`);
  console.log(`   - Empleados: ${employees.length}`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('Superadmin: superadmin@hrplatform.com | Password: admin123');
  console.log('Usuarios demo: ana.garcia@techcorp.com, carlos.rodriguez@techcorp.com, maria.lopez@techcorp.com | Password: 123456');
}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error al poblar datos de demo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });',
        paymentDate: new Date('2024-10-30')
      }
    });
  }

  console.log('✅ Datos de demo creados exitosamente:');
  console.log(`- Organización: ${organization.name}`);
  console.log(`- Usuarios: ${users.length}`);
  console.log(`- Usuarios con acceso a la organización configurados`);
  console.log(`- Departamentos: ${departments.length}`);
  console.log(`- Empleados: ${employees.length}`);
  console.log(`- Observaciones, entrevistas, vacaciones y más datos de ejemplo`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('Email: ana.garcia@techcorp.com | Password: 123456 (Admin)');
  console.log('Email: carlos.rodriguez@techcorp.com | Password: 123456 (Manager)');
  console.log('Email: maria.lopez@techcorp.com | Password: 123456 (Employee)');

}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error al crear datos de demo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
