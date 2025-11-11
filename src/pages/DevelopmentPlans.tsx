import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Layout from '../components/Layout';

interface DevelopmentPlan {
  id: string;
  title: string;
  description: string;
  objectives: string;
  timeline: string;
  resources?: string;
  status: string;
  progress: number;
  createdBy: string;
  employee?: { firstName: string; lastName: string };
}

export default function DevelopmentPlans() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    timeline: '',
    resources: '',
    status: 'active',
    progress: 0,
    employeeId: '',
    organizationId: 'org1',
    createdBy: 'Admin'
  });

  useEffect(() => {
    fetchPlans();
    fetchEmployees();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/development-plans');
      setPlans(response);
    } catch (error) {
      console.error('Error fetching development plans:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/development-plans/${editingId}`, formData);
      } else {
        await api.post('/development-plans', formData);
      }
      fetchPlans();
      resetForm();
    } catch (error) {
      console.error('Error saving development plan:', error);
    }
  };

  const handleEdit = (plan: DevelopmentPlan) => {
    setFormData({
      title: plan.title,
      description: plan.description,
      objectives: plan.objectives,
      timeline: plan.timeline,
      resources: plan.resources || '',
      status: plan.status,
      progress: plan.progress,
      employeeId: '',
      organizationId: 'org1',
      createdBy: plan.createdBy
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este plan de desarrollo?')) {
      try {
        await api.delete(`/development-plans/${id}`);
        fetchPlans();
      } catch (error) {
        console.error('Error deleting development plan:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      objectives: '',
      timeline: '',
      resources: '',
      status: 'active',
      progress: 0,
      employeeId: '',
      organizationId: 'org1',
      createdBy: 'Admin'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Planes de Desarrollo" subtitle="Crecimiento profesional y desarrollo de competencias">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planes de Desarrollo</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Plan' : 'Nuevo Plan de Desarrollo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Plan
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivos
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cronograma
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="ej: 6 meses"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="active">Activo</option>
                  <option value="completed">Completado</option>
                  <option value="paused">Pausado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progreso (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recursos Necesarios
              </label>
              <textarea
                value={formData.resources}
                onChange={(e) => setFormData({...formData, resources: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                {plan.employee && (
                  <p className="text-sm text-gray-600">
                    Empleado: {plan.employee.firstName} {plan.employee.lastName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700">Descripción:</h4>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Objetivos:</h4>
                <p className="text-gray-600">{plan.objectives}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Cronograma:</h4>
                  <p className="text-gray-600">{plan.timeline}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Progreso:</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{plan.progress}%</span>
                  </div>
                </div>
              </div>

              {plan.resources && (
                <div>
                  <h4 className="font-medium text-gray-700">Recursos:</h4>
                  <p className="text-gray-600">{plan.resources}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </Layout>
  );
}