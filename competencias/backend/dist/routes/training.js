import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();
router.get('/', requireAuth, async (req, res) => {
    try {
        const trainings = await prisma.training.findMany({
            include: {
                organization: true,
                enrollments: {
                    include: {
                        employee: true
                    }
                }
            }
        });
        res.json(trainings);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/', requireAuth, async (req, res) => {
    try {
        const training = await prisma.training.create({
            data: req.body,
            include: {
                organization: true,
                enrollments: {
                    include: {
                        employee: true
                    }
                }
            }
        });
        res.status(201).json(training);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/:id/enroll', requireAuth, async (req, res) => {
    try {
        const enrollment = await prisma.trainingEnrollment.create({
            data: {
                trainingId: req.params.id,
                ...req.body
            },
            include: {
                training: true,
                employee: true
            }
        });
        res.status(201).json(enrollment);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/enrollments', requireAuth, async (req, res) => {
    try {
        const enrollments = await prisma.trainingEnrollment.findMany({
            include: {
                training: true,
                employee: true
            }
        });
        res.json(enrollments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const training = await prisma.training.update({
            where: { id: req.params.id },
            data: req.body,
            include: {
                organization: true,
                enrollments: {
                    include: {
                        employee: true
                    }
                }
            }
        });
        res.json(training);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.training.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
