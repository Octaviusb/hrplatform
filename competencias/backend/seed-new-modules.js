import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNewModules() {
  try {
    console.log('Seeding new HR modules...');

    // Get existing employees
    const employees = await prisma.employee.findMany();
    const departments = await prisma.department.findMany();

    if (employees.length === 0) {
      console.log('No employees found. Please run the main seed script first.');
      return;
    }

    // Job Analysis
    const jobAnalyses = [
      {
        organizationId: employees[0].organizationId,
        employeeId: employees[0].id,
        departmentId: employees[0].departmentId,
        positionTitle: 'Desarrollador Senior',
        summary: 'Responsable del desarrollo y mantenimiento de aplicaciones web utilizando tecnologías modernas.',
        responsibilities: 'Desarrollar código limpio y eficiente, realizar revisiones de código, mentorear desarrolladores junior, participar en la planificación de sprints.',
        requirements: 'Título en Ingeniería de Sistemas o afín, 5+ años de experiencia en desarrollo web, conocimiento en React, Node.js, bases de datos.',
        skills: 'JavaScript, TypeScript, React, Node.js, SQL, Git, metodologías ágiles',
        competencies: 'Resolución de problemas, trabajo en equipo, comunicación efectiva, liderazgo técnico',
        workConditions: 'Trabajo híbrido, horario flexible, ambiente colaborativo'
      },
      {
        organizationId: employees[1]?.organizationId || employees[0].organizationId,
        employeeId: employees[1]?.id,
        departmentId: employees[1]?.departmentId || employees[0].departmentId,
        positionTitle: 'Analista de Marketing',
        summary: 'Encargado de desarrollar y ejecutar estrategias de marketing digital para aumentar la visibilidad de la marca.',
        responsibilities: 'Crear campañas publicitarias, analizar métricas de marketing, gestionar redes sociales, coordinar eventos promocionales.',
        requirements: 'Título en Marketing o Comunicación, 3+ años de experiencia en marketing digital, conocimiento en Google Analytics, redes sociales.',
        skills: 'Marketing digital, análisis de datos, creatividad, gestión de proyectos',
        competencies: 'Creatividad, análisis crítico, orientación a resultados, adaptabilidad',
        workConditions: 'Oficina moderna, trabajo en equipo, acceso a herramientas digitales'
      }
    ];

    for (const analysis of jobAnalyses) {
      await prisma.jobAnalysis.create({ data: analysis });
    }

    // Development Plans
    const developmentPlans = [
      {
        employeeId: employees[0].id,
        organizationId: 'org1',
        title: 'Plan de Liderazgo Técnico',
        description: 'Desarrollo de habilidades de liderazgo para liderar equipos técnicos efectivamente.',
        objectives: 'Mejorar habilidades de comunicación, aprender técnicas de mentoring, desarrollar visión estratégica tecnológica.',
        timeline: '6 meses',
        resources: 'Cursos online, mentoring con CTO, libros especializados, conferencias técnicas',
        status: 'active',
        progress: 25,
        createdBy: 'Admin'
      },
      {
        employeeId: employees[1]?.id,
        organizationId: employees[1]?.organizationId || employees[0].organizationId,
        title: 'Certificación en Marketing Digital',
        description: 'Obtener certificaciones reconocidas en marketing digital y analytics.',
        objectives: 'Certificación Google Analytics, certificación Facebook Ads, especialización en SEO/SEM.',
        timeline: '4 meses',
        resources: 'Cursos certificados, presupuesto para exámenes, tiempo de estudio',
        status: 'active',
        progress: 60,
        createdBy: 'Admin'
      }
    ];

    for (const plan of developmentPlans) {
      if (plan.employeeId) {
        await prisma.developmentPlan.create({ data: plan });
      }
    }

    // Training Programs
    const trainings = [
      {
        organizationId: 'org1',
        title: 'Seguridad en el Trabajo',
        description: 'Capacitación obligatoria sobre normas de seguridad y prevención de riesgos laborales.',
        category: 'seguridad',
        type: 'presencial',
        duration: 8,
        instructor: 'Especialista en Seguridad Industrial',
        capacity: 20,
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-15'),
        status: 'scheduled',
        cost: 150000,
        location: 'Sala de Conferencias A'
      },
      {
        organizationId: employees[0].organizationId,
        title: 'Liderazgo y Gestión de Equipos',
        description: 'Desarrollo de habilidades de liderazgo para supervisores y gerentes.',
        category: 'liderazgo',
        type: 'hibrido',
        duration: 16,
        instructor: 'Coach Empresarial',
        capacity: 15,
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-22'),
        status: 'scheduled',
        cost: 300000,
        location: 'Centro de Capacitación'
      },
      {
        organizationId: employees[0].organizationId,
        title: 'Nuevas Tecnologías en Desarrollo',
        description: 'Actualización en frameworks y herramientas modernas de desarrollo.',
        category: 'tecnica',
        type: 'virtual',
        duration: 12,
        instructor: 'Desarrollador Senior',
        capacity: 25,
        startDate: new Date('2024-12-10'),
        endDate: new Date('2024-12-12'),
        status: 'in-progress',
        cost: 200000,
        location: 'Plataforma Virtual'
      }
    ];

    const createdTrainings = [];
    for (const training of trainings) {
      const created = await prisma.training.create({ data: training });
      createdTrainings.push(created);
    }

    // Training Enrollments
    const enrollments = [
      {
        trainingId: createdTrainings[0].id,
        employeeId: employees[0].id,
        enrolledBy: 'Admin',
        status: 'enrolled'
      },
      {
        trainingId: createdTrainings[0].id,
        employeeId: employees[1]?.id,
        enrolledBy: 'Admin',
        status: 'enrolled'
      },
      {
        trainingId: createdTrainings[1].id,
        employeeId: employees[0].id,
        enrolledBy: 'Admin',
        status: 'enrolled'
      },
      {
        trainingId: createdTrainings[2].id,
        employeeId: employees[0].id,
        enrolledBy: 'Admin',
        status: 'completed',
        completedAt: new Date(),
        score: 95,
        feedback: 'Excelente participación y comprensión de los temas'
      }
    ];

    for (const enrollment of enrollments) {
      if (enrollment.employeeId) {
        await prisma.trainingEnrollment.create({ data: enrollment });
      }
    }

    // Update existing payrolls with DIAN status
    await prisma.payroll.updateMany({
      data: {
        dianStatus: 'approved',
        dianReference: 'DIAN-2024-001',
        dianResponse: 'Nómina electrónica procesada exitosamente'
      }
    });

    console.log('✅ New HR modules seeded successfully!');
    console.log('📊 Created:');
    console.log(`   - ${jobAnalyses.length} job analyses`);
    console.log(`   - ${developmentPlans.length} development plans`);
    console.log(`   - ${trainings.length} training programs`);
    console.log(`   - ${enrollments.length} training enrollments`);
    console.log('   - Updated payrolls with DIAN status');

  } catch (error) {
    console.error('Error seeding new modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNewModules();