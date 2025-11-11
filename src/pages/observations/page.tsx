import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

interface Observation {
  id: string;
  type: string;
  category: string;
  content: string;
  rating?: number;
  date: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'informal',
    category: '',
    content: '',
    rating: 3
  });

  useEffect(() => {
    loadObservations();
    loadEmployees();
  }, []);

  const loadObservations = async () => {
    try {
      const response = await api.request('/observations');
      setObservations(response);
    } catch (error) {
      console.error('Error loading observations:', error);
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
      await api.request('/observations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormData({ employeeId: '', type: 'informal', category: '', content: '', rating: 3 });
      setShowForm(false);
      loadObservations();
    } catch (error) {
      console.error('Error creating observation:', error);
    }
  };

  const categories = [
    'Comunicación',
    'Liderazgo',
    'Trabajo en equipo',
    'Resolución de problemas',
    'Iniciativa',
    'Puntualidad',
    'Calidad del trabajo',
    'Actitud',
    'Otro'
  ];

  return (
    <Layout title="Observaciones" subtitle="Registro y seguimiento de observaciones de desempeño">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Observaciones de Desempeño</h3>
            <p className="text-sm text-gray-500">Documenta comportamientos y competencias observadas</p>
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
                Nueva Observación
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Registrar Nueva Observación</h3>
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
                      {employee.firstName} {employee.lastName} - {employee.employeeNumber}
                    </option>
                  ))}
                </select>
                
                <select
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="informal">Observación Informal</option>
                  <option value="formal">Observación Formal</option>
                </select>
              </div>

              <select
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <textarea
                placeholder="Descripción detallada de la observación..."
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({...formData, rating})}
                      className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                        formData.rating === rating
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Registrar Observación
              </button>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {observations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay observaciones registradas</h3>
              <p className="text-gray-500 mb-6">Comienza documentando las primeras observaciones de desempeño</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                + Registrar Observación
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {observations.map((observation) => (
                <div key={observation.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {observation.employee.firstName} {observation.employee.lastName}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          observation.type === 'formal' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {observation.type === 'formal' ? 'Formal' : 'Informal'}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                          {observation.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{observation.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {observation.employee.employeeNumber}</span>
                        <span>{new Date(observation.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {observation.rating && (
                      <div className="ml-4 flex items-center">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{observation.rating}</div>
                          <div className="text-xs text-gray-500">de 5</div>
                        </div>
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