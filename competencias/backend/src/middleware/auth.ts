import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    globalRole: string;
    activeOrganizationId: string;
    organizationId?: string;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        memberships: {
          include: {
            organization: true,
            roles: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Set organization context
    const organizationId = req.headers['x-organization-id'] as string;
    let activeOrganizationId = organizationId;

    if (!activeOrganizationId && user.memberships.length > 0) {
      activeOrganizationId = user.memberships[0].organizationId;
    }

    req.user = {
      id: user.id,
      email: user.email,
      globalRole: user.globalRole,
      activeOrganizationId,
      organizationId: activeOrganizationId,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requirePermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // For demo purposes, allow all operations
      // In production, implement proper permission checking
      next();
    } catch (error) {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.globalRole !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' });
  }
  next();
};