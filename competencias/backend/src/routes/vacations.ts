import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const createVacationSchema = z.object({
  employeeId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  days: z.number(),
  comments: z.string().optional(),
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const vacations = await prisma.vacation.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      },
      orderBy: { requestedDate: 'desc' }
    });
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching vacations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = createVacationSchema.parse(req.body);
    const vacation = await prisma.vacation.create({
      data: {
        ...data,
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
    res.status(201).json(vacation);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

router.patch('/:id/approve', async (req, res) => {
  try {
    const vacation = await prisma.vacation.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        approvedBy: (req as any).user.sub,
        approvedDate: new Date()
      }
    });
    res.json(vacation);
  } catch (error) {
    res.status(500).json({ error: 'Error approving vacation' });
  }
});

router.patch('/:id/reject', async (req, res) => {
  try {
    const vacation = await prisma.vacation.update({
      where: { id: req.params.id },
      data: { status: 'rejected' }
    });
    res.json(vacation);
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting vacation' });
  }
});

export default router;
