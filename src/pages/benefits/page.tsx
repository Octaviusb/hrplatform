import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import AppLayout from '../_components/app-layout';

interface Benefit {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  eligibility: string;
  createdAt: string;
}

const BenefitsPage: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'monetary',
    value: 0,
    eligibility: 'all'
  });

  useEffect(() => {
    loadBenefits();
  }, []);

  const loadBenefits = async () => {
    try {
      const data = await api.getBenefits();
      setBenefits(data || []);
    } catch (error) {
      console.error('Error loading benefits:', error);
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateBenefit(editingId, formData);
      } else {
        await api.createBenefit(formData);
      }
      setFormData({ name: '', description: '', type: 'monetary', value: 0, eligibility: 'all' });
      setShowForm(false);
      setEditingId(null);
      loadBenefits();
    } catch (error) {
      console.error('Error saving benefit:', error);
      alert('Error al guardar el beneficio. Verifica que el servidor esté funcionando.');
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setFormData({
      name: benefit.name,
      description: benefit.description,
      type: benefit.type,
      value: benefit.value,
      eligibility: benefit.eligibility
    });
    setEditingId(benefit.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este beneficio?')) {
      try {
        await api.deleteBenefit(id);
        loadBenefits();
      } catch (error) {
        console.error('Error deleting benefit:', error);
        alert('Error al eliminar el beneficio. Verifica que el servidor esté funcionando.');
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
          <h1 className="text-2xl sm:text-3xl font-bold">Beneficios</h1>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <span className="sm:hidden">+ Beneficio</span>
            <span className="hidden sm:inline">Agregar Beneficio</span>
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar' : 'Nuevo'} Beneficio</CardTitle>
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="monetary">Monetario</option>
                      <option value="time">Tiempo</option>
                      <option value="service">Servicio</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eligibility">Elegibilidad</Label>
                    <select
                      id="eligibility"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({...formData, eligibility: e.target.value})}
                      className="w-full p-2 border rounded"
                    >
                      <option value="all">Todos</option>
                      <option value="senior">Senior</option>
                      <option value="management">Gerencia</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Guardar</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', type: 'monetary', value: 0, eligibility: 'all' });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {benefits.map((benefit) => (
            <Card key={benefit.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{benefit.name}</h3>
                    <p className="text-gray-600 mt-1">{benefit.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{benefit.type}</Badge>
                      <Badge variant="secondary">${benefit.value}</Badge>
                      <Badge>{benefit.eligibility}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(benefit)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(benefit.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {benefits.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No hay beneficios registrados</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BenefitsPage;