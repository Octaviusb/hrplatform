import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const baseModules = [
    { name: 'Empleados', path: '/employees', description: 'Gestión de personal y datos de empleados' },
    { name: 'Departamentos', path: '/departments', description: 'Organización y estructura departamental' },
    { name: 'Observaciones', path: '/observations', description: 'Registro de observaciones de desempeño' },
    { name: 'Entrevistas', path: '/interviews', description: 'Programación y seguimiento de entrevistas' },
    { name: 'Análisis de Puestos', path: '/job-analysis', description: 'Definición y análisis de roles' },
    { name: 'Planes de Desarrollo', path: '/development-plans', description: 'Crecimiento profesional individual' },
    { name: 'Vacaciones', path: '/vacations', description: 'Solicitudes y gestión de tiempo libre' },
    { name: 'Asistencia', path: '/attendance', description: 'Control de horarios y presencia' },
    { name: 'Nómina', path: '/payroll', description: 'Procesamiento de pagos y beneficios' },
    { name: 'Reclutamiento', path: '/recruitment', description: 'Atracción y selección de talento' },
    { name: 'Capacitación', path: '/training', description: 'Programas de formación y desarrollo' },
    { name: 'Integración DIAN', path: '/dian-integration', description: 'Nómina electrónica y conexión DIAN' },
    { name: 'Disciplinario', path: '/disciplinary', description: 'Gestión de procesos disciplinarios y sanciones' },
    { name: 'Evaluaciones', path: '/evaluations', description: 'Evaluaciones de desempeño 360°', badge: 'NUEVO' },
    { name: 'Competencias', path: '/competencies', description: 'Gestión de competencias y habilidades', badge: 'NUEVO' },
    { name: 'Beneficios', path: '/benefits', description: 'Beneficios y compensación total', badge: 'NUEVO' },
    { name: 'Pruebas Psicométricas', path: '/psychometric-tests', description: 'Evaluaciones psicológicas y de competencias' },
  ];

  const superAdminModules = [
    { name: 'Organizaciones', path: '/admin/organizations', description: 'Gestión completa de organizaciones del sistema', badge: 'SUPERADMIN', isSuperAdmin: true },
  ];

  const modules = user?.globalRole === 'superadmin' 
    ? [...superAdminModules, ...baseModules]
    : baseModules;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HRPlatform</h1>
                <p className="text-xs text-gray-500">Demo Empresarial</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
              <h2 className="text-4xl font-bold mb-2">Panel de Control</h2>
              <p className="text-indigo-100 text-lg">Gestiona todos los aspectos de recursos humanos desde un solo lugar</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{modules.length}</div>
                  <div className="text-sm text-indigo-100">Módulos Disponibles</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-indigo-100">Funcional</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">DIAN</div>
                  <div className="text-sm text-indigo-100">Integrado</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div
                key={module.path}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
              >
                {module.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${
                      module.badge === 'SUPERADMIN' 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      {module.badge}
                    </span>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-16">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                  <Link
                    to={module.path}
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm transform hover:scale-[1.02]"
                  >
                    Acceder al Módulo
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}