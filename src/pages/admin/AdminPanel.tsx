import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  type: 'superadmin' | 'org_admin';
  stats: any;
  recentEmployees?: any[];
  recentOrganizations?: any[];
  departmentStats?: any[];
  organizationStats?: any[];
}

interface Organization {
  id: string;
  name: string;
  nit: string;
  size: string;
  address?: string;
  phone?: string;
  email?: string;
  industry?: string;
  _count: {
    employees: number;
    memberships: number;
    departments: number;
  };
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrg, setSelectedOrg] = useState('');

  // New organization form
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    nit: '',
    size: 'small',
    address: '',
    phone: '',
    email: '',
    industry: '',
    adminUser: {
      name: '',
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    loadDashboardData();
    if (user?.globalRole === 'superadmin') {
      loadOrganizations();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await api.get('/admin/superadmin/organizations');
      setOrganizations(response);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/superadmin/organizations', newOrgForm);
      setNewOrgForm({
        name: '',
        nit: '',
        size: 'small',
        address: '',
        phone: '',
        email: '',
        industry: '',
        adminUser: { name: '', email: '', password: '' }
      });
      loadOrganizations();
      alert('Organización creada exitosamente');
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Error al crear la organización');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando panel de administración...</div>
      </div>
    );
  }

  const isSuperAdmin = user?.globalRole === 'superadmin';

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isSuperAdmin ? 'Panel de Superadministrador' : 'Panel de Administración'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isSuperAdmin 
            ? 'Gestión completa del sistema y organizaciones'
            : 'Gestión de tu organización'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="organizations">Organizaciones</TabsTrigger>}
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isSuperAdmin ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Organizaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalOrganizations}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empleados Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalEmployees}</div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empleados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.stats.activeEmployees} activos
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalDepartments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cargos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalPositions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nómina Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${dashboardData?.stats.totalPayroll?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.stats.payrollCount} registros
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isSuperAdmin && dashboardData?.recentOrganizations && (
              <Card>
                <CardHeader>
                  <CardTitle>Organizaciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentOrganizations.map((org: any) => (
                      <div key={org.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-gray-500">NIT: {org.nit}</p>
                        </div>
                        <Badge variant="outline">{org.size}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!isSuperAdmin && dashboardData?.recentEmployees && (
              <Card>
                <CardHeader>
                  <CardTitle>Empleados Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentEmployees.map((employee: any) => (
                      <div key={employee.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {dashboardData?.departmentStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas por Departamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.departmentStats.map((dept: any) => (
                      <div key={dept.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-gray-500">
                            {dept._count.positions} cargos
                          </p>
                        </div>
                        <Badge variant="outline">
                          {dept._count.employees} empleados
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="organizations" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Organizaciones</h2>
                <p className="text-sm text-gray-600">Selecciona una organización para acceder rápidamente.</p>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Organización</label>
                  <select
                    className="w-64 border rounded px-3 py-2"
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedOrg(id);
                    }}
                    value={selectedOrg}
                  >
                    <option value="">Selecciona</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <Button
                  disabled={!selectedOrg}
                  onClick={() => {
                    if (!selectedOrg) return;
                    api.setOrganizationId(selectedOrg);
                    navigate('/dashboard');
                  }}
                >
                  Acceder
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('create-org')}>
                  Crear organización
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {organizations.map((org) => (
                <Card key={org.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{org.name}</CardTitle>
                        <p className="text-sm text-gray-500">NIT: {org.nit}</p>
                      </div>
                      <Badge variant="outline">{org.size}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Empleados</p>
                        <p className="text-2xl font-bold">{org._count.employees}</p>
                      </div>
                      <div>
                        <p className="font-medium">Usuarios</p>
                        <p className="text-2xl font-bold">{org._count.memberships}</p>
                      </div>
                      <div>
                        <p className="font-medium">Departamentos</p>
                        <p className="text-2xl font-bold">{org._count.departments}</p>
                      </div>
                    </div>
                    {org.industry && (
                      <p className="text-sm text-gray-500 mt-2">Industria: {org.industry}</p>
                    )}
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          api.setOrganizationId(org.id);
                          navigate('/dashboard');
                        }}
                      >
                        Acceder
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('create-org')}>
                        Crear otra organización
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {organizations.length === 0 && (
                <div className="text-center border rounded-lg p-8 bg-white">
                  <p className="text-gray-700 mb-4">Aún no hay organizaciones.</p>
                  <Button onClick={() => setActiveTab('create-org')}>Crear primera organización</Button>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="create-org" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Organización</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Organización</Label>
                    <Input
                      id="name"
                      value={newOrgForm.name}
                      onChange={(e) => setNewOrgForm({...newOrgForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nit">NIT</Label>
                    <Input
                      id="nit"
                      value={newOrgForm.nit}
                      onChange={(e) => setNewOrgForm({...newOrgForm, nit: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Tamaño</Label>
                    <select
                      id="size"
                      value={newOrgForm.size}
                      onChange={(e) => setNewOrgForm({...newOrgForm, size: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="small">Pequeña (1-50 empleados)</option>
                      <option value="medium">Mediana (51-200 empleados)</option>
                      <option value="large">Grande (200+ empleados)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industria</Label>
                    <Input
                      id="industry"
                      value={newOrgForm.industry}
                      onChange={(e) => setNewOrgForm({...newOrgForm, industry: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={newOrgForm.address}
                    onChange={(e) => setNewOrgForm({...newOrgForm, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={newOrgForm.phone}
                      onChange={(e) => setNewOrgForm({...newOrgForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newOrgForm.email}
                      onChange={(e) => setNewOrgForm({...newOrgForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Usuario Administrador</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adminName">Nombre</Label>
                      <Input
                        id="adminName"
                        value={newOrgForm.adminUser.name}
                        onChange={(e) => setNewOrgForm({
                          ...newOrgForm,
                          adminUser: {...newOrgForm.adminUser, name: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={newOrgForm.adminUser.email}
                        onChange={(e) => setNewOrgForm({
                          ...newOrgForm,
                          adminUser: {...newOrgForm.adminUser, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="adminPassword">Contraseña</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={newOrgForm.adminUser.password}
                      onChange={(e) => setNewOrgForm({
                        ...newOrgForm,
                        adminUser: {...newOrgForm.adminUser, password: e.target.value}
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Crear Organización</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('organizations')}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-sm text-gray-600">Usuarios Activos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-sm text-gray-600">Administradores</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-sm text-gray-600">Usuarios Inactivos</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Lista de Usuarios</h3>
                  <Button>Agregar Usuario</Button>
                </div>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Rol</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">Ana García</td>
                        <td className="px-4 py-2">ana.garcia@techcorp.com</td>
                        <td className="px-4 py-2"><Badge>Admin</Badge></td>
                        <td className="px-4 py-2"><Badge variant="outline">Activo</Badge></td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline">Editar</Button>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Carlos Rodríguez</td>
                        <td className="px-4 py-2">carlos.rodriguez@techcorp.com</td>
                        <td className="px-4 py-2"><Badge variant="secondary">Usuario</Badge></td>
                        <td className="px-4 py-2"><Badge variant="outline">Activo</Badge></td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline">Editar</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Sistema</Label>
                    <Input defaultValue="HR Management System" />
                  </div>
                  <div>
                    <Label>Zona Horaria</Label>
                    <select className="w-full p-2 border rounded">
                      <option>America/Bogota</option>
                      <option>America/Mexico_City</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Logo de la Empresa</Label>
                  <Input type="file" accept="image/*" />
                </div>
                <Button>Guardar Configuración</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticación de Dos Factores</p>
                    <p className="text-sm text-gray-600">Requerir 2FA para todos los usuarios</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sesión Automática</p>
                    <p className="text-sm text-gray-600">Cerrar sesión después de inactividad</p>
                  </div>
                  <select className="p-2 border rounded">
                    <option>30 minutos</option>
                    <option>1 hora</option>
                    <option>2 horas</option>
                  </select>
                </div>
                <Button>Actualizar Seguridad</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Notificaciones por Email</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recordatorios de Vacaciones</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Alertas de Asistencia</span>
                    <input type="checkbox" />
                  </div>
                </div>
                <Button>Guardar Notificaciones</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;