import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Layout from '../components/Layout';

interface PayrollDian {
  id: string;
  period: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  netSalary: number;
  dianStatus: string;
  dianReference?: string;
  dianResponse?: string;
}

export default function DianIntegration() {
  const [payrolls, setPayrolls] = useState<PayrollDian[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPayrolls();
    fetchReports();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll');
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get('/dian/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching DIAN reports:', error);
    }
  };

  const handleSubmitToDian = async (payrollId: string) => {
    setLoading(payrollId);
    try {
      await api.post(`/dian/submit-payroll/${payrollId}`);
      fetchPayrolls();
      fetchReports();
    } catch (error) {
      console.error('Error submitting to DIAN:', error);
      alert('Error al enviar a la DIAN');
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <Layout title="Integración DIAN" subtitle="Nómina electrónica y conexión con la DIAN">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Integración DIAN</h1>
        <div className="text-sm text-gray-600">
          Nómina Electrónica - Conexión con DIAN
        </div>
      </div>

      {/* Reports Summary */}
      {reports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Nóminas</h3>
            <p className="text-3xl font-bold text-blue-600">{reports.summary.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aprobadas</h3>
            <p className="text-3xl font-bold text-green-600">{reports.summary.approved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasa de Aprobación</h3>
            <p className="text-3xl font-bold text-purple-600">{reports.summary.approvalRate}%</p>
          </div>
        </div>
      )}

      {/* DIAN Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Información DIAN</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• La nómina electrónica es obligatoria para empresas con más de 250 empleados</p>
          <p>• Los archivos deben enviarse en formato XML según especificaciones DIAN</p>
          <p>• El plazo máximo de envío es hasta el día 10 del mes siguiente</p>
          <p>• Se requiere certificado digital válido para la transmisión</p>
        </div>
      </div>

      {/* Payroll List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nóminas para Envío DIAN</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Neto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado DIAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.map((payroll) => (
                <tr key={payroll.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payroll.employee.firstName} {payroll.employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{payroll.employee.employeeNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payroll.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payroll.netSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payroll.dianStatus)}`}>
                      {getStatusText(payroll.dianStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payroll.dianReference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payroll.dianStatus === 'pending' ? (
                      <button
                        onClick={() => handleSubmitToDian(payroll.id)}
                        disabled={loading === payroll.id}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading === payroll.id ? 'Enviando...' : 'Enviar a DIAN'}
                      </button>
                    ) : (
                      <span className="text-gray-500">Procesado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIAN Response Details */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Respuestas DIAN</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {payrolls
              .filter(p => p.dianResponse)
              .map((payroll) => (
                <div key={payroll.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {payroll.employee.firstName} {payroll.employee.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{payroll.period}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payroll.dianStatus)}`}>
                      {getStatusText(payroll.dianStatus)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Referencia:</span> {payroll.dianReference}
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">Respuesta:</span> {payroll.dianResponse}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Technical Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Información Técnica</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>Endpoint DIAN:</strong> https://vpfe.dian.gov.co/WcfDianCustomerServices.svc</p>
          <p>• <strong>Formato:</strong> XML UBL 2.1</p>
          <p>• <strong>Certificado:</strong> Requerido para autenticación</p>
          <p>• <strong>Horario de servicio:</strong> 24/7 con mantenimientos programados</p>
          <p>• <strong>Tiempo de respuesta:</strong> Típicamente 1-5 segundos</p>
        </div>
        </div>
      </div>
    </Layout>
  );
}