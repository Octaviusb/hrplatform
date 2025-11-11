import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  requestedDate: string;
  comments?: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export default function VacationsPage() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    days: 1,
    comments: ''
  });

  useEffect(() => {
    loadVacations();
    loadEmployees();
  }, []);

  const loadVacations = async () => {
    try {
      const response = await api.request('/vacations');
      setVacations(response);
    } catch (error) {
      console.error('Error loading vacations:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.getEmployees();
      setEmployees(response);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };
    if (newFormData.startDate && newFormData.endDate) {
      newFormData.days = calculateDays(newFormData.startDate, newFormData.endDate);
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/vacations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormData({ employeeId: '', startDate: '', endDate: '', days: 1, comments: '' });
      setShowForm(false);
      loadVacations();
    } catch (error) {
      console.error('Error creating vacation:', error);
    }
  };

  const approveVacation = async (id: string) => {
    try {
      await api.request(`/vacations/${id}/approve`, { method: 'PATCH' });
      loadVacations();
    } catch (error) {
      console.error('Error approving vacation:', error);
    }
  };

  const rejectVacation = async (id: string) => {
    try {
      await api.request(`/vacations/${id}/reject`, { method: 'PATCH' });
      loadVacations();
    } catch (error) {
      console.error('Error rejecting vacation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout title="Vacaciones" subtitle="Gestión de solicitudes y aprobación de tiempo libre">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Vacaciones</h3>
            <p className="text-sm text-gray-500">Administra las solicitudes de tiempo libre del equipo</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              showForm 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Solicitud
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Solicitar Vacaciones</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="">Seleccionar empleado</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="date"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
                <input
                  type="date"
                  required
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Días"
                  readOnly
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  value={formData.days}
                />
              </div>

              <textarea
                placeholder="Comentarios adicionales (opcional)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={3}
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
              />

              <button
                type="submit"
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Solicitar Vacaciones
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {vacations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes de vacaciones</h3>
              <p className="text-gray-500 mb-6">Las solicitudes de vacaciones aparecerán aquí</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Primera Solicitud
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {vacations.map((vacation) => (
                <div key={vacation.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vacation.employee.firstName} {vacation.employee.lastName}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vacation.status)}`}>
                          {vacation.status === 'approved' ? 'Aprobada' : 
                           vacation.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {new Date(vacation.startDate).toLocaleDateString()} - {new Date(vacation.endDate).toLocaleDateString()}</span>
                        <span>📊 {vacation.days} días</span>
                        <span>🗓️ Solicitado: {new Date(vacation.requestedDate).toLocaleDateString()}</span>
                      </div>
                      {vacation.comments && (
                        <p className="text-gray-600 mt-2">{vacation.comments}</p>
                      )}
                    </div>
                    {vacation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => approveVacation(vacation.id)}
                          className="inline-flex items-center bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aprobar
                        </button>
                        <button 
                          onClick={() => rejectVacation(vacation.id)}
                          className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}