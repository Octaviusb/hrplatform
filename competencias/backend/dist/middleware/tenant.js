export const requireTenant = (req, res, next) => {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID is required' });
    }
    req.organizationId = organizationId;
    next();
};
export const tenantMiddleware = requireTenant;
export const withOrgFilter = (organizationId) => {
    return organizationId ? { organizationId } : {};
};
