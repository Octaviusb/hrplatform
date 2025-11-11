import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

interface Interview {
  id: string;
  type: string;
  scheduledDate: string;
  completedDate?: string;
  status: string;
  notes?: string;
  outcome?: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'performance',
    scheduledDate: '',
    notes: ''
  });

  useEffect(() => {
    loadInterviews();
    loadEmployees();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = await api.request('/interviews');
      setInterviews(response);
    } catch (error) {
      console.error('Error loading interviews:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/interviews', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormData({ employeeId: '', type: 'performance', scheduledDate: '', notes: '' });
      setShowForm(false);
      loadInterviews();
    } catch (error) {
      console.error('Error creating interview:', error);
    }
  };

  const completeInterview = async (id: string, outcome: string) => {
    try {
      await api.request(`/interviews/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome })
      });
      loadInterviews();
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      performance: 'Desempeño',
      feedback: 'Retroalimentación',
      development: 'Desarrollo',
      disciplinary: 'Disciplinaria'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Layout title="Entrevistas" subtitle="Programación y seguimiento de entrevistas de competencias">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Entrevistas Programadas</h3>
            <p className="text-sm text-gray-500">Gestiona las entrevistas de evaluación y desarrollo</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {showForm ? 'Cancelar' : '+ Nueva Entrevista'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Programar Nueva Entrevista</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  required
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                
                <select
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="performance">Evaluación de Desempeño</option>
                  <option value="feedback">Retroalimentación</option>
                  <option value="development">Desarrollo Profesional</option>
                  <option value="disciplinary">Entrevista Disciplinaria</option>
                </select>
              </div>

              <input
                type="datetime-local"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
              />

              <textarea
                placeholder="Notas adicionales (opcional)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Programar Entrevista
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {interviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entrevistas programadas</h3>
              <p className="text-gray-500 mb-6">Programa la primera entrevista de evaluación</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                + Programar Entrevista
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {interviews.map((interview) => (
                <div key={interview.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.employee.firstName} {interview.employee.lastName}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(interview.status)}`}>
                          {interview.status === 'scheduled' ? 'Programada' : 
                           interview.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                          {getTypeLabel(interview.type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {new Date(interview.scheduledDate).toLocaleString()}</span>
                        <span>ID: {interview.employee.employeeNumber}</span>
                      </div>
                      {interview.notes && (
                        <p className="text-gray-600 mt-2">{interview.notes}</p>
                      )}
                    </div>
                    {interview.status === 'scheduled' && (
                      <button
                        onClick={() => completeInterview(interview.id, 'Entrevista completada exitosamente')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Marcar Completada
                      </button>
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