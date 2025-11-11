import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrg, setSelectedOrg] = useState('');

  // If user is logged in but has no active org, ask to choose one (SaaS multi-tenant)
  const needsOrgSelection = !!user && !user.activeOrganizationId;

  useEffect(() => {
    const loadOrgs = async () => {
      if (!user) return;
      // Superadmin: list all orgs; regular: list memberships
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
      console.log('Intentando login con:', { email, password });
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error('Error de login:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-900">Selecciona tu organización</h2>
            <p className="text-sm text-gray-600 text-center mt-1">Configura el contexto para continuar</p>
          </div>
          {orgs.length > 0 ? (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Organización</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
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
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={!selectedOrg}
                onClick={() => {
                  api.setOrganizationId(selectedOrg);
                  navigate('/dashboard', { replace: true });
                }}
              >
                Continuar
              </button>
            </>
          ) : (
            <>
              <div className="text-center text-sm text-gray-700">
                {user?.globalRole === 'superadmin' ? (
                  <>
                    <p className="mb-3">No hay organizaciones creadas.</p>
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Ir a Administración para crear una organización
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-3">Tu cuenta no tiene organizaciones asignadas. Contacta al administrador.</p>
                    <div className="space-y-2">
                      <a
                        href="mailto:soporte@tu-saas.com?subject=Solicitud%20de%20acceso%20a%20organizaci%C3%B3n"
                        className="block text-center w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        Solicitar acceso
                      </a>
                      <button
                        onClick={() => logout()}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Platform</h1>
          <h2 className="text-xl font-semibold text-gray-700">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Sistema de gestión de recursos humanos
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ingresa tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              isRegister ? 'Crear cuenta' : 'Iniciar sesión'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}