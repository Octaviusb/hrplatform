import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

interface PsychometricTest {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  instructions: string;
  isActive: boolean;
  _count: {
    assignments: number;
    results: number;
  };
}

interface TestAssignment {
  id: string;
  status: string;
  assignedAt: string;
  dueDate?: string;
  test: {
    id: string;
    name: string;
    category: string;
    duration: number;
  };
  result?: {
    id: string;
    score: number;
  };
}

export default function PsychometricTestsPage() {
  const [tests, setTests] = useState<PsychometricTest[]>([]);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'assigned' | 'create'>('assigned');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestAssignment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'personality',
    duration: 30,
    instructions: ''
  });

  useEffect(() => {
    loadTests();
    loadAssignments();
  }, []);

  const loadTests = async () => {
    try {
      const response = await api.getPsychometricTests();
      setTests(response);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await api.getMyTestAssignments();
      setAssignments(response);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPsychometricTest(formData);
      setFormData({ name: '', description: '', category: 'personality', duration: 30, instructions: '' });
      loadTests();
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const startTest = async (assignment: TestAssignment) => {
    try {
      await api.startTest(assignment.id);
      setSelectedTest(assignment);
      setShowTestModal(true);
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const closeTestModal = () => {
    setShowTestModal(false);
    setSelectedTest(null);
  };

  return (
    <Layout title="Pruebas Psicométricas" subtitle="Evaluaciones psicológicas y de competencias para el desarrollo del talento">
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assigned'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Pruebas Asignadas
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'available'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pruebas Disponibles
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Crear Prueba
            </button>
          </nav>
        </div>

        {activeTab === 'assigned' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Mis Pruebas Asignadas</h3>
              <p className="text-sm text-gray-500">Completa las evaluaciones que te han sido asignadas</p>
            </div>
            {assignments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pruebas asignadas</h3>
                <p className="text-gray-500">Las pruebas asignadas aparecerán aquí cuando estén disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{assignment.test.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Categoría: {assignment.test.category}</p>
                    <p className="text-sm text-gray-500 mb-4">Duración: {assignment.test.duration} min</p>
                    
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {assignment.status === 'completed' ? 'Completada' : 
                         assignment.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                      
                      {assignment.status === 'pending' && (
                        <button
                          onClick={() => startTest(assignment)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                        >
                          Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pruebas Disponibles</h3>
              <p className="text-sm text-gray-500">Explora las evaluaciones disponibles en el sistema</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <div key={test.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{test.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                  <p className="text-sm text-gray-500 mb-2">Categoría: {test.category}</p>
                  <p className="text-sm text-gray-500 mb-4">Duración: {test.duration} min</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {test._count.assignments} asignaciones • {test._count.results} completadas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Crear Nueva Prueba</h3>
              <p className="text-sm text-gray-500">Diseña evaluaciones personalizadas para tu organización</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <form onSubmit={handleCreateTest} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre de la prueba"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <textarea
                  placeholder="Descripción"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="personality">Personalidad</option>
                  <option value="intelligence">Inteligencia</option>
                  <option value="aptitude">Aptitud</option>
                  <option value="emotional">Inteligencia Emocional</option>
                </select>
                <input
                  type="number"
                  placeholder="Duración (minutos)"
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                />
                <textarea
                  placeholder="Instrucciones para la prueba"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  rows={4}
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Crear Prueba
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Prueba Psicométrica */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{selectedTest.test.name}</h2>
              <button
                onClick={closeTestModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Información de la Prueba</h3>
                  <p className="text-sm text-blue-700 mb-2"><strong>Categoría:</strong> {selectedTest.test.category}</p>
                  <p className="text-sm text-blue-700 mb-2"><strong>Duración:</strong> {selectedTest.test.duration} minutos</p>
                  <p className="text-sm text-blue-700"><strong>Estado:</strong> {selectedTest.status}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-yellow-900 mb-2">Instrucciones</h3>
                  <p className="text-sm text-yellow-700">
                    Esta es una prueba psicométrica de ejemplo. En una implementación real, aquí se mostrarían las preguntas específicas de la prueba.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Ejemplo de Preguntas:</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium mb-3">1. ¿Cómo te describes mejor?</p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="q1" className="mr-2" />
                        <span>Extrovertido y sociable</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="q1" className="mr-2" />
                        <span>Introvertido y reflexivo</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="q1" className="mr-2" />
                        <span>Equilibrado entre ambos</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium mb-3">2. En situaciones de estrés prefieres:</p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="q2" className="mr-2" />
                        <span>Trabajar solo para concentrarte</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="q2" className="mr-2" />
                        <span>Buscar apoyo del equipo</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="q2" className="mr-2" />
                        <span>Tomar un descanso antes de continuar</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium mb-3">3. Tu estilo de liderazgo es más:</p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="q3" className="mr-2" />
                        <span>Directivo y orientado a resultados</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="q3" className="mr-2" />
                        <span>Colaborativo y orientado a personas</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="q3" className="mr-2" />
                        <span>Adaptativo según la situación</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <button
                onClick={closeTestModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Prueba completada. En una implementación real, aquí se enviarían las respuestas.');
                  closeTestModal();
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Completar Prueba
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}