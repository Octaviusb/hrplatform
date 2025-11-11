import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { getPayrollSender } from '../services/dian.js';
const prisma = new PrismaClient();
const router = Router();
router.use(requireAuth);
// Get all payrolls
router.get('/', requirePermission('payroll.read'), async (req, res) => {
    try {
        const { period, status } = req.query;
        const organizationId = req.user.activeOrganizationId;
        const where = { organizationId };
        if (period)
            where.period = period;
        if (status)
            where.status = status;
        const payrolls = await prisma.payroll.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        identificationNumber: true,
                        department: { select: { name: true } },
                        position: { select: { title: true } },
                    },
                },
            },
            orderBy: { periodStart: 'desc' },
        });
        res.json(payrolls);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch payrolls' });
    }
});
// Generate payroll for period
router.post('/generate', requirePermission('payroll.create'), async (req, res) => {
    try {
        const { period, periodStart, periodEnd, employeeIds } = req.body;
        const organizationId = req.user.activeOrganizationId;
        if (!period || !periodStart || !periodEnd) {
            return res.status(400).json({ error: 'Period, start date, and end date are required' });
        }
        // Get employees to generate payroll for
        const whereClause = {
            organizationId,
            status: 'active',
            ...(employeeIds && employeeIds.length > 0 ? { id: { in: employeeIds } } : {}),
        };
        const employees = await prisma.employee.findMany({
            where: whereClause,
            include: {
                attendances: {
                    where: {
                        date: {
                            gte: new Date(periodStart),
                            lte: new Date(periodEnd),
                        },
                    },
                },
            },
        });
        const payrolls = [];
        const errors = [];
        for (const employee of employees) {
            try {
                // Check if payroll already exists for this period
                const existingPayroll = await prisma.payroll.findFirst({
                    where: {
                        employeeId: employee.id,
                        period,
                    },
                });
                if (existingPayroll) {
                    errors.push({
                        employeeId: employee.id,
                        error: 'Payroll already exists for this period',
                    });
                    continue;
                }
                // Calculate worked hours
                const totalHours = employee.attendances.reduce((sum, att) => sum + (att.hoursWorked || 0), 0);
                const overtimeHours = employee.attendances.reduce((sum, att) => sum + (att.overtimeHours || 0), 0);
                // Calculate salary components
                const baseSalary = employee.salary || 0;
                const overtimePay = overtimeHours * (baseSalary / 240) * 1.25; // Assuming 240 work hours per month
                const bonuses = 0; // Can be customized based on business rules
                // Calculate deductions (basic example)
                const healthDeduction = baseSalary * 0.04; // 4% health
                const pensionDeduction = baseSalary * 0.04; // 4% pension
                const totalDeductions = healthDeduction + pensionDeduction;
                const netSalary = baseSalary + overtimePay + bonuses - totalDeductions;
                const payroll = await prisma.payroll.create({
                    data: {
                        employeeId: employee.id,
                        organizationId,
                        period,
                        periodStart: new Date(periodStart),
                        periodEnd: new Date(periodEnd),
                        baseSalary,
                        bonuses: overtimePay + bonuses,
                        deductions: totalDeductions,
                        netSalary,
                        status: 'draft',
                        dianStatus: 'pending',
                    },
                    include: {
                        employee: {
                            select: {
                                employeeNumber: true,
                                firstName: true,
                                lastName: true,
                                identificationNumber: true,
                            },
                        },
                    },
                });
                payrolls.push(payroll);
            }
            catch (error) {
                errors.push({
                    employeeId: employee.id,
                    error: error?.message || 'Unknown error',
                });
            }
        }
        res.json({
            success: true,
            generated: payrolls.length,
            errorCount: errors.length,
            payrolls,
            errors,
        });
    }
    catch (error) {
        console.error('Payroll generation error:', error);
        res.status(500).json({ error: 'Failed to generate payroll' });
    }
});
// Update payroll
router.put('/:id', requirePermission('payroll.update'), async (req, res) => {
    try {
        const { baseSalary, bonuses, deductions } = req.body;
        const netSalary = (baseSalary || 0) + (bonuses || 0) - (deductions || 0);
        const payroll = await prisma.payroll.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                netSalary,
            },
            include: {
                employee: {
                    select: {
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        identificationNumber: true,
                    },
                },
            },
        });
        res.json(payroll);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update payroll' });
    }
});
// Approve payroll
router.post('/:id/approve', requirePermission('payroll.approve'), async (req, res) => {
    try {
        const payroll = await prisma.payroll.update({
            where: { id: req.params.id },
            data: {
                status: 'approved',
                paymentDate: new Date(),
            },
            include: {
                employee: true,
            },
        });
        res.json(payroll);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to approve payroll' });
    }
});
// Send to DIAN
router.post('/:id/send-dian', requirePermission('payroll.send_dian'), async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({
            where: { id: req.params.id },
            include: {
                employee: true,
                organization: true,
            },
        });
        if (!payroll) {
            return res.status(404).json({ error: 'Payroll not found' });
        }
        if (payroll.status !== 'approved') {
            return res.status(400).json({ error: 'Payroll must be approved before sending to DIAN' });
        }
        // Build DIAN payload
        const dianPayload = {
            employer: {
                nit: payroll.organization.nit,
                name: payroll.organization.name,
            },
            employee: {
                identification: payroll.employee.identificationNumber,
                name: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
                email: payroll.employee.email,
            },
            payroll: {
                period: payroll.period,
                periodStart: payroll.periodStart,
                periodEnd: payroll.periodEnd,
                baseSalary: payroll.baseSalary,
                bonuses: payroll.bonuses,
                deductions: payroll.deductions,
                netSalary: payroll.netSalary,
            },
        };
        // Validate before sending
        const validation = validatePayrollForDian(dianPayload);
        if (!validation.valid) {
            return res.status(400).json({ error: 'Validation failed', details: validation.errors });
        }
        // Send using configured provider (mock or PT)
        const sender = getPayrollSender();
        const dianResponse = await sender.send(dianPayload);
        const updatedPayroll = await prisma.payroll.update({
            where: { id: req.params.id },
            data: {
                dianStatus: dianResponse.success ? 'sent' : 'error',
                dianReference: dianResponse.reference,
                dianResponse: JSON.stringify(dianResponse),
            },
        });
        res.json({
            success: dianResponse.success,
            payroll: updatedPayroll,
            dianResponse,
        });
    }
    catch (error) {
        console.error('DIAN submission error:', error);
        res.status(500).json({ error: 'Failed to send to DIAN' });
    }
});
// Bulk send to DIAN
router.post('/bulk-send-dian', requirePermission('payroll.send_dian'), async (req, res) => {
    try {
        const { payrollIds } = req.body;
        if (!payrollIds || !Array.isArray(payrollIds)) {
            return res.status(400).json({ error: 'Payroll IDs array is required' });
        }
        const results = [];
        const errors = [];
        for (const payrollId of payrollIds) {
            try {
                const payroll = await prisma.payroll.findUnique({
                    where: { id: payrollId },
                    include: {
                        employee: true,
                        organization: true,
                    },
                });
                if (!payroll) {
                    errors.push({ payrollId, error: 'Payroll not found' });
                    continue;
                }
                if (payroll.status !== 'approved') {
                    errors.push({ payrollId, error: 'Payroll not approved' });
                    continue;
                }
                const dianPayload = {
                    employer: {
                        nit: payroll.organization.nit,
                        name: payroll.organization.name,
                    },
                    employee: {
                        identification: payroll.employee.identificationNumber,
                        name: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
                        email: payroll.employee.email,
                    },
                    payroll: {
                        period: payroll.period,
                        periodStart: payroll.periodStart,
                        periodEnd: payroll.periodEnd,
                        baseSalary: payroll.baseSalary,
                        bonuses: payroll.bonuses,
                        deductions: payroll.deductions,
                        netSalary: payroll.netSalary,
                    },
                };
                const validation = validatePayrollForDian(dianPayload);
                if (!validation.valid) {
                    errors.push({ payrollId, error: 'Validation failed', details: validation.errors });
                    continue;
                }
                const sender = getPayrollSender();
                const dianResponse = await sender.send(dianPayload);
                await prisma.payroll.update({
                    where: { id: payrollId },
                    data: {
                        dianStatus: dianResponse.success ? 'sent' : 'error',
                        dianReference: dianResponse.reference,
                        dianResponse: JSON.stringify(dianResponse),
                    },
                });
                results.push({ payrollId, success: dianResponse.success, reference: dianResponse.reference });
            }
            catch (error) {
                errors.push({ payrollId, error: error?.message || 'Unknown error' });
            }
        }
        res.json({
            success: true,
            processed: results.length,
            errorCount: errors.length,
            results,
            errors,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process bulk DIAN submission' });
    }
});
// Get payroll statistics
router.get('/stats/overview', requirePermission('payroll.read'), async (req, res) => {
    try {
        const organizationId = req.user.activeOrganizationId;
        const [total, pending, approved, sent, totalAmount] = await Promise.all([
            prisma.payroll.count({ where: { organizationId } }),
            prisma.payroll.count({ where: { organizationId, status: 'draft' } }),
            prisma.payroll.count({ where: { organizationId, status: 'approved' } }),
            prisma.payroll.count({ where: { organizationId, dianStatus: 'sent' } }),
            prisma.payroll.aggregate({
                where: { organizationId, status: 'approved' },
                _sum: { netSalary: true },
            }),
        ]);
        res.json({
            total,
            pending,
            approved,
            sent,
            totalAmount: totalAmount._sum.netSalary || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
// Generate payroll report
router.get('/report/:period', requirePermission('payroll.read'), async (req, res) => {
    try {
        const { period } = req.params;
        const organizationId = req.user.activeOrganizationId;
        const payrolls = await prisma.payroll.findMany({
            where: { organizationId, period },
            include: {
                employee: {
                    select: {
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        identificationNumber: true,
                        department: { select: { name: true } },
                        position: { select: { title: true } },
                    },
                },
            },
            orderBy: { employee: { employeeNumber: 'asc' } },
        });
        const summary = {
            totalEmployees: payrolls.length,
            totalBaseSalary: payrolls.reduce((sum, p) => sum + p.baseSalary, 0),
            totalBonuses: payrolls.reduce((sum, p) => sum + p.bonuses, 0),
            totalDeductions: payrolls.reduce((sum, p) => sum + p.deductions, 0),
            totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
        };
        res.json({
            period,
            summary,
            payrolls,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
});
// Basic validation for DIAN payload before sending
function validatePayrollForDian(payload) {
    const errors = [];
    if (!payload?.employer?.nit)
        errors.push('Employer NIT is required');
    if (!payload?.employer?.name)
        errors.push('Employer name is required');
    if (!payload?.employee?.identification)
        errors.push('Employee identification is required');
    if (!payload?.employee?.name)
        errors.push('Employee name is required');
    if (!payload?.payroll?.period)
        errors.push('Payroll period is required');
    if (!payload?.payroll?.periodStart)
        errors.push('Payroll periodStart is required');
    if (!payload?.payroll?.periodEnd)
        errors.push('Payroll periodEnd is required');
    const base = Number(payload?.payroll?.baseSalary || 0);
    const bon = Number(payload?.payroll?.bonuses || 0);
    const ded = Number(payload?.payroll?.deductions || 0);
    const net = Number(payload?.payroll?.netSalary || 0);
    if (net !== base + bon - ded)
        errors.push('Net salary must equal base + bonuses - deductions');
    return { valid: errors.length === 0, errors };
}
// Preview DIAN payload and validations (no send)
router.get('/:id/preview-dian', requirePermission('payroll.read'), async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({
            where: { id: req.params.id },
            include: { employee: true, organization: true },
        });
        if (!payroll)
            return res.status(404).json({ error: 'Payroll not found' });
        const payload = {
            employer: {
                nit: payroll.organization.nit,
                name: payroll.organization.name,
            },
            employee: {
                identification: payroll.employee.identificationNumber,
                name: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
                email: payroll.employee.email,
            },
            payroll: {
                period: payroll.period,
                periodStart: payroll.periodStart,
                periodEnd: payroll.periodEnd,
                baseSalary: payroll.baseSalary,
                bonuses: payroll.bonuses,
                deductions: payroll.deductions,
                netSalary: payroll.netSalary,
            },
        };
        const validation = validatePayrollForDian(payload);
        return res.json({ payload, validation });
    }
    catch (e) {
        return res.status(500).json({ error: 'Failed to preview DIAN payload' });
    }
});
export default router;
