import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui';
import ReservaForm from './ReservaForm';
import type { Reserva } from '../../types';
import { reservaService } from '../../services';
import { Edit, Trash2 } from 'lucide-react';

const ReservasPage: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservaService.getAll();
      console.log('Reservas cargadas:', data); // Para debug
      setReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar las reservas');
      console.error('Error loading reservas:', err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingReserva(undefined);
    setShowForm(true);
  };

  const handleEdit = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        await reservaService.delete(id);
        await loadReservas();
      } catch (err) {
        setError('Error al eliminar la reserva');
        console.error('Error deleting reserva:', err);
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await reservaService.updateStatus(id, newStatus);
      await loadReservas();
    } catch (err) {
      setError('Error al actualizar el estado de la reserva');
      console.error('Error updating status:', err);
    }
  };

  const handleFormSubmit = async (reservaData: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      if (editingReserva) {
        await reservaService.update(editingReserva.id, reservaData);
      } else {
        await reservaService.create(reservaData);
      }
      await loadReservas();
      setShowForm(false);
      setEditingReserva(undefined);
    } catch (err) {
      setError(editingReserva ? 'Error al actualizar la reserva' : 'Error al crear la reserva');
      console.error('Error submitting form:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReserva(undefined);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning';
      case 'CONFIRMADA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      
      default: return 'bg-secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  // Función para calcular ingresos totales de forma segura
  const calcularIngresosTotales = () => {
    return reservas.reduce((sum, r) => {
      const precio = typeof r.precio_total === 'number' ? r.precio_total : parseFloat(r.precio_total) || 0;
      return sum + precio;
    }, 0);
  };

  if (showForm) {
    return (
      <ReservaForm
        reserva={editingReserva}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
      />
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-dark">Gestión de Reservas</h1>
        <Button onClick={handleCreate}>
          Nueva Reserva
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Cargando reservas...</span>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Huésped</th>
                  <th>Hotel / Habitación</th>
                  <th>Fechas</th>
                  <th>Huéspedes</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-muted">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>{reserva.huesped_principal?.nombre} {reserva.huesped_principal?.apellido}</td>
                      <td>{reserva.hotel?.nombre} / Hab. {reserva.habitacion?.numero_habitacion}</td>
                      <td>{formatDate(reserva.fecha_entrada)} - {formatDate(reserva.fecha_salida)}</td>
                      <td>{reserva.numero_huespedes}</td>
                      <td>{formatCurrency(reserva.precio_total)}</td>
                      <td>
                        <select
                          value={reserva.estado}
                          onChange={(e) => handleStatusChange(reserva.id, e.target.value)}
                          className={`form-select form-select-sm ${getEstadoBadgeColor(reserva.estado)}`}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="CONFIRMADA">Confirmada</option>
                          <option value="CANCELADA">Cancelada</option>
                         
                        </select>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(reserva)}
                            title="Editar reserva"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleDelete(reserva.id)}
                            title="Eliminar reserva"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="row g-3 mt-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h4 fw-bold text-primary">{reservas.length}</div>
              <div className="text-muted small">Total Reservas</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h4 fw-bold text-success">
                {reservas.filter(r => r.estado === 'CONFIRMADA').length}
              </div>
              <div className="text-muted small">Confirmadas</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h4 fw-bold text-warning">
                {reservas.filter(r => r.estado === 'PENDIENTE').length}
              </div>
              <div className="text-muted small">Pendientes</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="h4 fw-bold text-info">
                {formatCurrency(calcularIngresosTotales())}
              </div>
              <div className="text-muted small">Ingresos Totales</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservasPage;
