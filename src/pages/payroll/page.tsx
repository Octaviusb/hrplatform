import { useEffect, useState } from 'react';
import AppLayout from '../_components/app-layout';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({
    period: '',
    periodStart: '',
    periodEnd: ''
  });
  const [genResult, setGenResult] = useState<any | null>(null);
  const [preview, setPreview] = useState<{ id: string; data: any } | null>(null);

  const loadPayrolls = async () => {
    try {
      const list = await api.getPayrolls();
      setPayrolls(list || []);
    } catch (e) {
      console.error('Error loading payrolls:', e);
      setPayrolls([]);
    }
  };

  useEffect(() => {
    loadPayrolls();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/payroll/generate', genForm);
      setGenResult(res);
      setShowGenerate(false);
      loadPayrolls();
    } catch (err) {
      console.error('Error generating payroll:', err);
      alert('Error al procesar nómina. Verifica que el servidor esté funcionando y que existan empleados.');
    }
  };

  const approve = async (id: string) => {
    try {
      await api.post(`/payroll/${id}/approve`);
      await loadPayrolls();
    } catch {
      alert('No se pudo aprobar');
    }
  };

  const sendDian = async (id: string) => {
    try {
      const res = await api.post(`/payroll/${id}/send-dian`);
      alert(res?.dianResponse?.message || 'Enviado a DIAN');
      await loadPayrolls();
    } catch {
      alert('No se pudo enviar a DIAN');
    }
  };

  const openPreview = async (id: string) => {
    try {
      const res = await api.get(`/payroll/${id}/preview-dian`);
      setPreview({ id, data: res });
    } catch {
      alert('No se pudo previsualizar DIAN');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Nóminas Procesadas</h3>
            <p className="text-sm text-gray-500">Gestión de pagos mensuales y beneficios</p>
          </div>
          <Button onClick={() => setShowGenerate(true)} className="w-full sm:w-auto">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="sm:hidden">+ Nómina</span>
            <span className="hidden sm:inline">Procesar Nómina</span>
          </Button>
        </div>

        {showGenerate && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-md font-semibold mb-4">Generar Nómina</h4>
            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Período</Label>
                <Input
                  placeholder="2025-10"
                  value={genForm.period}
                  onChange={(e) => setGenForm({ ...genForm, period: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Inicio</Label>
                <Input
                  type="date"
                  value={genForm.periodStart}
                  onChange={(e) => setGenForm({ ...genForm, periodStart: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Fin</Label>
                <Input
                  type="date"
                  value={genForm.periodEnd}
                  onChange={(e) => setGenForm({ ...genForm, periodEnd: e.target.value })}
                  required
                />
              </div>
              <div>
                <Button type="submit" className="w-full">Generar</Button>
              </div>
            </form>
            {genResult && (
              <div className="mt-4 text-sm text-gray-700">
                <p>Generados: {genResult.generated} • Errores: {genResult.errors}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            {payrolls.map((p) => (
              <div key={p.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{p.employee?.firstName} {p.employee?.lastName}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${p.status==='approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${p.dianStatus==='sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        DIAN: {p.dianStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Período</p>
                        <p className="font-medium">{p.period}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Salario Base</p>
                        <p className="font-medium">{formatCurrency(p.baseSalary)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bonificaciones</p>
                        <p className="font-medium text-green-600">+{formatCurrency(p.bonuses)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Neto a Pagar</p>
                        <p className="font-bold text-lg">{formatCurrency(p.netSalary)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button onClick={() => openPreview(p.id)} className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">Previsualizar</button>
                    {p.status !== 'approved' && (
                      <button onClick={() => approve(p.id)} className="inline-flex items-center text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">Aprobar</button>
                    )}
                    {p.status === 'approved' && p.dianStatus !== 'sent' && (
                      <button onClick={() => sendDian(p.id)} className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">Enviar DIAN</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {preview && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Previsualización DIAN</h4>
                <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Empleador</p>
                    <p className="font-medium">{preview.data.payload?.employer?.name} (NIT {preview.data.payload?.employer?.nit})</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Empleado</p>
                    <p className="font-medium">{preview.data.payload?.employee?.name} • {preview.data.payload?.employee?.identification}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-500">Período</p>
                    <p className="font-medium">{preview.data.payload?.payroll?.period}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Base</p>
                    <p className="font-medium">{preview.data.payload?.payroll?.baseSalary?.toLocaleString?.('es-CO')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bonos</p>
                    <p className="font-medium">{preview.data.payload?.payroll?.bonuses?.toLocaleString?.('es-CO')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Neto</p>
                    <p className="font-medium">{preview.data.payload?.payroll?.netSalary?.toLocaleString?.('es-CO')}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 mb-1">Validación</p>
                  {preview.data.validation?.valid ? (
                    <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2">Validación OK. Puedes enviar a DIAN.</div>
                  ) : (
                    <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2">
                      <p className="font-medium mb-1">Errores detectados:</p>
                      <ul className="list-disc ml-5">
                        {(preview.data.validation?.errors || []).map((e: string, idx: number) => (
                          <li key={idx}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setPreview(null)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cerrar</button>
                {preview.data.validation?.valid && (
                  <button onClick={() => { setPreview(null); sendDian(preview.id); }} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Enviar DIAN</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}