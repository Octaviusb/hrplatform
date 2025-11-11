import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { DianSimulator, DianValidator } from '../services/dian-enhanced.js';
const router = express.Router();
const prisma = new PrismaClient();
router.post('/submit-payroll/:payrollId', requireAuth, async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({
            where: { id: req.params.payrollId },
            include: {
                employee: true,
                organization: true
            }
        });
        if (!payroll) {
            return res.status(404).json({ error: 'Nómina no encontrada' });
        }
        if (payroll.dianStatus !== 'pending') {
            return res.status(400).json({ error: 'Esta nómina ya fue procesada' });
        }
        // Submit to DIAN with enhanced validation
        const dianResult = await DianSimulator.submitPayroll(req.params.payrollId);
        // Update payroll with DIAN response
        const updatedPayroll = await prisma.payroll.update({
            where: { id: req.params.payrollId },
            data: {
                dianStatus: dianResult.status,
                dianReference: dianResult.reference,
                dianResponse: dianResult.response
            },
            include: {
                employee: true,
                organization: true
            }
        });
        res.json(updatedPayroll);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/status/:payrollId', requireAuth, async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({
            where: { id: req.params.payrollId },
            select: {
                id: true,
                dianStatus: true,
                dianReference: true,
                dianResponse: true,
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeNumber: true
                    }
                }
            }
        });
        if (!payroll) {
            return res.status(404).json({ error: 'Nómina no encontrada' });
        }
        res.json(payroll);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/reports', requireAuth, async (req, res) => {
    try {
        const reports = await prisma.payroll.groupBy({
            by: ['dianStatus'],
            _count: {
                dianStatus: true
            }
        });
        const totalPayrolls = await prisma.payroll.count();
        const approvedPayrolls = await prisma.payroll.count({
            where: { dianStatus: 'approved' }
        });
        res.json({
            summary: {
                total: totalPayrolls,
                approved: approvedPayrolls,
                approvalRate: totalPayrolls > 0 ? (approvedPayrolls / totalPayrolls * 100).toFixed(2) : 0
            },
            statusBreakdown: reports,
            requirements: DianSimulator.getDianRequirements()
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Endpoint para obtener XML generado
router.get('/xml/:payrollId', requireAuth, async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({
            where: { id: req.params.payrollId },
            include: { employee: true }
        });
        if (!payroll) {
            return res.status(404).json({ error: 'Nómina no encontrada' });
        }
        const xmlData = {
            employeeId: payroll.employeeId,
            employeeDocument: payroll.employee.identificationNumber,
            employeeName: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
            period: payroll.period,
            baseSalary: payroll.baseSalary,
            deductions: {
                health: payroll.baseSalary * 0.04,
                pension: payroll.baseSalary * 0.04,
                tax: payroll.deductions
            },
            additions: {
                overtime: 0,
                bonuses: payroll.bonuses
            },
            netSalary: payroll.netSalary
        };
        const xml = DianValidator.generateXML(xmlData);
        res.set({
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="nomina_${payroll.employee.employeeNumber}_${payroll.period}.xml"`
        });
        res.send(xml);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Endpoint para validar nómina antes del envío
router.post('/validate/:payrollId', requireAuth, async (req, res) => {
    try {
        const payroll = await prisma.payroll.findUnique({
            where: { id: req.params.payrollId },
            include: { employee: true }
        });
        if (!payroll) {
            return res.status(404).json({ error: 'Nómina no encontrada' });
        }
        const validation = DianValidator.validatePayrollData(payroll);
        res.json({
            valid: validation.valid,
            errors: validation.errors,
            payrollId: payroll.id,
            employee: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
            period: payroll.period
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
