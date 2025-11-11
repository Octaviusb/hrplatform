import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Layout from '../components/Layout';

interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  duration: number;
  instructor?: string;
  capacity?: number;
  startDate: string;
  endDate: string;
  status: string;
  cost?: number;
  location?: string;
  enrollments?: any[];
}

export default function Training() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'presencial',
    duration: 0,
    instructor: '',
    capacity: 0,
    startDate: '',
    endDate: '',
    status: 'scheduled',
    cost: 0,
    location: '',
    organizationId: 'org1'
  });

  const [enrollData, setEnrollData] = useState({
    employeeId: '',
    enrolledBy: 'Admin'
  });

  useEffect(() => {
    fetchTrainings();
    fetchEnrollments();
    fetchEmployees();
  }, []);

  const fetchTrainings = async () => {
    try {
      const response = await api.get('/training');
      setTrainings(response);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/training/enrollments');
      setEnrollments(response);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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
        await api.put(`/training/${editingId}`, formData);
      } else {
        await api.post('/training', formData);
      }
      fetchTrainings();
      resetForm();
    } catch (error) {
      console.error('Error saving training:', error);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/training/${selectedTraining}/enroll`, enrollData);
      fetchEnrollments();
      setShowEnrollForm(false);
      setEnrollData({ employeeId: '', enrolledBy: 'Admin' });
    } catch (error) {
      console.error('Error enrolling employee:', error);
    }
  };

  const handleEdit = (training: Training) => {
    setFormData({
      title: training.title,
      description: training.description,
      category: training.category,
      type: training.type,
      duration: training.duration,
      instructor: training.instructor || '',
      capacity: training.capacity || 0,
      startDate: training.startDate.split('T')[0],
      endDate: training.endDate.split('T')[0],
      status: training.status,
      cost: training.cost || 0,
      location: training.location || '',
      organizationId: 'org1'
    });
    setEditingId(training.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta capacitación?')) {
      try {
        await api.delete(`/training/${id}`);
        fetchTrainings();
      } catch (error) {
        console.error('Error deleting training:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      type: 'presencial',
      duration: 0,
      instructor: '',
      capacity: 0,
      startDate: '',
      endDate: '',
      status: 'scheduled',
      cost: 0,
      location: '',
      organizationId: 'org1'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Capacitación y Desarrollo" subtitle="Programas de formación y desarrollo profesional">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Capacitación y Desarrollo</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEnrollForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Inscribir Empleado
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Capacitación
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Capacitación' : 'Nueva Capacitación'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
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
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="tecnica">Técnica</option>
                  <option value="liderazgo">Liderazgo</option>
                  <option value="habilidades-blandas">Habilidades Blandas</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="compliance">Compliance</option>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

      {showEnrollForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Inscribir Empleado</h2>
          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacitación
                </label>
                <select
                  value={selectedTraining}
                  onChange={(e) => setSelectedTraining(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Seleccionar capacitación</option>
                  {trainings.filter(t => t.status === 'scheduled').map((training) => (
                    <option key={training.id} value={training.id}>
                      {training.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado
                </label>
                <select
                  value={enrollData.employeeId}
                  onChange={(e) => setEnrollData({...enrollData, employeeId: e.target.value})}
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

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Inscribir
              </button>
              <button
                type="button"
                onClick={() => setShowEnrollForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {trainings.map((training) => (
          <div key={training.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{training.title}</h3>
                <p className="text-sm text-gray-600">{training.category} • {training.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                  {training.status}
                </span>
                <button
                  onClick={() => handleEdit(training)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(training.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600">{training.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Duración:</span>
                  <p className="text-gray-600">{training.duration} horas</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Instructor:</span>
                  <p className="text-gray-600">{training.instructor || 'No asignado'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Capacidad:</span>
                  <p className="text-gray-600">{training.capacity || 'Ilimitada'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Costo:</span>
                  <p className="text-gray-600">${training.cost || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fechas:</span>
                  <p className="text-gray-600">
                    {new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}
                  </p>
                </div>
                {training.location && (
                  <div>
                    <span className="font-medium text-gray-700">Ubicación:</span>
                    <p className="text-gray-600">{training.location}</p>
                  </div>
                )}
              </div>

              {training.enrollments && training.enrollments.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Inscritos:</span>
                  <p className="text-gray-600">{training.enrollments.length} empleados</p>
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