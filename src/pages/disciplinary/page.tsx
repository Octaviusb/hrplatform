import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { hasOrgRole } from '../../lib/roles';

export default function DisciplinaryPage() {
  const { user } = useAuth();
  const canManage = !!user && (user.globalRole === 'superadmin' || hasOrgRole(user, 'org_admin', user.activeOrganizationId));

  const [cases, setCases] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', reasonSummary: '', details: '' });

  const load = async () => {
    try {
      const list = await api.get('/disciplinary/cases');
      setCases(list);
    } catch {}
  };
  const loadEmployees = async () => {
    try {
      const list = await api.get('/employees');
      setEmployees(list);
    } catch {}
  };

  useEffect(() => {
    load();
    loadEmployees();
  }, []);

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/disciplinary/cases', form);
      setForm({ employeeId: '', reasonSummary: '', details: '' });
      setShowForm(false);
      load();
    } catch {
      alert('No se pudo crear el caso');
    }
  };

  return (
    <Layout title="Disciplinario" subtitle="Gestión de procesos disciplinarios y terminación con justa causa">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Casos</h3>
            <p className="text-sm text-gray-500">Apertura, cargos, descargos, audiencias y decisiones</p>
          </div>
          {canManage && (
            <button onClick={() => setShowForm(!showForm)} className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${showForm ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              {showForm ? 'Cancelar' : 'Abrir caso'}
            </button>
          )}
        </div>

        {canManage && showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-md font-semibold mb-4">Abrir nuevo caso</h4>
            <form onSubmit={createCase} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Empleado</label>
                <select className="w-full border rounded px-3 py-2" required value={form.employeeId} onChange={(e)=>setForm({...form, employeeId:e.target.value})}>
                  <option value="">Selecciona</option>
                  {employees.map((emp:any)=> (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} • {emp.employeeNumber}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-700 mb-1">Resumen</label>
                <input className="w-full border rounded px-3 py-2" required value={form.reasonSummary} onChange={(e)=>setForm({...form, reasonSummary:e.target.value})} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-700 mb-1">Detalles</label>
                <input className="w-full border rounded px-3 py-2" value={form.details} onChange={(e)=>setForm({...form, details:e.target.value})} />
              </div>
              <div>
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Crear</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            {cases.map((c) => (
              <div key={c.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="text-md font-semibold text-gray-900">{c.employee?.firstName} {c.employee?.lastName}</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{c.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{c.reasonSummary}</p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Próximos: ver/gestionar caso (wizard) */}
                    <button className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">Ver</button>
                  </div>
                </div>
              </div>
            ))}
            {cases.length === 0 && (
              <div className="px-6 py-10 text-center text-gray-500">No hay casos disciplinarios</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
