import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { tenantMiddleware, withOrgFilter } from '../middleware/tenant.js';
const router = express.Router();
const prisma = new PrismaClient();
// Get all competencies
router.get('/', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        const competencies = await prisma.competency.findMany({
            where: withOrgFilter(organizationId),
            include: {
                employeeCompetencies: {
                    include: { employee: true }
                },
                positionCompetencies: {
                    include: { position: true }
                }
            }
        });
        res.json(competencies);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create competency
router.post('/', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        const competency = await prisma.competency.create({
            data: {
                ...req.body,
                organizationId
            }
        });
        res.status(201).json(competency);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get employee competencies
router.get('/employee/:employeeId', requireAuth, tenantMiddleware, async (req, res) => {
    try {
        const { organizationId } = req;
        const competencies = await prisma.employeeCompetency.findMany({
            where: {
                employeeId: req.params.employeeId,
                employee: { organizationId }
            },
            include: {
                competency: true,
                employee: true
            }
        });
        res.json(competencies);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Assign competency to employee
router.post('/assign', requireAuth, async (req, res) => {
    try {
        const assignment = await prisma.employeeCompetency.create({
            data: req.body,
            include: {
                competency: true,
                employee: true
            }
        });
        res.status(201).json(assignment);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get competency gaps analysis
router.get('/gaps/:employeeId', requireAuth, async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: req.params.employeeId },
            include: {
                position: {
                    include: {
                        competencies: {
                            include: { competency: true }
                        }
                    }
                },
                competencies: {
                    include: { competency: true }
                }
            }
        });
        if (!employee || !employee.position) {
            return res.status(404).json({ error: 'Employee or position not found' });
        }
        const requiredCompetencies = employee.position.competencies;
        const currentCompetencies = employee.competencies;
        const gaps = requiredCompetencies.map(required => {
            const current = currentCompetencies.find(c => c.competencyId === required.competencyId);
            const levelMap = { basic: 1, intermediate: 2, advanced: 3, expert: 4 };
            const requiredLevel = levelMap[required.requiredLevel] || 0;
            const currentLevel = current ? levelMap[current.currentLevel] || 0 : 0;
            return {
                competency: required.competency,
                requiredLevel: required.requiredLevel,
                currentLevel: current?.currentLevel || 'none',
                gap: requiredLevel - currentLevel,
                importance: required.importance,
                hasGap: requiredLevel > currentLevel
            };
        });
        res.json({
            employee: {
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`,
                position: employee.position.title
            },
            gaps: gaps.filter(g => g.hasGap),
            allCompetencies: gaps
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
