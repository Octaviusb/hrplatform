import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNewHRModules() {
  try {
    console.log('🚀 Seeding new HR modules...');

    // Get existing data
    const employees = await prisma.employee.findMany();
    const organizations = await prisma.organization.findMany();
    const positions = await prisma.position.findMany();

    if (employees.length === 0 || organizations.length === 0) {
      console.log('❌ No employees or organizations found. Run main seed first.');
      return;
    }

    const orgId = organizations[0].id;

    // 1. COMPETENCIES
    console.log('📊 Creating competencies...');
    const competencies = [
      {
        organizationId: orgId,
        name: 'Liderazgo',
        description: 'Capacidad para dirigir equipos y tomar decisiones estratégicas',
        category: 'Liderazgo',
        level: 'advanced'
      },
      {
        organizationId: orgId,
        name: 'Comunicación Efectiva',
        description: 'Habilidad para transmitir ideas de manera clara y persuasiva',
        category: 'Comunicación',
        level: 'intermediate'
      },
      {
        organizationId: orgId,
        name: 'Trabajo en Equipo',
        description: 'Colaboración efectiva con colegas para lograr objetivos comunes',
        category: 'Colaboración',
        level: 'basic'
      },
      {
        organizationId: orgId,
        name: 'Resolución de Problemas',
        description: 'Análisis y solución creativa de situaciones complejas',
        category: 'Análisis',
        level: 'advanced'
      },
      {
        organizationId: orgId,
        name: 'Orientación al Cliente',
        description: 'Enfoque en satisfacer las necesidades del cliente interno y externo',
        category: 'Servicio',
        level: 'intermediate'
      }
    ];

    const createdCompetencies = [];
    for (const comp of competencies) {
      const created = await prisma.competency.create({ data: comp });
      createdCompetencies.push(created);
    }

    // 2. POSITION COMPETENCIES
    console.log('🎯 Assigning competencies to positions...');
    if (positions.length > 0) {
      for (const position of positions) {
        // Assign random competencies to each position
        const selectedCompetencies = createdCompetencies.slice(0, 3);
        for (const comp of selectedCompetencies) {
          await prisma.positionCompetency.create({
            data: {
              positionId: position.id,
              competencyId: comp.id,
              requiredLevel: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
              importance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
            }
          });
        }
      }
    }

    // 3. EMPLOYEE COMPETENCIES
    console.log('👥 Assigning competencies to employees...');
    for (const employee of employees) {
      // Assign random competencies to each employee
      const selectedCompetencies = createdCompetencies.slice(0, 4);
      for (const comp of selectedCompetencies) {
        await prisma.employeeCompetency.create({
          data: {
            employeeId: employee.id,
            competencyId: comp.id,
            currentLevel: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
            targetLevel: ['intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 3)],
            assessedBy: 'Sistema Demo',
            evidence: 'Evaluación inicial del sistema'
          }
        });
      }
    }

    // 4. BENEFITS
    console.log('🎁 Creating benefits catalog...');
    const benefits = [
      {
        organizationId: orgId,
        name: 'Seguro de Salud Premium',
        description: 'Cobertura médica completa para empleado y familia',
        category: 'Salud',
        type: 'monetary',
        value: 150000
      },
      {
        organizationId: orgId,
        name: 'Auxilio de Transporte',
        description: 'Subsidio mensual para transporte público o combustible',
        category: 'Transporte',
        type: 'monetary',
        value: 120000
      },
      {
        organizationId: orgId,
        name: 'Auxilio de Alimentación',
        description: 'Bonos de alimentación para almuerzo diario',
        category: 'Alimentación',
        type: 'monetary',
        value: 80000
      },
      {
        organizationId: orgId,
        name: 'Capacitación Profesional',
        description: 'Presupuesto anual para cursos y certificaciones',
        category: 'Educación',
        type: 'monetary',
        value: 500000
      },
      {
        organizationId: orgId,
        name: 'Día Libre de Cumpleaños',
        description: 'Día libre remunerado en el cumpleaños del empleado',
        category: 'Tiempo',
        type: 'non-monetary',
        value: 50000
      },
      {
        organizationId: orgId,
        name: 'Trabajo Remoto',
        description: 'Flexibilidad para trabajar desde casa 2 días por semana',
        category: 'Flexibilidad',
        type: 'non-monetary',
        value: 100000
      }
    ];

    const createdBenefits = [];
    for (const benefit of benefits) {
      const created = await prisma.benefit.create({ data: benefit });
      createdBenefits.push(created);
    }

    // 5. EMPLOYEE BENEFITS
    console.log('💼 Assigning benefits to employees...');
    for (const employee of employees) {
      // Assign random benefits to each employee
      const selectedBenefits = createdBenefits.slice(0, 4);
      for (const benefit of selectedBenefits) {
        await prisma.employeeBenefit.create({
          data: {
            employeeId: employee.id,
            benefitId: benefit.id,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            value: benefit.value,
            status: 'active',
            assignedBy: 'Sistema Demo'
          }
        });
      }
    }

    // 6. PERFORMANCE EVALUATIONS
    console.log('📈 Creating performance evaluations...');
    for (const employee of employees) {
      // Create annual evaluation
      const evaluation = await prisma.performanceEvaluation.create({
        data: {
          employeeId: employee.id,
          evaluatorId: employees[0].id, // First employee as evaluator
          organizationId: orgId,
          period: '2024-Q4',
          type: 'annual',
          status: 'completed',
          overallScore: 3.5 + Math.random() * 1.5, // Random score between 3.5-5.0
          goals: 'Mejorar productividad en un 15%, liderar proyecto de innovación, desarrollar habilidades de liderazgo',
          achievements: 'Superó objetivos de ventas en 20%, implementó nueva metodología de trabajo, capacitó a 3 nuevos empleados',
          improvements: 'Fortalecer habilidades de comunicación pública, mejorar gestión del tiempo, desarrollar conocimientos técnicos avanzados',
          comments: 'Empleado destacado con gran potencial de crecimiento. Muestra iniciativa y compromiso con los objetivos organizacionales.'
        }
      });

      // Create evaluation criteria
      const criteria = [
        { category: 'Desempeño', criterion: 'Cumplimiento de objetivos', weight: 0.3, score: 4.0 + Math.random() },
        { category: 'Desempeño', criterion: 'Calidad del trabajo', weight: 0.2, score: 3.5 + Math.random() * 1.5 },
        { category: 'Competencias', criterion: 'Trabajo en equipo', weight: 0.15, score: 4.0 + Math.random() },
        { category: 'Competencias', criterion: 'Comunicación', weight: 0.15, score: 3.0 + Math.random() * 2 },
        { category: 'Liderazgo', criterion: 'Iniciativa', weight: 0.1, score: 3.5 + Math.random() * 1.5 },
        { category: 'Liderazgo', criterion: 'Resolución de problemas', weight: 0.1, score: 4.0 + Math.random() }
      ];

      for (const criterion of criteria) {
        await prisma.evaluationCriteria.create({
          data: {
            evaluationId: evaluation.id,
            ...criterion,
            comments: `Evaluación detallada del criterio ${criterion.criterion}`
          }
        });
      }
    }

    console.log('✅ New HR modules seeded successfully!');
    console.log('📊 Created:');
    console.log(`   - ${createdCompetencies.length} competencies`);
    console.log(`   - ${createdBenefits.length} benefits`);
    console.log(`   - ${employees.length} performance evaluations`);
    console.log(`   - Employee competency and benefit assignments`);

  } catch (error) {
    console.error('❌ Error seeding new HR modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNewHRModules();