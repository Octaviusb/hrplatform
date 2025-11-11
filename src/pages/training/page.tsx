import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function TrainingPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">← Dashboard</Link>
              <h1 className="text-xl font-semibold text-gray-900">Capacitación</h1>
            </div>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-500">Cerrar sesión</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Capacitación y Desarrollo</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Módulo en desarrollo...</p>
          </div>
        </div>
      </main>
    </div>
  );
}