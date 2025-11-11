import { useEffect, useState } from 'react';
import AppLayout from '../_components/app-layout';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  department?: { name: string };
  position?: { title: string };
  status: string;
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeNumber: '',
    identificationType: 'CC',
    identificationNumber: '',
    hireDate: new Date().toISOString().split('T')[0]
  });

  const loadEmployees = async () => {
    try {
      const list = await api.getEmployees();
      setEmployees(list || []);
    } catch (e) {
      console.error('Error loading employees:', e);
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const canManage = true; // Simplified for demo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        employeeNumber: formData.employeeNumber,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber,
        hireDate: formData.hireDate,
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        employeeNumber: '',
        identificationType: 'CC',
        identificationNumber: '',
        hireDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      await loadEmployees();
    } catch (err) {
      console.error('Error creating employee:', err);
      alert('No se pudo crear el empleado. Verifica que el servidor esté funcionando y que tengas permisos.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Lista de Empleados</h3>
            <p className="text-sm text-gray-500">Administra el personal de la organización</p>
          </div>
          {canManage && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
              className="w-full sm:w-auto"
            >
              {showForm ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="sm:hidden">Cancelar</span>
                  <span className="hidden sm:inline">Cancelar</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="sm:hidden">+ Empleado</span>
                  <span className="hidden sm:inline">Nuevo Empleado</span>
                </>
              )}
            </Button>
            <BulkUpload />
          </div>
          )}
        </div>

        {canManage && showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nombres</Label>
                  <Input
                    placeholder="Nombres"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Apellidos</Label>
                  <Input
                    placeholder="Apellidos"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Número de empleado</Label>
                  <Input
                    placeholder="Número de empleado"
                    required
                    value={formData.employeeNumber}
                    onChange={(e) => setFormData({...formData, employeeNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Número de identificación</Label>
                  <Input
                    placeholder="Número de identificación"
                    required
                    value={formData.identificationNumber}
                    onChange={(e) => setFormData({...formData, identificationNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Fecha de contratación</Label>
                  <Input
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button type="submit" className="w-full sm:w-auto">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Crear Empleado
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {employees.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empleados registrados</h3>
              <p className="text-gray-500 mb-6">Comienza agregando el primer empleado a tu organización</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Primer Empleado
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <div key={employee.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-indigo-600">
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        <p className="text-xs text-gray-400">ID: {employee.employeeNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar
                        </button>
                        <button className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function BulkUpload() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const onSelect: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await api.uploadEmployees(file);
      setResult(res);
      alert(`Creados: ${res.created || res.generated || 0}, Errores: ${res.errors || 0}`);
    } catch (err) {
      alert('Error al cargar CSV');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <label className={`inline-flex items-center px-4 py-2 rounded-lg font-medium border ${busy ? 'opacity-50' : 'cursor-pointer'} bg-white hover:bg-gray-50`}>
      <input type="file" accept=".csv" onChange={onSelect} className="hidden" disabled={busy} />
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16M4 12h10m-6-4h6m-6 8h6" />
      </svg>
      {busy ? 'Subiendo...' : 'Carga masiva (CSV)'}
    </label>
  );
}