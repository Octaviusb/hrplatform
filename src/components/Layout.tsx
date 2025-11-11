import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OrgSwitcher from './OrgSwitcher';
import { hasOrgRole } from '../lib/roles';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">HRPlatform</h1>
              </Link>
              <div className="flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/employees" 
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  Empleados
                </Link>
                <Link 
                  to="/departments" 
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  Departamentos
                </Link>
                <Link 
                  to="/payroll" 
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  Nómina
                </Link>
                <Link 
                  to="/psychometric-tests" 
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  Pruebas
                </Link>
                <Link 
                  to="/disciplinary" 
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                  Disciplinario
                </Link>
                {(user && (user.globalRole === 'superadmin' || hasOrgRole(user, 'org_admin', user.activeOrganizationId))) && (
                  <Link 
                    to="/admin" 
                    className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                  >
                    Administración
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {user?.globalRole === 'superadmin' && (
                <OrgSwitcher />
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
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
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}