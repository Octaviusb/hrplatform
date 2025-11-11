import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginSchema, RegisterSchema } from '../schemas/auth.js';
import { requireAuth } from '../middleware/auth.js';
const prisma = new PrismaClient();
const router = Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post('/register', async (req, res) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { name, email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
        return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, passwordHash, globalRole: 'user' },
    });
    const token = jwt.sign({
        sub: user.id,
        globalRole: user.globalRole,
        memberships: [],
        activeOrganizationId: null,
    }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            globalRole: user.globalRole
        }
    });
});
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and retrieve JWT
 */
router.post('/login', async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email }, include: { memberships: { include: { roles: true, organization: { select: { id: true, name: true } } } } } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const memberships = user.memberships.map(m => ({
        organizationId: m.organizationId,
        roles: m.roles.map((r) => r.role?.roleKey || ''),
        organization: m.organization ? { id: m.organization.id, name: m.organization.name } : undefined,
    }));
    const token = jwt.sign({
        sub: user.id,
        globalRole: user.globalRole,
        memberships,
        activeOrganizationId: memberships[0]?.organizationId ?? null,
    }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            globalRole: user.globalRole
        }
    });
});
// Return current user info based on JWT
router.get('/me', requireAuth, async (req, res) => {
    try {
        const claims = req.user;
        if (!claims?.sub)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma.user.findUnique({
            where: { id: claims.sub },
            include: { memberships: { include: { roles: true, organization: { select: { id: true, name: true } } } } },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const memberships = user.memberships.map(m => ({
            organizationId: m.organizationId,
            roles: m.roles.map((r) => r.role?.roleKey || ''),
            organization: m.organization ? { id: m.organization.id, name: m.organization.name } : undefined,
        }));
        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                globalRole: user.globalRole,
                memberships,
                activeOrganizationId: claims.activeOrganizationId ?? memberships[0]?.organizationId ?? null,
            },
        });
    }
    catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
