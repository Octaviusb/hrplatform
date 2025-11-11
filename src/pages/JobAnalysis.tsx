import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Layout from '../components/Layout';

interface JobAnalysis {
  id: string;
  positionTitle: string;
  summary: string;
  responsibilities: string;
  requirements: string;
  skills: string;
  competencies: string;
  workConditions?: string;
  employee?: { firstName: string; lastName: string };
  department?: { name: string };
}

export default function JobAnalysis() {
  const [analyses, setAnalyses] = useState<JobAnalysis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    positionTitle: '',
    summary: '',
    responsibilities: '',
    requirements: '',
    skills: '',
    competencies: '',
    workConditions: '',
    employeeId: '',
    departmentId: '',
    organizationId: 'org1'
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await api.get('/job-analysis');
      setAnalyses(response);
    } catch (error) {
      console.error('Error fetching job analyses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/job-analysis/${editingId}`, formData);
      } else {
        await api.post('/job-analysis', formData);
      }
      fetchAnalyses();
      resetForm();
    } catch (error) {
      console.error('Error saving job analysis:', error);
    }
  };

  const handleEdit = (analysis: JobAnalysis) => {
    setFormData({
      positionTitle: analysis.positionTitle,
      summary: analysis.summary,
      responsibilities: analysis.responsibilities,
      requirements: analysis.requirements,
      skills: analysis.skills,
      competencies: analysis.competencies,
      workConditions: analysis.workConditions || '',
      employeeId: '',
      departmentId: '',
      organizationId: 'org1'
    });
    setEditingId(analysis.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este análisis de puesto?')) {
      try {
        await api.delete(`/job-analysis/${id}`);
        fetchAnalyses();
      } catch (error) {
        console.error('Error deleting job analysis:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      positionTitle: '',
      summary: '',
      responsibilities: '',
      requirements: '',
      skills: '',
      competencies: '',
      workConditions: '',
      employeeId: '',
      departmentId: '',
      organizationId: 'org1'
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <Layout title="Análisis de Puestos" subtitle="Definición y análisis de roles y responsabilidades">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Análisis de Puestos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Análisis
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Análisis' : 'Nuevo Análisis de Puesto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Puesto
                </label>
                <input
                  type="text"
                  value={formData.positionTitle}
                  onChange={(e) => setFormData({...formData, positionTitle: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resumen del Puesto
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsabilidades
              </label>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requisitos
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habilidades
                </label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competencias
                </label>
                <textarea
                  value={formData.competencies}
                  onChange={(e) => setFormData({...formData, competencies: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condiciones de Trabajo
              </label>
              <textarea
                value={formData.workConditions}
                onChange={(e) => setFormData({...formData, workConditions: e.target.value})}
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
        {analyses.map((analysis) => (
          <div key={analysis.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{analysis.positionTitle}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(analysis)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(analysis.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700">Resumen:</h4>
                <p className="text-gray-600">{analysis.summary}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">Responsabilidades:</h4>
                <p className="text-gray-600">{analysis.responsibilities}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Habilidades:</h4>
                  <p className="text-gray-600">{analysis.skills}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Competencias:</h4>
                  <p className="text-gray-600">{analysis.competencies}</p>
                </div>
              </div>

              {analysis.workConditions && (
                <div>
                  <h4 className="font-medium text-gray-700">Condiciones de Trabajo:</h4>
                  <p className="text-gray-600">{analysis.workConditions}</p>
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