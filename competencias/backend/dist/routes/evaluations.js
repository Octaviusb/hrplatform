import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { tenantMiddleware, withOrgFilter } from '../middleware/tenant.js';
const router = express.Router();
const prisma = new PrismaClient();
// Get all evaluations
router.get('/', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        const evaluations = await prisma.performanceEvaluation.findMany({
            where: withOrgFilter(organizationId),
            include: {
                employee: true,
                evaluator: true,
                criteria: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(evaluations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create evaluation
router.post('/', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        const { criteria, ...evaluationData } = req.body;
        const evaluation = await prisma.performanceEvaluation.create({
            data: {
                ...evaluationData,
                organizationId,
                criteria: {
                    create: criteria || []
                }
            },
            include: {
                employee: true,
                evaluator: true,
                criteria: true
            }
        });
        res.status(201).json(evaluation);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update evaluation
router.put('/:id', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        const { criteria, ...evaluationData } = req.body;
        // Update evaluation
        const evaluation = await prisma.performanceEvaluation.update({
            where: {
                id: req.params.id,
                organizationId // Ensure user can only update their org's data
            },
            data: evaluationData,
            include: {
                employee: true,
                evaluator: true,
                criteria: true
            }
        });
        // Update criteria if provided
        if (criteria) {
            await prisma.evaluationCriteria.deleteMany({
                where: { evaluationId: req.params.id }
            });
            await prisma.evaluationCriteria.createMany({
                data: criteria.map((c) => ({
                    ...c,
                    evaluationId: req.params.id
                }))
            });
        }
        res.json(evaluation);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete evaluation
router.delete('/:id', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        await prisma.performanceEvaluation.delete({
            where: {
                id: req.params.id,
                organizationId // Ensure user can only delete their org's data
            }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get evaluation templates
router.get('/templates', requireAuth, async (req, res) => {
    try {
        const templates = {
            annual: {
                name: 'Evaluación Anual',
                criteria: [
                    { category: 'Desempeño', criterion: 'Cumplimiento de objetivos', weight: 0.3 },
                    { category: 'Desempeño', criterion: 'Calidad del trabajo', weight: 0.2 },
                    { category: 'Competencias', criterion: 'Trabajo en equipo', weight: 0.15 },
                    { category: 'Competencias', criterion: 'Comunicación', weight: 0.15 },
                    { category: 'Liderazgo', criterion: 'Iniciativa', weight: 0.1 },
                    { category: 'Liderazgo', criterion: 'Resolución de problemas', weight: 0.1 }
                ]
            },
            quarterly: {
                name: 'Evaluación Trimestral',
                criteria: [
                    { category: 'Objetivos', criterion: 'Metas del trimestre', weight: 0.4 },
                    { category: 'Desempeño', criterion: 'Productividad', weight: 0.3 },
                    { category: 'Comportamiento', criterion: 'Actitud', weight: 0.3 }
                ]
            },
            probation: {
                name: 'Evaluación de Prueba',
                criteria: [
                    { category: 'Adaptación', criterion: 'Integración al equipo', weight: 0.25 },
                    { category: 'Aprendizaje', criterion: 'Curva de aprendizaje', weight: 0.25 },
                    { category: 'Desempeño', criterion: 'Cumplimiento de tareas', weight: 0.25 },
                    { category: 'Actitud', criterion: 'Compromiso', weight: 0.25 }
                ]
            }
        };
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
