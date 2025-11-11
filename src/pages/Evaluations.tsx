import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Layout from '../components/Layout';

interface Evaluation {
  id: string;
  period: string;
  type: string;
  status: string;
  overallScore?: number;
  employee: { firstName: string; lastName: string; employeeNumber: string };
  evaluator: { firstName: string; lastName: string };
  goals?: string;
  achievements?: string;
  improvements?: string;
  comments?: string;
  criteria: Array<{
    category: string;
    criterion: string;
    score?: number;
    weight: number;
  }>;
}

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any>({});
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    evaluatorId: '',
    period: '',
    type: 'annual',
    goals: '',
    achievements: '',
    improvements: '',
    comments: '',
    organizationId: 'org1'
  });

  useEffect(() => {
    fetchEvaluations();
    fetchEmployees();
    fetchTemplates();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await api.get('/evaluations');
      setEvaluations(response.data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/evaluations/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const template = templates[selectedTemplate];
      const evaluationData = {
        ...formData,
        criteria: template?.criteria || []
      };
      
      await api.post('/evaluations', evaluationData);
      fetchEvaluations();
      resetForm();
    } catch (error) {
      console.error('Error creating evaluation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      evaluatorId: '',
      period: '',
      type: 'annual',
      goals: '',
      achievements: '',
      improvements: '',
      comments: '',
      organizationId: 'org1'
    });
    setSelectedTemplate('');
    setShowForm(false);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Evaluaciones de Desempeño" subtitle="Gestión integral de evaluaciones 360° y seguimiento del rendimiento">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Evaluaciones de Desempeño</h1>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              NUEVO
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            Nueva Evaluación
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-semibold text-gray-900">{evaluations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {evaluations.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {evaluations.filter(e => e.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {evaluations.length > 0 
                    ? (evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0) / evaluations.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Nueva Evaluación de Desempeño</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empleado a Evaluar
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
                        {emp.firstName} {emp.lastName} - {emp.employeeNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evaluador
                  </label>
                  <select
                    value={formData.evaluatorId}
                    onChange={(e) => setFormData({...formData, evaluatorId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar evaluador</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plantilla de Evaluación
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar plantilla</option>
                    {Object.entries(templates).map(([key, template]: [string, any]) => (
                      <option key={key} value={key}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="ej: 2024-Q4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evaluación
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="annual">Anual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="probation">Período de Prueba</option>
                    <option value="360">Evaluación 360°</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objetivos y Metas
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                  placeholder="Describe los objetivos y metas para este período..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Crear Evaluación
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

        {/* Evaluations List */}
        <div className="grid gap-6">
          {evaluations.map((evaluation) => (
            <div key={evaluation.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {evaluation.employee.firstName} {evaluation.employee.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    #{evaluation.employee.employeeNumber} • {evaluation.period} • {evaluation.type}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {evaluation.overallScore && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                        {evaluation.overallScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Puntuación</div>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>

              {evaluation.criteria.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Criterios de Evaluación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {evaluation.criteria.map((criterion, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{criterion.criterion}</div>
                          <div className="text-xs text-gray-500">{criterion.category}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getScoreColor(criterion.score)}`}>
                            {criterion.score?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">Peso: {(criterion.weight * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.comments && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Comentarios del Evaluador</h4>
                  <p className="text-blue-800 text-sm">{evaluation.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}