import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const createInterviewSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['performance', 'feedback', 'development', 'disciplinary']),
  scheduledDate: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      },
      orderBy: { scheduledDate: 'desc' }
    });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching interviews' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = createInterviewSchema.parse(req.body);
    const interview = await prisma.interview.create({
      data: {
        ...data,
        interviewedBy: (req as any).user.sub,
        organizationId: 'default',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      }
    });
    res.status(201).json(interview);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const { outcome } = req.body;
    const interview = await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        status: 'completed',
        completedDate: new Date(),
        outcome
      }
    });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Error completing interview' });
  }
});

export default router;
