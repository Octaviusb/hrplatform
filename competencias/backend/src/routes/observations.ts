import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const createObservationSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['formal', 'informal']),
  category: z.string(),
  content: z.string(),
  rating: z.number().min(1).max(5).optional(),
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const observations = await prisma.observation.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(observations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching observations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = createObservationSchema.parse(req.body);
    const observation = await prisma.observation.create({
      data: {
        ...data,
        observedBy: (req as any).user.sub,
        organizationId: 'default', // TODO: Get from user context
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
    res.status(201).json(observation);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

router.get('/employee/:employeeId', async (req, res) => {
  try {
    const observations = await prisma.observation.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { date: 'desc' }
    });
    res.json(observations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employee observations' });
  }
});

export default router;
