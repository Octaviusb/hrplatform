import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function LoginNew() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  const needsOrgSelection = !!user && !user.activeOrganizationId;

  const demoCredentials = [
    { role: 'Super Admin', email: 'superadmin@hrplatform.com', password: 'admin123', org: 'Todas las organizaciones' },
    { role: 'TechCorp Admin', email: 'carlos@techcorp.co', password: 'admin123', org: 'TechCorp Colombia' },
    { role: 'Manufacturas Admin', email: 'ana@manufnorte.com', password: 'admin123', org: 'Manufacturas del Norte' },
    { role: 'Servicios Admin', email: 'luis@servfinsa.com', password: 'admin123', org: 'Servicios Financieros SA' },
    { role: 'Usuario Demo', email: 'test@test.com', password: '123456', org: 'TechCorp Colombia' }
  ];

  const fillCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  useEffect(() => {
    const loadOrgs = async () => {
      if (!user) return;
      if (user.globalRole === 'superadmin') {
        try {
          const list = await api.get('/admin/superadmin/organizations');
          setOrgs(list.map((o: any) => ({ id: o.id, name: o.name })));
        } catch {}
      } else if (user.memberships && user.memberships.length > 0) {
        setOrgs(user.memberships.map((m: any) => ({ id: m.organizationId, name: m.organization?.name || m.organizationId })));
      }
    };
    if (needsOrgSelection) loadOrgs();
  }, [user, needsOrgSelection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError('Error de autenticación: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user && !needsOrgSelection) {
    return <Navigate to="/dashboard" replace />;
  }

  if (needsOrgSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Selecciona tu organización</h2>
            <p className="text-gray-600 mt-2">Configura el contexto para continuar</p>
          </div>
          
          {orgs.length > 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organización</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                >
                  <option value="">Selecciona una organización</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                disabled={!selectedOrg}
                onClick={() => {
                  api.setOrganizationId(selectedOrg);
                  navigate('/dashboard', { replace: true });
                }}
              >
                Continuar
              </button>
            </div>
          ) : (
            <div className="text-center">
              {user?.globalRole === 'superadmin' ? (
                <div className="space-y-4">
                  <p className="text-gray-600">No hay organizaciones creadas.</p>
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700"
                  >
                    Ir a Administración
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Tu cuenta no tiene organizaciones asignadas.</p>
                  <button
                    onClick={() => logout()}
                    className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-200"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">HRPlatform</h1>
                <p className="text-blue-200 text-sm">Gestión Integral de Recursos Humanos</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            >
              {showDemo ? 'Ocultar' : 'Ver'} Credenciales Demo
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full flex gap-8">
          {/* Login Form */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
                </h2>
                <p className="text-gray-600">
                  {isRegister ? 'Regístrate en la plataforma' : 'Accede a tu plataforma de RRHH'}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                
                {isRegister && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </div>
                  ) : (
                    isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              </form>
            </div>
          </div>

          {/* Demo Credentials Panel */}
          {showDemo && (
            <div className="flex-1 max-w-md">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Credenciales de Demo
                </h3>
                <div className="space-y-4">
                  {demoCredentials.map((cred, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{cred.role}</h4>
                        <button
                          onClick={() => fillCredentials(cred.email, cred.password)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Usar
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Email:</span> {cred.email}</p>
                        <p><span className="font-medium">Password:</span> {cred.password}</p>
                        <p><span className="font-medium">Organización:</span> {cred.org}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Funcionalidades Demo</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• SaaS Multi-Tenant</li>
                    <li>• 3 Organizaciones Demo</li>
                    <li>• 15 módulos HR completos</li>
                    <li>• Integración DIAN nativa</li>
                    <li>• Evaluaciones de desempeño</li>
                    <li>• Aislamiento total de datos</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}