import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();
router.get('/', requireAuth, async (req, res) => {
    try {
        const jobAnalyses = await prisma.jobAnalysis.findMany({
            include: {
                organization: true,
                employee: true,
                department: true
            }
        });
        res.json(jobAnalyses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/', requireAuth, async (req, res) => {
    try {
        const jobAnalysis = await prisma.jobAnalysis.create({
            data: req.body,
            include: {
                organization: true,
                employee: true,
                department: true
            }
        });
        res.status(201).json(jobAnalysis);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const jobAnalysis = await prisma.jobAnalysis.update({
            where: { id: req.params.id },
            data: req.body,
            include: {
                organization: true,
                employee: true,
                department: true
            }
        });
        res.json(jobAnalysis);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.jobAnalysis.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
