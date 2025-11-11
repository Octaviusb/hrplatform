import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSimple() {
  try {
    console.log('Seeding simple demo data for new modules...');

    // Get first employee and organization
    const employee = await prisma.employee.findFirst();
    if (!employee) {
      console.log('No employees found. Run main seed first.');
      return;
    }

    // Job Analysis
    await prisma.jobAnalysis.create({
      data: {
        organizationId: employee.organizationId,
        positionTitle: 'Desarrollador Full Stack',
        summary: 'Desarrollo de aplicaciones web modernas',
        responsibilities: 'Programar, revisar código, colaborar en equipo',
        requirements: 'Experiencia en JavaScript, React, Node.js',
        skills: 'JavaScript, React, Node.js, SQL',
        competencies: 'Resolución de problemas, trabajo en equipo'
      }
    });

    // Development Plan
    await prisma.developmentPlan.create({
      data: {
        employeeId: employee.id,
        organizationId: employee.organizationId,
        title: 'Plan de Crecimiento Técnico',
        description: 'Desarrollo de habilidades avanzadas',
        objectives: 'Mejorar conocimientos en arquitectura de software',
        timeline: '6 meses',
        createdBy: 'Admin'
      }
    });

    // Training
    const training = await prisma.training.create({
      data: {
        organizationId: employee.organizationId,
        title: 'Capacitación en Seguridad',
        description: 'Normas de seguridad laboral',
        category: 'seguridad',
        type: 'presencial',
        duration: 4,
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-15')
      }
    });

    // Training Enrollment
    await prisma.trainingEnrollment.create({
      data: {
        trainingId: training.id,
        employeeId: employee.id,
        enrolledBy: 'Admin'
      }
    });

    console.log('✅ Simple seed completed successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSimple();