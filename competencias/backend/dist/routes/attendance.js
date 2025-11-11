import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const prisma = new PrismaClient();
const createAttendanceSchema = z.object({
    employeeId: z.string(),
    date: z.string().transform((str) => new Date(str)),
    checkIn: z.string().optional().transform((str) => str ? new Date(str) : undefined),
    checkOut: z.string().optional().transform((str) => str ? new Date(str) : undefined),
    status: z.enum(['present', 'absent', 'late', 'half_day']),
});
router.use(requireAuth);
router.get('/', async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        const where = { organizationId: 'default' };
        if (date) {
            const targetDate = new Date(date);
            where.date = {
                gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                lt: new Date(targetDate.setHours(23, 59, 59, 999))
            };
        }
        if (employeeId) {
            where.employeeId = employeeId;
        }
        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeNumber: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching attendance' });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = createAttendanceSchema.parse(req.body);
        // Calculate hours worked
        let hoursWorked = 0;
        if (data.checkIn && data.checkOut) {
            const diffMs = data.checkOut.getTime() - data.checkIn.getTime();
            hoursWorked = diffMs / (1000 * 60 * 60);
        }
        const attendance = await prisma.attendance.create({
            data: {
                ...data,
                organizationId: 'default',
                hoursWorked,
                overtimeHours: Math.max(0, hoursWorked - 8)
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeNumber: true
                    }
                }
            }
        });
        res.status(201).json(attendance);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});
router.get('/summary', async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const weeklyAttendance = await prisma.attendance.findMany({
            where: {
                organizationId: 'default',
                date: { gte: startOfWeek }
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeNumber: true
                    }
                }
            }
        });
        const summary = {
            totalPresent: weeklyAttendance.filter(a => a.status === 'present').length,
            totalAbsent: weeklyAttendance.filter(a => a.status === 'absent').length,
            totalLate: weeklyAttendance.filter(a => a.status === 'late').length,
            averageHours: weeklyAttendance.reduce((acc, a) => acc + (a.hoursWorked || 0), 0) / weeklyAttendance.length || 0
        };
        res.json({ summary, records: weeklyAttendance });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching attendance summary' });
    }
});
export default router;
