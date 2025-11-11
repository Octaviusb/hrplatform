import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

// GET organizations - requires auth
router.get('/', requireAuth, async (req: any, res) => {
  try {
    // Superadministradores pueden ver todas las organizaciones
    if (req.user?.globalRole === 'superadmin') {
      const orgs = await prisma.organization.findMany();
      return res.json(orgs);
    }
    
    // Usuarios normales solo ven organizaciones donde tienen membresía
    const userWithMemberships = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });
    
    const orgs = userWithMemberships?.memberships.map(m => m.organization) || [];
    res.json(orgs);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Error fetching organizations' });
  }
});

// POST organization - allow without auth if no organizations exist (initial setup)
router.post('/', async (req, res) => {
  try {
    const { name, nit, size, address, phone, email, industry } = req.body ?? {};
    
    if (!name || !nit || !size) {
      return res.status(400).json({ error: 'name, nit, size are required' });
    }

    // Check if this is initial setup (no organizations exist)
    const orgCount = await prisma.organization.count();
    
    if (orgCount > 0) {
      // If organizations exist, require authentication
      return requireAuth(req as any, res, async () => {
        return requirePermission('organizations.create')(req as any, res, async () => {
          const org = await prisma.organization.create({ 
            data: { name, nit, size, address, phone, email, industry } 
          });
          res.status(201).json(org);
        });
      });
    }

    // Initial setup - no auth required
    const org = await prisma.organization.create({ 
      data: { name, nit, size, address, phone, email, industry } 
    });
    res.status(201).json(org);
  } catch (error) {
    console.error('Error creating organization:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Organization with this NIT already exists' });
    } else {
      res.status(500).json({ error: 'Error creating organization' });
    }
  }
});

export default router;
