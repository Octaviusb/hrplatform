import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const router = Router();
router.use(requireAuth);
// Dashboard overview (for superadmin and org admin)
router.get('/dashboard', async (req, res) => {
    try {
        const { globalRole, activeOrganizationId } = req.user;
        if (globalRole === 'superadmin') {
            // Superadmin dashboard - all organizations
            const [totalOrganizations, totalUsers, totalEmployees, recentOrganizations, organizationStats] = await Promise.all([
                prisma.organization.count(),
                prisma.user.count(),
                prisma.employee.count(),
                prisma.organization.findMany({
                    take: 5,
                    orderBy: { id: 'desc' },
                    include: {
                        _count: {
                            select: { employees: true, memberships: true }
                        }
                    }
                }),
                prisma.organization.findMany({
                    select: {
                        id: true,
                        name: true,
                        size: true,
                        _count: {
                            select: {
                                employees: true,
                                memberships: true,
                                departments: true
                            }
                        }
                    }
                })
            ]);
            res.json({
                type: 'superadmin',
                stats: {
                    totalOrganizations,
                    totalUsers,
                    totalEmployees,
                },
                recentOrganizations,
                organizationStats
            });
        }
        else {
            // Organization admin dashboard
            const [totalEmployees, totalDepartments, totalPositions, activeEmployees, recentEmployees, departmentStats, payrollStats] = await Promise.all([
                prisma.employee.count({ where: { organizationId: activeOrganizationId } }),
                prisma.department.count({ where: { organizationId: activeOrganizationId } }),
                prisma.position.count({ where: { organizationId: activeOrganizationId } }),
                prisma.employee.count({
                    where: {
                        organizationId: activeOrganizationId,
                        status: 'active'
                    }
                }),
                prisma.employee.findMany({
                    where: { organizationId: activeOrganizationId },
                    take: 5,
                    orderBy: { hireDate: 'desc' },
                    select: {
                        id: true,
                        employeeNumber: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        status: true,
                        hireDate: true,
                        department: { select: { name: true } },
                        position: { select: { title: true } }
                    }
                }),
                prisma.department.findMany({
                    where: { organizationId: activeOrganizationId },
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: { employees: true, positions: true }
                        }
                    }
                }),
                prisma.payroll.aggregate({
                    where: {
                        organizationId: activeOrganizationId,
                        status: 'approved'
                    },
                    _sum: { netSalary: true },
                    _count: true
                })
            ]);
            res.json({
                type: 'org_admin',
                stats: {
                    totalEmployees,
                    totalDepartments,
                    totalPositions,
                    activeEmployees,
                    totalPayroll: payrollStats._sum.netSalary || 0,
                    payrollCount: payrollStats._count
                },
                recentEmployees,
                departmentStats
            });
        }
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
// Superadmin only routes
router.use('/superadmin', (req, res, next) => {
    if (req.user.globalRole !== 'superadmin') {
        return res.status(403).json({ error: 'Superadmin access required' });
    }
    next();
});
// Create organization (superadmin only)
router.post('/superadmin/organizations', async (req, res) => {
    try {
        const { name, nit, size, address, phone, email, industry, adminUser } = req.body;
        if (!name || !nit || !size || !adminUser) {
            return res.status(400).json({ error: 'Name, NIT, size, and admin user are required' });
        }
        // Check if organization already exists
        const existingOrg = await prisma.organization.findUnique({
            where: { nit }
        });
        if (existingOrg) {
            return res.status(400).json({ error: 'Organization with this NIT already exists' });
        }
        // Create organization and admin user in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create organization
            const organization = await tx.organization.create({
                data: {
                    name,
                    nit,
                    size,
                    address,
                    phone,
                    email,
                    industry
                }
            });
            // Create admin user
            const passwordHash = await bcrypt.hash(adminUser.password, 10);
            const user = await tx.user.create({
                data: {
                    name: adminUser.name,
                    email: adminUser.email,
                    passwordHash,
                    globalRole: 'user'
                }
            });
            // Create membership
            const membership = await tx.membership.create({
                data: {
                    userId: user.id,
                    organizationId: organization.id
                }
            });
            // Create org admin role if it doesn't exist
            let orgAdminRole = await tx.role.findFirst({
                where: {
                    organizationId: organization.id,
                    roleKey: 'org_admin'
                }
            });
            if (!orgAdminRole) {
                orgAdminRole = await tx.role.create({
                    data: {
                        organizationId: organization.id,
                        name: 'Administrador de Organización',
                        roleKey: 'org_admin',
                        description: 'Administrador con acceso completo a la organización'
                    }
                });
                // Grant all permissions to org_admin role
                const permissions = await tx.permission.findMany();
                if (orgAdminRole) {
                    await Promise.all(permissions.map((permission) => tx.rolePermission.create({
                        data: {
                            roleId: orgAdminRole.id,
                            permissionId: permission.id
                        }
                    })));
                }
            }
            // Assign org_admin role to user
            if (orgAdminRole) {
                await tx.userRole.create({
                    data: {
                        membershipId: membership.id,
                        roleId: orgAdminRole.id
                    }
                });
            }
            return { organization, user, membership };
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Organization creation error:', error);
        res.status(500).json({ error: 'Failed to create organization' });
    }
});
// Get all organizations (superadmin only)
router.get('/superadmin/organizations', async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: {
                        employees: true,
                        memberships: true,
                        departments: true
                    }
                },
                memberships: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        },
                        roles: {
                            include: {
                                role: { select: { name: true, roleKey: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.json(organizations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});
// Update organization (superadmin only)
router.put('/superadmin/organizations/:id', async (req, res) => {
    try {
        const organization = await prisma.organization.update({
            where: { id: req.params.id },
            data: req.body,
            include: {
                _count: {
                    select: {
                        employees: true,
                        memberships: true,
                        departments: true
                    }
                }
            }
        });
        res.json(organization);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update organization' });
    }
});
// Delete organization (superadmin only)
router.delete('/superadmin/organizations/:id', async (req, res) => {
    try {
        const orgId = req.params.id;
        // Check if organization has employees
        const employeeCount = await prisma.employee.count({ where: { organizationId: orgId } });
        if (employeeCount > 0) {
            return res.status(400).json({
                error: 'No es posible eliminar la organización: aún tiene empleados. Elimina o traslada a todos los empleados primero.'
            });
        }
        // Check if organization has departments
        const departmentCount = await prisma.department.count({ where: { organizationId: orgId } });
        if (departmentCount > 0) {
            return res.status(400).json({
                error: 'No es posible eliminar la organización: existen departamentos asociados. Elimina los departamentos primero.'
            });
        }
        // Check memberships (usuarios asignados a la organización)
        const membershipCount = await prisma.membership.count({ where: { organizationId: orgId } });
        if (membershipCount > 0) {
            return res.status(400).json({
                error: 'No es posible eliminar la organización: hay usuarios/membresías asociadas. Remuévelas primero.'
            });
        }
        await prisma.organization.delete({ where: { id: orgId } });
        res.json({ success: true });
    }
    catch (error) {
        // Prisma FK constraint
        if (error?.code === 'P2003') {
            return res.status(400).json({
                error: 'No es posible eliminar la organización por registros relacionados. Asegúrate de eliminar empleados, departamentos, nómina, roles, permisos y membresías asociadas.'
            });
        }
        console.error('Delete organization error:', error);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
});
// Get all users (superadmin only)
router.get('/superadmin/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                globalRole: true,
                memberships: {
                    include: {
                        organization: { select: { name: true } },
                        roles: {
                            include: {
                                role: { select: { name: true, roleKey: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Update user role (superadmin only)
router.put('/superadmin/users/:id/role', async (req, res) => {
    try {
        const { globalRole } = req.body;
        if (!['superadmin', 'user'].includes(globalRole)) {
            return res.status(400).json({ error: 'Invalid global role' });
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { globalRole },
            select: {
                id: true,
                name: true,
                email: true,
                globalRole: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});
// Organization admin routes
router.use('/org', requirePermission('admin.access'));
// Get organization details
router.get('/org/details', async (req, res) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: { id: req.user.activeOrganizationId },
            include: {
                _count: {
                    select: {
                        employees: true,
                        departments: true,
                        positions: true,
                        memberships: true
                    }
                }
            }
        });
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.json(organization);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch organization details' });
    }
});
// Update organization details
router.put('/org/details', requirePermission('organizations.update'), async (req, res) => {
    try {
        const organization = await prisma.organization.update({
            where: { id: req.user.activeOrganizationId },
            data: req.body
        });
        res.json(organization);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update organization' });
    }
});
// Get organization users
router.get('/org/users', requirePermission('users.read'), async (req, res) => {
    try {
        const memberships = await prisma.membership.findMany({
            where: { organizationId: req.user.activeOrganizationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        globalRole: true
                    }
                },
                roles: {
                    include: {
                        role: {
                            select: { id: true, name: true, roleKey: true }
                        }
                    }
                }
            }
        });
        res.json(memberships);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch organization users' });
    }
});
// Invite user to organization
router.post('/org/users/invite', requirePermission('users.create'), async (req, res) => {
    try {
        const { name, email, password, roleIds } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        // Check if user already exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Create new user
            const passwordHash = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    globalRole: 'user'
                }
            });
        }
        // Check if user is already a member
        const existingMembership = await prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId: req.user.activeOrganizationId
                }
            }
        });
        if (existingMembership) {
            return res.status(400).json({ error: 'User is already a member of this organization' });
        }
        // Create membership
        const membership = await prisma.membership.create({
            data: {
                userId: user.id,
                organizationId: req.user.activeOrganizationId
            }
        });
        // Assign roles if provided
        if (roleIds && roleIds.length > 0) {
            await Promise.all(roleIds.map((roleId) => prisma.userRole.create({
                data: {
                    membershipId: membership.id,
                    roleId
                }
            })));
        }
        res.status(201).json({ user, membership });
    }
    catch (error) {
        console.error('User invitation error:', error);
        res.status(500).json({ error: 'Failed to invite user' });
    }
});
// Get organization roles
router.get('/org/roles', requirePermission('roles.read'), async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            where: { organizationId: req.user.activeOrganizationId },
            include: {
                permissions: {
                    include: {
                        permission: { select: { key: true, description: true } }
                    }
                },
                _count: {
                    select: { users: true }
                }
            }
        });
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});
// System statistics
router.get('/stats/system', async (req, res) => {
    try {
        const { globalRole, activeOrganizationId } = req.user;
        if (globalRole === 'superadmin') {
            const stats = await Promise.all([
                prisma.organization.count(),
                prisma.user.count(),
                prisma.employee.count(),
                prisma.payroll.count({ where: { status: 'approved' } }),
                prisma.testResult.count(),
            ]);
            res.json({
                organizations: stats[0],
                users: stats[1],
                employees: stats[2],
                payrolls: stats[3],
                testResults: stats[4],
            });
        }
        else {
            const stats = await Promise.all([
                prisma.employee.count({ where: { organizationId: activeOrganizationId } }),
                prisma.department.count({ where: { organizationId: activeOrganizationId } }),
                prisma.payroll.count({ where: { organizationId: activeOrganizationId, status: 'approved' } }),
                prisma.testResult.count({
                    where: {
                        employee: { organizationId: activeOrganizationId }
                    }
                }),
            ]);
            res.json({
                employees: stats[0],
                departments: stats[1],
                payrolls: stats[2],
                testResults: stats[3],
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
});
export default router;
