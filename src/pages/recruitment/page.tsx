import { useState } from 'react';
import Layout from '../../components/Layout';

export default function RecruitmentPage() {
  const [jobPostings, setJobPostings] = useState([
    {
      id: '1',
      title: 'Desarrollador Full Stack Senior',
      department: 'Desarrollo',
      status: 'published',
      applicants: 12,
      publishedDate: '2024-10-15'
    },
    {
      id: '2',
      title: 'Especialista en Marketing Digital',
      department: 'Marketing',
      status: 'draft',
      applicants: 0,
      publishedDate: null
    }
  ]);

  const [candidates] = useState([
    {
      id: '1',
      name: 'Laura Martínez',
      position: 'Desarrollador Full Stack Senior',
      status: 'interview',
      appliedDate: '2024-10-20',
      email: 'laura.martinez@email.com'
    },
    {
      id: '2',
      name: 'Diego Hernández',
      position: 'Desarrollador Full Stack Senior',
      status: 'screening',
      appliedDate: '2024-10-18',
      email: 'diego.hernandez@email.com'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'closed': return 'bg-red-100 text-red-700';
      case 'interview': return 'bg-blue-100 text-blue-700';
      case 'screening': return 'bg-yellow-100 text-yellow-700';
      case 'hired': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      published: 'Publicada',
      draft: 'Borrador',
      closed: 'Cerrada',
      interview: 'Entrevista',
      screening: 'Evaluación',
      hired: 'Contratado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    status: 'draft'
  });

  const createPosting = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const newItem = {
      id: Math.random().toString(36).slice(2),
      title: formData.title,
      department: formData.department,
      status: formData.status,
      applicants: 0,
      publishedDate: formData.status === 'published' ? now.toISOString().slice(0,10) : null,
    };
    setJobPostings([newItem, ...jobPostings]);
    setShowForm(false);
    setFormData({ title: '', department: '', status: 'draft' });
  };

  return (
    <Layout title="Reclutamiento" subtitle="Atracción y selección de talento para la organización">
      <div className="space-y-6">
        {/* Job Postings Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ofertas de Trabajo</h3>
              <p className="text-sm text-gray-500">Gestiona las vacantes publicadas</p>
            </div>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Oferta
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-md font-semibold mb-4">Nueva Oferta</h4>
              <form onSubmit={createPosting} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Título</label>
                  <input className="w-full border rounded px-3 py-2" value={formData.title} onChange={(e)=>setFormData({...formData,title:e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Departamento</label>
                  <input className="w-full border rounded px-3 py-2" value={formData.department} onChange={(e)=>setFormData({...formData,department:e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Estado</label>
                  <select className="w-full border rounded px-3 py-2" value={formData.status} onChange={(e)=>setFormData({...formData,status:e.target.value})}>
                    <option value="draft">Borrador</option>
                    <option value="published">Publicada</option>
                    <option value="closed">Cerrada</option>
                  </select>
                </div>
                <div>
                  <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Crear</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
            <div className="divide-y divide-gray-200">
              {jobPostings.map((job) => (
                <div key={job.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>🏢 {job.department}</span>
                        <span>👥 {job.applicants} candidatos</span>
                        {job.publishedDate && <span>📅 {new Date(job.publishedDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                      <button className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver Candidatos
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Candidatos Activos</h3>
              <p className="text-sm text-gray-500">Seguimiento del proceso de selección</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {candidates.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay candidatos activos</h3>
                <p className="text-gray-500">Los candidatos aparecerán aquí cuando se postulen</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-indigo-600">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                          <p className="text-xs text-gray-400">Aplicó: {new Date(candidate.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{candidate.position}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                            {getStatusLabel(candidate.status)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="inline-flex items-center text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Avanzar
                          </button>
                          <button className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Ver Perfil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}