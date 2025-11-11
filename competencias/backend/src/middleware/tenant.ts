import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  organizationId?: string;
}

export const requireTenant = (req: TenantRequest, res: Response, next: NextFunction) => {
  const organizationId = req.headers['x-organization-id'] as string;
  
  if (!organizationId) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }
  
  req.organizationId = organizationId;
  next();
};

export const tenantMiddleware = requireTenant;

export const withOrgFilter = (organizationId: string | undefined) => {
  return organizationId ? { organizationId } : {};
};