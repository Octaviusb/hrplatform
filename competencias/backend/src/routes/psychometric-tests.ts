import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const createTestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  duration: z.number().min(1),
  instructions: z.string().min(1),
});

const createQuestionSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(['multiple_choice', 'scale', 'text', 'yes_no']),
  options: z.string().optional(),
  correctAnswer: z.string().optional(),
  weight: z.number().default(1.0),
  order: z.number(),
});

const assignTestSchema = z.object({
  testId: z.string(),
  employeeId: z.string(),
  dueDate: z.string().optional(),
});

router.use(requireAuth);

// Obtener todas las pruebas
router.get('/', async (req, res) => {
  try {
    const tests = await prisma.psychometricTest.findMany({
      include: {
        questions: true,
        _count: {
          select: { assignments: true, results: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tests' });
  }
});

// Crear nueva prueba
router.post('/', async (req, res) => {
  try {
    const data = createTestSchema.parse(req.body);
    const test = await prisma.psychometricTest.create({
      data,
      include: { questions: true }
    });
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Obtener prueba específica
router.get('/:id', async (req, res) => {
  try {
    const test = await prisma.psychometricTest.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        assignments: {
          include: {
            employee: true,
            result: true
          }
        }
      }
    });
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching test' });
  }
});

// Agregar pregunta a prueba
router.post('/:id/questions', async (req, res) => {
  try {
    const data = createQuestionSchema.parse(req.body);
    const question = await prisma.testQuestion.create({
      data: {
        ...data,
        testId: req.params.id
      }
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Asignar prueba a empleado
router.post('/:id/assign', async (req, res) => {
  try {
    const data = assignTestSchema.parse(req.body);
    const assignment = await prisma.testAssignment.create({
      data: {
        testId: req.params.id,
        employeeId: data.employeeId,
        assignedBy: (req as any).user.sub,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      },
      include: {
        test: true,
        employee: true
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Obtener asignaciones de pruebas
router.get('/assignments/my', async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const assignments = await prisma.testAssignment.findMany({
      where: { employeeId: employee.id },
      include: {
        test: true,
        result: true
      },
      orderBy: { assignedAt: 'desc' }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching assignments' });
  }
});

// Iniciar prueba
router.post('/assignments/:id/start', async (req, res) => {
  try {
    const assignment = await prisma.testAssignment.update({
      where: { id: req.params.id },
      data: {
        status: 'in_progress',
        startedAt: new Date()
      },
      include: {
        test: {
          include: {
            questions: { orderBy: { order: 'asc' } }
          }
        }
      }
    });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Error starting test' });
  }
});

// Enviar respuestas y completar prueba
router.post('/assignments/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Crear resultado
    const result = await prisma.testResult.create({
      data: {
        assignmentId: req.params.id,
        testId: answers[0]?.testId,
        employeeId: answers[0]?.employeeId,
        score: 0, // Calcular después
        completedAt: new Date()
      }
    });

    // Guardar respuestas
    for (const answer of answers) {
      await prisma.testAnswer.create({
        data: {
          resultId: result.id,
          questionId: answer.questionId,
          answer: answer.answer,
          timeSpent: answer.timeSpent
        }
      });
    }

    // Actualizar asignación
    await prisma.testAssignment.update({
      where: { id: req.params.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    res.json({ message: 'Test completed successfully', resultId: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting test' });
  }
});

// Obtener resultados
router.get('/results/:id', async (req, res) => {
  try {
    const result = await prisma.testResult.findUnique({
      where: { id: req.params.id },
      include: {
        test: true,
        employee: true,
        answers: {
          include: { question: true }
        },
        traits: true
      }
    });
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching result' });
  }
});

export default router;