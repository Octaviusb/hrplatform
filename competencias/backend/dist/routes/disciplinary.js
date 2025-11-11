import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';
const prisma = new PrismaClient();
const router = Router();
router.use(requireAuth);
// List cases
router.get('/cases', requirePermission('disciplinary.read'), async (req, res) => {
    try {
        const organizationId = req.user.activeOrganizationId;
        const { status, employeeId } = req.query;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (employeeId)
            where.employeeId = employeeId;
        const cases = await prisma.disciplinaryCase.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
                charges: true,
                notifications: true,
            },
        });
        res.json(cases);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to list cases' });
    }
});
// Create case
router.post('/cases', requirePermission('disciplinary.create'), async (req, res) => {
    try {
        const organizationId = req.user.activeOrganizationId;
        const { employeeId, reasonSummary, details, deadlines } = req.body;
        if (!employeeId || !reasonSummary)
            return res.status(400).json({ error: 'employeeId and reasonSummary are required' });
        const dc = await prisma.disciplinaryCase.create({
            data: {
                organizationId,
                employeeId,
                reasonSummary,
                details,
                deadlines,
                openedByUserId: req.user?.sub,
            },
        });
        res.status(201).json(dc);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create case' });
    }
});
// Get case by id
router.get('/cases/:id', requirePermission('disciplinary.read'), async (req, res) => {
    try {
        const dc = await prisma.disciplinaryCase.findUnique({
            where: { id: req.params.id },
            include: {
                employee: true,
                charges: true,
                notifications: true,
                defenses: true,
                hearings: true,
                sanctions: true,
                terminations: true,
                attachments: true,
            },
        });
        if (!dc)
            return res.status(404).json({ error: 'Case not found' });
        res.json(dc);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to get case' });
    }
});
// Add charge
router.post('/cases/:id/charges', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { title, description, legalBasis, severity } = req.body;
        if (!title || !description)
            return res.status(400).json({ error: 'title and description are required' });
        const charge = await prisma.charge.create({
            data: {
                caseId: req.params.id,
                title,
                description,
                legalBasis,
                severity: severity || 'medium',
                createdByUserId: req.user?.sub,
            },
        });
        // Optionally update status to 'notified' after notification step
        res.status(201).json(charge);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to add charge' });
    }
});
// Register notification (charge_notice, hearing_notice, sanction_notice, termination_notice)
router.post('/cases/:id/notify', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { type, channel, toEmail, deliveryProofUrl } = req.body;
        if (!type || !channel)
            return res.status(400).json({ error: 'type and channel are required' });
        const notif = await prisma.notification.create({
            data: {
                caseId: req.params.id,
                type,
                channel,
                toEmail,
                deliveryProofUrl,
                sentAt: new Date(),
                createdByUserId: req.user?.sub,
            },
        });
        res.status(201).json(notif);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
});
// Submit defense (descargos)
router.post('/cases/:id/defenses', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { content, submittedByEmployeeId } = req.body;
        if (!content)
            return res.status(400).json({ error: 'content is required' });
        const caseObj = await prisma.disciplinaryCase.findUnique({ where: { id: req.params.id } });
        if (!caseObj)
            return res.status(404).json({ error: 'Case not found' });
        const defense = await prisma.defenseSubmission.create({
            data: {
                caseId: req.params.id,
                content,
                submittedByEmployeeId: submittedByEmployeeId || caseObj.employeeId,
            },
        });
        res.status(201).json(defense);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to submit defense' });
    }
});
// Schedule hearing
router.post('/cases/:id/hearings/schedule', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { scheduledAt, place, panel } = req.body;
        if (!scheduledAt)
            return res.status(400).json({ error: 'scheduledAt is required' });
        const hearing = await prisma.hearing.create({
            data: {
                caseId: req.params.id,
                scheduledAt: new Date(scheduledAt),
                place,
                panel,
            },
        });
        res.status(201).json(hearing);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to schedule hearing' });
    }
});
// Hold hearing (record minutes)
router.post('/cases/:id/hearings/:hearingId/hold', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { minutesUrl, resultSummary } = req.body;
        const hearing = await prisma.hearing.update({
            where: { id: req.params.hearingId },
            data: {
                heldAt: new Date(),
                minutesUrl,
                resultSummary,
            },
        });
        res.json(hearing);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to hold hearing' });
    }
});
// Sanction decision
router.post('/cases/:id/sanction', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { type, days, startDate, endDate, justification } = req.body;
        if (!type || !justification)
            return res.status(400).json({ error: 'type and justification are required' });
        const sanction = await prisma.sanction.create({
            data: {
                caseId: req.params.id,
                type,
                days: days ?? null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                decisionByUserId: req.user?.sub,
                justification,
            },
        });
        res.status(201).json(sanction);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create sanction' });
    }
});
// Termination decision (justa causa)
router.post('/cases/:id/termination', requirePermission('disciplinary.update'), async (req, res) => {
    try {
        const { causeCode, causeText, effectiveDate, settlementReference } = req.body;
        if (!causeCode || !causeText || !effectiveDate)
            return res.status(400).json({ error: 'causeCode, causeText, effectiveDate are required' });
        const term = await prisma.termination.create({
            data: {
                caseId: req.params.id,
                causeCode,
                causeText,
                effectiveDate: new Date(effectiveDate),
                decisionByUserId: req.user?.sub,
                settlementReference,
            },
        });
        res.status(201).json(term);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create termination' });
    }
});
export default router;
