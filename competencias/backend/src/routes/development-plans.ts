import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req, res) => {
  try {
    const plans = await prisma.developmentPlan.findMany({
      include: {
        employee: true,
        organization: true
      }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const plan = await prisma.developmentPlan.create({
      data: req.body,
      include: {
        employee: true,
        organization: true
      }
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const plan = await prisma.developmentPlan.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        employee: true,
        organization: true
      }
    });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.developmentPlan.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
