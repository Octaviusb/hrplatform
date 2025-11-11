import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

interface Organization {
  id: string;
  name: string;
  nit: string;
  size: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  createdAt: string;
  _count?: {
    employees: number;
    departments: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  globalRole: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nit: '',
    size: 'small',
    address: '',
    phone: '',
    email: '',
    industry: ''
  });

  useEffect(() => {
    loadOrganizations();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/superadmin/users');
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await api.put(`/admin/superadmin/organizations/${editingOrg.id}`, formData);
      } else {
        await api.createOrganization(formData);
      }
      setShowModal(false);
      setEditingOrg(null);
      setFormData({ name: '', nit: '', size: 'small', address: '', phone: '', email: '', industry: '' });
      loadOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name || '',
      nit: org.nit || '',
      size: org.size || 'small',
      address: org.address || '',
      phone: org.phone || '',
      email: org.email || '',
      industry: org.industry || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta organización?')) {
      try {
        await api.delete(`/admin/superadmin/organizations/${id}`);
        loadOrganizations();
      } catch (error) {
        console.error('Error deleting organization:', error);
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la organización';
        alert(message);
      }
    }
  };

  const handleManageMembers = (orgId: string) => {
    setSelectedOrgId(orgId);
    setShowMembersModal(true);
  };

  const handleAssignUser = async (userId: string) => {
    try {
      await api.assignUserToOrganization(selectedOrgId, userId);
      alert('Usuario asignado exitosamente');
      setShowMembersModal(false);
    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Error al asignar usuario');
    }
  };

  return (
    <Layout title="Gestión de Organizaciones" subtitle="Administración completa de organizaciones del sistema">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium text-red-800">Acceso Superadministrador</span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Organización
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleManageMembers(org.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Gestionar usuarios"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>NIT:</strong> {org.nit}</p>
                <p><strong>Industria:</strong> {org.industry}</p>
                <p><strong>Tamaño:</strong> {org.size}</p>
                <p><strong>Email:</strong> {org.email}</p>
                <p><strong>Teléfono:</strong> {org.phone}</p>
              </div>

              {org._count && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{org._count.employees} empleados</span>
                    <span>{org._count.departments} departamentos</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingOrg ? 'Editar Organización' : 'Nueva Organización'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingOrg(null);
                    setFormData({ name: '', nit: '', size: 'small', address: '', phone: '', email: '', industry: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la organización"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="NIT"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.nit}
                  onChange={(e) => setFormData({...formData, nit: e.target.value})}
                />
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                >
                  <option value="small">Pequeña (1-50 empleados)</option>
                  <option value="medium">Mediana (51-200 empleados)</option>
                  <option value="large">Grande (200+ empleados)</option>
                </select>
                <input
                  type="text"
                  placeholder="Dirección"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Industria"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                />
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingOrg(null);
                      setFormData({ name: '', nit: '', size: 'small', address: '', phone: '', email: '', industry: '' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    {editingOrg ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Gestión de Usuarios */}
        {showMembersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">Asignar Usuarios a Organización</h2>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona los usuarios que deseas asignar a esta organización:
                </p>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.globalRole === 'superadmin' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.globalRole === 'superadmin' ? 'Superadmin' : 'Usuario'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAssignUser(user.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Asignar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}