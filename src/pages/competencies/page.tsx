import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import AppLayout from '../_components/app-layout';

interface Competency {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  createdAt: string;
}

const CompetenciesPage: React.FC = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technical',
    level: 'basic'
  });

  useEffect(() => {
    loadCompetencies();
  }, []);

  const loadCompetencies = async () => {
    try {
      const data = await api.getCompetencies();
      setCompetencies(data || []);
    } catch (error) {
      console.error('Error loading competencies:', error);
      setCompetencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCompetency(editingId, formData);
      } else {
        await api.createCompetency(formData);
      }
      setFormData({ name: '', description: '', category: 'technical', level: 'basic' });
      setShowForm(false);
      setEditingId(null);
      loadCompetencies();
    } catch (error) {
      console.error('Error saving competency:', error);
      alert('Error al guardar la competencia. Verifica que el servidor esté funcionando.');
    }
  };

  const handleEdit = (competency: Competency) => {
    setFormData({
      name: competency.name,
      description: competency.description,
      category: competency.category,
      level: competency.level
    });
    setEditingId(competency.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta competencia?')) {
      try {
        await api.deleteCompetency(id);
        loadCompetencies();
      } catch (error) {
        console.error('Error deleting competency:', error);
        alert('Error al eliminar la competencia. Verifica que el servidor esté funcionando.');
      }
    }
  };

  if (loading) {
    return <AppLayout><div className="p-8">Cargando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Competencias</h1>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <span className="sm:hidden">+ Competencia</span>
            <span className="hidden sm:inline">Agregar Competencia</span>
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar' : 'Nueva'} Competencia</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="technical">Técnica</option>
                      <option value="soft">Blanda</option>
                      <option value="leadership">Liderazgo</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="level">Nivel</Label>
                    <select
                      id="level"
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="basic">Básico</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="w-full sm:w-auto">Guardar</Button>
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', category: 'technical', level: 'basic' });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {competencies.map((competency) => (
            <Card key={competency.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{competency.name}</h3>
                    <p className="text-gray-600 mt-1">{competency.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{competency.category}</Badge>
                      <Badge variant="secondary">{competency.level}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(competency)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(competency.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {competencies.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No hay competencias registradas</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CompetenciesPage;