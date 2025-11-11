import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';
const prisma = new PrismaClient();
const router = Router();
router.use(requireAuth);
// Get all departments
router.get('/', requirePermission('departments.read'), async (req, res) => {
    try {
        const organizationId = req.user.activeOrganizationId;
        const departments = await prisma.department.findMany({
            where: { organizationId },
            include: {
                positions: {
                    include: {
                        _count: {
                            select: { employees: true },
                        },
                    },
                },
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});
// Get department by ID
router.get('/:id', requirePermission('departments.read'), async (req, res) => {
    try {
        const department = await prisma.department.findUnique({
            where: { id: req.params.id },
            include: {
                positions: {
                    include: {
                        employees: {
                            select: {
                                id: true,
                                employeeNumber: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                status: true,
                            },
                        },
                    },
                },
                employees: {
                    select: {
                        id: true,
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        status: true,
                        position: { select: { title: true } },
                    },
                },
            },
        });
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(department);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch department' });
    }
});
// Create department
router.post('/', requirePermission('departments.create'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const organizationId = req.user.activeOrganizationId;
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }
        // Check if department already exists
        const existingDepartment = await prisma.department.findFirst({
            where: {
                name,
                organizationId,
            },
        });
        if (existingDepartment) {
            return res.status(400).json({ error: 'Department already exists' });
        }
        const department = await prisma.department.create({
            data: {
                name,
                description,
                organizationId,
            },
            include: {
                _count: {
                    select: { employees: true, positions: true },
                },
            },
        });
        res.status(201).json(department);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
});
// Update department
router.put('/:id', requirePermission('departments.update'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const department = await prisma.department.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
            },
            include: {
                _count: {
                    select: { employees: true, positions: true },
                },
            },
        });
        res.json(department);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update department' });
    }
});
// Delete department
router.delete('/:id', requirePermission('departments.delete'), async (req, res) => {
    try {
        // Check if department has employees
        const employeeCount = await prisma.employee.count({
            where: { departmentId: req.params.id },
        });
        if (employeeCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete department with employees. Please reassign employees first.'
            });
        }
        // Check if department has positions
        const positionCount = await prisma.position.count({
            where: { departmentId: req.params.id },
        });
        if (positionCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete department with positions. Please delete positions first.'
            });
        }
        await prisma.department.delete({
            where: { id: req.params.id },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});
// Get positions for a department
router.get('/:id/positions', requirePermission('positions.read'), async (req, res) => {
    try {
        const positions = await prisma.position.findMany({
            where: { departmentId: req.params.id },
            include: {
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: { title: 'asc' },
        });
        res.json(positions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});
// Create position in department
router.post('/:id/positions', requirePermission('positions.create'), async (req, res) => {
    try {
        const { title, description, level } = req.body;
        const departmentId = req.params.id;
        const organizationId = req.user.activeOrganizationId;
        if (!title) {
            return res.status(400).json({ error: 'Position title is required' });
        }
        // Verify department exists and belongs to organization
        const department = await prisma.department.findFirst({
            where: {
                id: departmentId,
                organizationId,
            },
        });
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        // Check if position already exists in department
        const existingPosition = await prisma.position.findFirst({
            where: {
                title,
                departmentId,
            },
        });
        if (existingPosition) {
            return res.status(400).json({ error: 'Position already exists in this department' });
        }
        const position = await prisma.position.create({
            data: {
                title,
                description,
                level,
                departmentId,
                organizationId,
            },
            include: {
                department: { select: { name: true } },
                _count: {
                    select: { employees: true },
                },
            },
        });
        res.status(201).json(position);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create position' });
    }
});
// Get all positions (across all departments)
router.get('/positions/all', requirePermission('positions.read'), async (req, res) => {
    try {
        const organizationId = req.user.activeOrganizationId;
        const positions = await prisma.position.findMany({
            where: { organizationId },
            include: {
                department: { select: { name: true } },
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: [
                { department: { name: 'asc' } },
                { title: 'asc' },
            ],
        });
        res.json(positions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});
// Update position
router.put('/positions/:positionId', requirePermission('positions.update'), async (req, res) => {
    try {
        const { title, description, level, departmentId } = req.body;
        const position = await prisma.position.update({
            where: { id: req.params.positionId },
            data: {
                title,
                description,
                level,
                departmentId,
            },
            include: {
                department: { select: { name: true } },
                _count: {
                    select: { employees: true },
                },
            },
        });
        res.json(position);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update position' });
    }
});
// Delete position
router.delete('/positions/:positionId', requirePermission('positions.delete'), async (req, res) => {
    try {
        // Check if position has employees
        const employeeCount = await prisma.employee.count({
            where: { positionId: req.params.positionId },
        });
        if (employeeCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete position with employees. Please reassign employees first.'
            });
        }
        await prisma.position.delete({
            where: { id: req.params.positionId },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete position' });
    }
});
// Get department statistics
router.get('/stats/overview', requirePermission('departments.read'), async (req, res) => {
    try {
        const organizationId = req.user.activeOrganizationId;
        const [totalDepartments, totalPositions, departmentStats] = await Promise.all([
            prisma.department.count({ where: { organizationId } }),
            prisma.position.count({ where: { organizationId } }),
            prisma.department.findMany({
                where: { organizationId },
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: {
                            employees: true,
                            positions: true,
                        },
                    },
                },
            }),
        ]);
        res.json({
            totalDepartments,
            totalPositions,
            departmentStats,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
export default router;
