import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMultiTenant() {
  try {
    console.log('🏢 Creating multi-tenant demo data...');

    // Create Organizations
    const organizations = [
      {
        name: 'TechCorp Colombia',
        nit: '900123456-1',
        size: 'medium',
        address: 'Carrera 7 #32-16, Bogotá',
        phone: '+57 1 234-5678',
        email: 'info@techcorp.co',
        industry: 'Tecnología'
      },
      {
        name: 'Manufacturas del Norte',
        nit: '800987654-2',
        size: 'large',
        address: 'Calle 45 #12-34, Medellín',
        phone: '+57 4 567-8901',
        email: 'contacto@manufnorte.com',
        industry: 'Manufactura'
      },
      {
        name: 'Servicios Financieros SA',
        nit: '700456789-3',
        size: 'large',
        address: 'Avenida El Dorado #68-90, Bogotá',
        phone: '+57 1 345-6789',
        email: 'info@servfinsa.com',
        industry: 'Financiero'
      }
    ];

    const createdOrgs = [];
    for (const orgData of organizations) {
      const existing = await prisma.organization.findUnique({
        where: { nit: orgData.nit }
      });
      
      let org;
      if (existing) {
        org = existing;
        console.log(`⚠️ Organization already exists: ${org.name}`);
      } else {
        org = await prisma.organization.create({ data: orgData });
        console.log(`✅ Created organization: ${org.name}`);
      }
      createdOrgs.push(org);
    }

    // Create Users with different roles
    const users = [
      {
        name: 'Super Administrador',
        email: 'superadmin@hrplatform.com',
        password: 'admin123',
        globalRole: 'superadmin'
      },
      {
        name: 'Carlos Rodriguez',
        email: 'carlos@techcorp.co',
        password: 'admin123',
        globalRole: 'user',
        orgIndex: 0 // TechCorp
      },
      {
        name: 'Ana Martinez',
        email: 'ana@manufnorte.com',
        password: 'admin123',
        globalRole: 'user',
        orgIndex: 1 // Manufacturas
      },
      {
        name: 'Luis Gonzalez',
        email: 'luis@servfinsa.com',
        password: 'admin123',
        globalRole: 'user',
        orgIndex: 2 // Servicios Financieros
      },
      {
        name: 'Usuario Demo',
        email: 'test@test.com',
        password: '123456',
        globalRole: 'user',
        orgIndex: 0 // TechCorp
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const { orgIndex, password, ...userCreateData } = userData;
      
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      let user;
      if (existing) {
        user = existing;
        console.log(`⚠️ User already exists: ${user.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            ...userCreateData,
            passwordHash: hashedPassword
          }
        });
        console.log(`✅ Created user: ${user.email}`);
      }
      
      // Create membership if user belongs to an organization
      if (typeof orgIndex === 'number' && createdOrgs[orgIndex]) {
        const existingMembership = await prisma.membership.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: createdOrgs[orgIndex].id
            }
          }
        });
        
        if (!existingMembership) {
          await prisma.membership.create({
            data: {
              userId: user.id,
              organizationId: createdOrgs[orgIndex].id
            }
          });
        }
      }
      
      createdUsers.push(user);
    }

    // Create departments for each organization
    const departmentsByOrg = [
      // TechCorp
      [
        { name: 'Desarrollo', description: 'Equipo de desarrollo de software' },
        { name: 'Marketing', description: 'Marketing digital y ventas' },
        { name: 'Recursos Humanos', description: 'Gestión de talento humano' }
      ],
      // Manufacturas
      [
        { name: 'Producción', description: 'Líneas de producción y manufactura' },
        { name: 'Calidad', description: 'Control de calidad y procesos' },
        { name: 'Logística', description: 'Cadena de suministro y distribución' }
      ],
      // Servicios Financieros
      [
        { name: 'Crédito', description: 'Análisis y aprobación de créditos' },
        { name: 'Inversiones', description: 'Gestión de portafolios de inversión' },
        { name: 'Operaciones', description: 'Operaciones bancarias y financieras' }
      ]
    ];

    for (let i = 0; i < createdOrgs.length; i++) {
      const org = createdOrgs[i];
      const departments = departmentsByOrg[i];
      
      for (const deptData of departments) {
        await prisma.department.create({
          data: {
            ...deptData,
            organizationId: org.id
          }
        });
      }
      console.log(`✅ Created departments for ${org.name}`);
    }

    // Create sample employees for each organization
    const employeesByOrg = [
      // TechCorp employees
      [
        {
          employeeNumber: 'TC001',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@techcorp.co',
          identificationNumber: '12345678',
          identificationType: 'CC',
          hireDate: new Date('2023-01-15'),
          status: 'active',
          salary: 4500000,
          vacationDays: 15
        },
        {
          employeeNumber: 'TC002',
          firstName: 'María',
          lastName: 'García',
          email: 'maria.garcia@techcorp.co',
          identificationNumber: '87654321',
          identificationType: 'CC',
          hireDate: new Date('2023-03-20'),
          status: 'active',
          salary: 3800000,
          vacationDays: 15
        }
      ],
      // Manufacturas employees
      [
        {
          employeeNumber: 'MN001',
          firstName: 'Pedro',
          lastName: 'López',
          email: 'pedro.lopez@manufnorte.com',
          identificationNumber: '11223344',
          identificationType: 'CC',
          hireDate: new Date('2022-06-10'),
          status: 'active',
          salary: 3200000,
          vacationDays: 15
        }
      ],
      // Servicios Financieros employees
      [
        {
          employeeNumber: 'SF001',
          firstName: 'Carmen',
          lastName: 'Ruiz',
          email: 'carmen.ruiz@servfinsa.com',
          identificationNumber: '55667788',
          identificationType: 'CC',
          hireDate: new Date('2022-09-05'),
          status: 'active',
          salary: 5200000,
          vacationDays: 20
        }
      ]
    ];

    for (let i = 0; i < createdOrgs.length; i++) {
      const org = createdOrgs[i];
      const employees = employeesByOrg[i];
      
      for (const empData of employees) {
        await prisma.employee.create({
          data: {
            ...empData,
            organizationId: org.id
          }
        });
      }
      console.log(`✅ Created employees for ${org.name}`);
    }

    console.log('\n🎉 Multi-tenant demo data created successfully!');
    console.log('\n📋 Organizations created:');
    createdOrgs.forEach(org => {
      console.log(`   - ${org.name} (${org.nit})`);
    });
    
    console.log('\n🔑 Login credentials:');
    console.log('   - superadmin@hrplatform.com / admin123 (Super Admin)');
    console.log('   - carlos@techcorp.co / admin123 (TechCorp Admin)');
    console.log('   - ana@manufnorte.com / admin123 (Manufacturas Admin)');
    console.log('   - luis@servfinsa.com / admin123 (Servicios Financieros Admin)');
    console.log('   - test@test.com / 123456 (Demo User - TechCorp)');

  } catch (error) {
    console.error('❌ Error creating multi-tenant data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMultiTenant();