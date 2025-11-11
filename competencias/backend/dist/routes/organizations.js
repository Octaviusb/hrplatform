import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';
const prisma = new PrismaClient();
const router = Router();
router.use(requireAuth);
router.get('/', requirePermission('organizations.read'), async (_req, res) => {
    const orgs = await prisma.organization.findMany();
    res.json(orgs);
});
router.post('/', requirePermission('organizations.create'), async (req, res) => {
    const { name, nit, size } = req.body ?? {};
    if (!name || !nit || !size)
        return res.status(400).json({ error: 'name, nit, size required' });
    const org = await prisma.organization.create({ data: { name, nit, size } });
    res.status(201).json(org);
});
export default router;
