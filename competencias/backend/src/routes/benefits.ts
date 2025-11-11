import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { tenantMiddleware, withOrgFilter, TenantRequest } from '../middleware/tenant.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all benefits
router.get('/', requireAuth, tenantMiddleware, async (req, res) => {
  try {
    const { organizationId } = req as TenantRequest;
    const benefits = await prisma.benefit.findMany({
      where: withOrgFilter(organizationId),
      include: {
        employeeBenefits: {
          include: { employee: true }
        }
      }
    });
    res.json(benefits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create benefit
router.post('/', requireAuth, tenantMiddleware, async (req, res) => {
  try {
    const { organizationId } = req as TenantRequest;
    const benefit = await prisma.benefit.create({
      data: {
        ...req.body,
        organizationId
      }
    });
    res.status(201).json(benefit);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get employee benefits
router.get('/employee/:employeeId', requireAuth, async (req, res) => {
  try {
    const benefits = await prisma.employeeBenefit.findMany({
      where: { employeeId: req.params.employeeId },
      include: {
        benefit: true,
        employee: true
      }
    });
    res.json(benefits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Assign benefit to employee
router.post('/assign', requireAuth, async (req, res) => {
  try {
    const assignment = await prisma.employeeBenefit.create({
      data: req.body,
      include: {
        benefit: true,
        employee: true
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get benefits summary by category
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const summary = await prisma.benefit.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { value: true }
    });

    const totalEmployees = await prisma.employee.count();
    const activeAssignments = await prisma.employeeBenefit.count({
      where: { status: 'active' }
    });

    res.json({
      byCategory: summary,
      totalBenefits: await prisma.benefit.count(),
      totalEmployees,
      activeAssignments,
      utilizationRate: totalEmployees > 0 ? (activeAssignments / totalEmployees * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Calculate total compensation for employee
router.get('/compensation/:employeeId', requireAuth, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.employeeId },
      include: {
        benefits: {
          where: { status: 'active' },
          include: { benefit: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const baseSalary = employee.salary || 0;
    const monetaryBenefits = employee.benefits
      .filter(b => b.benefit.type === 'monetary')
      .reduce((sum, b) => sum + (b.value || b.benefit.value || 0), 0);

    const nonMonetaryBenefits = employee.benefits
      .filter(b => b.benefit.type === 'non-monetary')
      .reduce((sum, b) => sum + (b.value || b.benefit.value || 0), 0);

    res.json({
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber
      },
      compensation: {
        baseSalary,
        monetaryBenefits,
        nonMonetaryBenefits,
        totalCompensation: baseSalary + monetaryBenefits + nonMonetaryBenefits
      },
      benefits: employee.benefits.map(b => ({
        name: b.benefit.name,
        category: b.benefit.category,
        type: b.benefit.type,
        value: b.value || b.benefit.value || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
