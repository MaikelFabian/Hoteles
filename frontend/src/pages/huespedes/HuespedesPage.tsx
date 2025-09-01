import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui';
import HuespedForm from './HuespedForm';
import type { Huesped } from '../../types';
import { huespedService } from '../../services';
import { Edit, Trash2 } from 'lucide-react';

const HuespedesPage: React.FC = () => {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHuesped, setEditingHuesped] = useState<Huesped | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadHuespedes();
  }, []);

  const loadHuespedes = async () => {
    try {
      setLoading(true);
      setError(null);
      const huespedes = await huespedService.getAll();
      console.log('Huéspedes cargados:', huespedes); // Para debug
      setHuespedes(Array.isArray(huespedes) ? huespedes : []);
    } catch (err) {
      setError('Error al cargar los huéspedes');
      console.error('Error loading huespedes:', err);
      setHuespedes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHuesped(undefined);
    setShowForm(true);
  };

  const handleEdit = (huesped: Huesped) => {
    setEditingHuesped(huesped);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este huésped?')) {
      try {
        await huespedService.delete(id);
        await loadHuespedes();
      } catch (err) {
        setError('Error al eliminar el huésped');
        console.error('Error deleting huesped:', err);
      }
    }
  };

  const handleFormSubmit = async (huespedData: Omit<Huesped, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      setError(null);
      
      if (editingHuesped) {
        await huespedService.update(editingHuesped.id, huespedData);
      } else {
        await huespedService.create(huespedData);
      }
      
      setShowForm(false);
      setEditingHuesped(undefined);
      await loadHuespedes();
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Error al guardar el huésped';
      
      if (errorData?.errors) {
        const errors = errorData.errors;
        const errorMessages = [];
        
        if (errors.documento) {
          errorMessages.push('El documento ya está registrado en el sistema');
        }
        if (errors.email) {
          errorMessages.push('El email ya está registrado en el sistema');
        }
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('. ');
        }
      } else if (errorData?.message) {
        if (errorData.message.includes('documento has already been taken')) {
          errorMessage = 'Ya existe un huésped registrado con este número de documento. Por favor, verifica el número o busca el huésped existente.';
        } else {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
      console.error('Error saving huesped:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHuesped(undefined);
  };

  if (showForm) {
    return (
      <HuespedForm
        huesped={editingHuesped}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
      />
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Gestión de Huéspedes</h1>
        <Button onClick={handleCreate}>
          Nuevo Huésped
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Cargando huéspedes...</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="fw-semibold text-muted text-uppercase small">
                    Nombre Completo
                  </th>
                  <th scope="col" className="fw-semibold text-muted text-uppercase small">
                    Documento
                  </th>
                  {/* Eliminamos la columna Email */}
                  <th scope="col" className="fw-semibold text-muted text-uppercase small">
                    Teléfono
                  </th>
                  <th scope="col" className="fw-semibold text-muted text-uppercase small">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {huespedes.map((huesped) => (
                  <tr key={huesped.id}>
                    <td>
                      <div className="fw-medium text-dark">
                        {huesped.nombre} {huesped.apellido}
                      </div>
                    </td>
                    <td className="text-dark">
                      {huesped.tipo_documento}: {huesped.documento}
                    </td>
                    {/* Eliminamos la celda del email */}
                    <td className="text-dark">
                      {huesped.telefono || '-'}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(huesped)}
                          title="Editar huésped"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleDelete(huesped.id)}
                          title="Eliminar huésped"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {huespedes.length === 0 && (
              <div className="text-center py-5 text-muted">
                No se encontraron huéspedes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HuespedesPage;