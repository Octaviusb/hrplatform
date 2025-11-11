import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

// Get all employees
router.get('/', requirePermission('employees.read'), async (req, res) => {
  try {
    const { organizationId } = req.user;
    const employees = await prisma.employee.findMany({
      where: { organizationId: organizationId || req.user.activeOrganizationId },
      include: {
        department: true,
        position: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { hireDate: 'desc' },
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', requirePermission('employees.read'), async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        position: true,
        user: { select: { id: true, name: true, email: true } },
        testResults: {
          include: {
            test: true,
            traits: true,
          },
        },
        observations: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        interviews: {
          orderBy: { scheduledDate: 'desc' },
          take: 5,
        },
        developmentPlans: {
          where: { status: 'active' },
        },
      },
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create single employee
router.post('/', requirePermission('employees.create'), async (req, res) => {
  try {
    const {
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      identificationNumber,
      identificationType,
      departmentId,
      positionId,
      hireDate,
      salary,
      vacationDays,
    } = req.body;

    // Check if employee number already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        employeeNumber,
        organizationId: req.user.activeOrganizationId,
      },
    });

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee number already exists' });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeNumber,
        firstName,
        lastName,
        email,
        phone,
        identificationNumber,
        identificationType,
        departmentId,
        positionId,
        hireDate: new Date(hireDate),
        status: 'active',
        salary: salary ? parseFloat(salary) : null,
        vacationDays: vacationDays ? parseInt(vacationDays) : 20,
        organizationId: req.user.activeOrganizationId,
      },
      include: {
        department: true,
        position: true,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Bulk upload employees via CSV
router.post('/bulk-upload', requirePermission('employees.create'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    const csvData: any[] = [];

    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => csvData.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        // Validate required fields
        if (!row.employeeNumber || !row.firstName || !row.lastName || !row.email) {
          errors.push({ row: i + 1, error: 'Missing required fields' });
          continue;
        }

        // Check if employee already exists
        const existing = await prisma.employee.findFirst({
          where: {
            OR: [
              { employeeNumber: row.employeeNumber, organizationId: req.user.activeOrganizationId },
              { email: row.email, organizationId: req.user.activeOrganizationId },
            ],
          },
        });

        if (existing) {
          errors.push({ row: i + 1, error: 'Employee number or email already exists' });
          continue;
        }

        // Find department and position if provided
        let departmentId = null;
        let positionId = null;

        if (row.departmentName) {
          const department = await prisma.department.findFirst({
            where: {
              name: row.departmentName,
              organizationId: req.user.activeOrganizationId,
            },
          });
          departmentId = department?.id;
        }

        if (row.positionTitle && departmentId) {
          const position = await prisma.position.findFirst({
            where: {
              title: row.positionTitle,
              departmentId,
            },
          });
          positionId = position?.id;
        }

        const employee = await prisma.employee.create({
          data: {
            employeeNumber: row.employeeNumber,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || null,
            identificationNumber: row.identificationNumber || '',
            identificationType: row.identificationType || 'CC',
            departmentId,
            positionId,
            hireDate: row.hireDate ? new Date(row.hireDate) : new Date(),
            status: row.status || 'active',
            salary: row.salary ? parseFloat(row.salary) : null,
            vacationDays: row.vacationDays ? parseInt(row.vacationDays) : 20,
            organizationId: req.user.activeOrganizationId,
          },
        });

        results.push(employee);
      } catch (error) {
        errors.push({ row: i + 1, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    res.json({
      success: true,
      created: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// Update employee
router.put('/:id', requirePermission('employees.update'), async (req, res) => {
  try {
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        salary: req.body.salary ? parseFloat(req.body.salary) : undefined,
        vacationDays: req.body.vacationDays ? parseInt(req.body.vacationDays) : undefined,
        hireDate: req.body.hireDate ? new Date(req.body.hireDate) : undefined,
      },
      include: {
        department: true,
        position: true,
      },
    });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', requirePermission('employees.delete'), async (req, res) => {
  try {
    await prisma.employee.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Get employee statistics
router.get('/stats/overview', requirePermission('employees.read'), async (req, res) => {
  try {
    const organizationId = req.user.activeOrganizationId;
    
    const [total, active, inactive, byDepartment] = await Promise.all([
      prisma.employee.count({ where: { organizationId } }),
      prisma.employee.count({ where: { organizationId, status: 'active' } }),
      prisma.employee.count({ where: { organizationId, status: { not: 'active' } } }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    res.json({
      total,
      active,
      inactive,
      byDepartment,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
