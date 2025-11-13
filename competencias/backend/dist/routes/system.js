import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = Router();
// Check system status - no auth required
router.get('/status', async (_req, res) => {
    try {
        const orgCount = await prisma.organization.count();
        const userCount = await prisma.user.count();
        const needsSetup = orgCount === 0 && userCount === 0;
        res.json({
            needsSetup,
            hasOrganizations: orgCount > 0,
            hasUsers: userCount > 0,
            organizationCount: orgCount,
            userCount: userCount
        });
    }
    catch (error) {
        console.error('Error checking system status:', error);
        res.status(500).json({ error: 'Error checking system status' });
    }
});
export default router;
