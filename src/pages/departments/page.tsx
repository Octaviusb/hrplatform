import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { hasOrgRole } from '../../lib/roles';

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { logout, user } = useAuth();

  const loadDepartments = async () => {
    try {
      const data = await api.get('/departments');
      setDepartments(data);
    } catch (e) {
      // For demo, ignore errors
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const canManage = !!user && (user.globalRole === 'superadmin' || hasOrgRole(user, 'org_admin', user.activeOrganizationId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      await loadDepartments();
    } catch (e) {
      alert('No se pudo crear el departamento');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">
                ← Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Departamentos</h1>
            </div>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-500">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Departamentos</h2>
            {canManage && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {showForm ? 'Cancelar' : 'Nuevo Departamento'}
              </button>
            )}
          </div>

          {canManage && showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">Crear Nuevo Departamento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del departamento"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <textarea
                  placeholder="Descripción"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Crear Departamento
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No hay departamentos registrados</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-2 text-indigo-600 hover:text-indigo-500"
                >
                  Crear el primer departamento
                </button>
              </div>
            ) : (
              departments.map((department) => (
                <div key={department.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{department.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{department.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {(department as any)._count?.employees ?? department.employeeCount ?? 0} empleados
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-500 text-sm">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}