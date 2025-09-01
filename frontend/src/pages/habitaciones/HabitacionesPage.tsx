import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search } from 'lucide-react';
import { Button, Table, Modal, Loading, Input, Select } from '../../components/ui';
import type { Habitacion, Hotel } from '../../types';
import { habitacionService, hotelService } from '../../services';
import HabitacionForm from './HabitacionForm';

interface FilterState {
  hotel_id?: number;
  tipo_habitacion?: string;
  acomodacion?: string;
  disponible?: boolean;
  search?: string;
}

const HabitacionesPage: React.FC = () => {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [habitacionToDelete, setHabitacionToDelete] = useState<Habitacion | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitacionesResponse, hotelesResponse] = await Promise.all([
        habitacionService.getAll(),
        hotelService.getAll()
      ]);
      setHabitaciones(habitacionesResponse);
      setHoteles(hotelesResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadHabitaciones = async () => {
    try {
      setLoading(true);
      const response = await habitacionService.getAll(filters);
      setHabitaciones(response);
    } catch (error) {
      console.error('Error loading habitaciones:', error);
      alert('Error al cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHabitacion(null);
    setModalOpen(true);
  };

  const handleEdit = (habitacion: Habitacion) => {
    setEditingHabitacion(habitacion);
    setModalOpen(true);
  };

  const handleDelete = (habitacion: Habitacion) => {
    setHabitacionToDelete(habitacion);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!habitacionToDelete) return;

    try {
      setFormLoading(true);
      await habitacionService.delete(habitacionToDelete.id);
      await loadHabitaciones();
      setDeleteConfirmOpen(false);
      setHabitacionToDelete(null);
      alert('Habitación eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting habitacion:', error);
      alert('Error al eliminar la habitación');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (habitacionData: Omit<Habitacion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      
      if (editingHabitacion) {
        await habitacionService.update(editingHabitacion.id, habitacionData);
        alert('Habitación actualizada exitosamente');
      } else {
        await habitacionService.create(habitacionData);
        alert('Habitación creada exitosamente');
      }
      
      await loadHabitaciones();
      setModalOpen(false);
      setEditingHabitacion(null);
    } catch (error) {
      console.error('Error saving habitacion:', error);
      alert('Error al guardar la habitación');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingHabitacion(null);
  };

  const handleFilterChange = (field: string, value: string | boolean) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === 'all') {
      delete newFilters[field as keyof FilterState];
    } else {
      (newFilters as any)[field] = field === 'hotel_id' ? parseInt(value as string) : value;
    }
    
    setFilters(newFilters);
  };

  const applyFilters = () => {
    loadHabitaciones();
  };

  const clearFilters = () => {
    setFilters({});
    loadData();
  };

  const getHotelName = (hotelId: number) => {
    const hotel = hoteles.find(h => h.id === hotelId);
    return hotel ? hotel.nombre : 'Hotel no encontrado';
  };

  const columns = [
    {
      key: 'numero_habitacion',
      header: 'N° Habitación'
    },
    {
      key: 'hotel_id',
      header: 'Hotel',
      render: (value: number) => getHotelName(value)
    },
    {
      key: 'tipo_habitacion',
      header: 'Tipo',
      render: (value: string) => {
        const tipos = {
          'ESTANDAR': 'Estándar',
          'JUNIOR': 'Junior Suite',
          'SUITE': 'Suite'
        };
        return tipos[value as keyof typeof tipos] || value;
      }
    },
    {
      key: 'acomodacion',
      header: 'Acomodación',
      render: (value: string) => {
        const acomodaciones = {
          'SENCILLA': 'Sencilla',
          'DOBLE': 'Doble',
          'TRIPLE': 'Triple'
        };
        return acomodaciones[value as keyof typeof acomodaciones] || value;
      }
    },
    {
      key: 'capacidad',
      header: 'Capacidad'
    },
    {
      key: 'disponible',
      header: 'Estado',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
          {value ? 'Disponible' : 'No disponible'}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (value: any, habitacion: Habitacion) => (
        <div className="d-flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEdit(habitacion)}
            title="Editar habitación"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => handleDelete(habitacion)}
            title="Eliminar habitación"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading text="Cargando habitaciones..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Habitaciones</h1>
          <p className="text-muted mb-0">Gestiona las habitaciones de los hoteles</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 me-2" />
            Filtros
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 me-2" />
            Nueva Habitación
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <Input
                label="Buscar"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Número de habitación..."
              />
            </div>
            
            <div className="col-md-3">
              <Select
                label="Hotel"
                value={filters.hotel_id?.toString() || 'all'}
                onChange={(e) => handleFilterChange('hotel_id', e.target.value)}
                options={[
                  { value: 'all', label: 'Todos los hoteles' },
                  ...hoteles.map(hotel => ({
                    value: hotel.id.toString(),
                    label: hotel.nombre
                  }))
                ]}
              />
            </div>
            
            <div className="col-md-3">
              <Select
                label="Tipo"
                value={filters.tipo_habitacion || 'all'}
                onChange={(e) => handleFilterChange('tipo_habitacion', e.target.value)}
                options={[
                  { value: 'all', label: 'Todos los tipos' },
                  { value: 'ESTANDAR', label: 'Estándar' },
                  { value: 'JUNIOR', label: 'Junior Suite' },
                  { value: 'SUITE', label: 'Suite' }
                ]}
              />
            </div>
            
            <div className="col-md-3">
              <Select
                label="Estado"
                value={filters.disponible?.toString() || 'all'}
                onChange={(e) => handleFilterChange('disponible', e.target.value === 'true')}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'true', label: 'Disponible' },
                  { value: 'false', label: 'No disponible' }
                ]}
              />
            </div>
          </div>
          
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button onClick={applyFilters}>
              <Search className="h-4 w-4 me-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow">
        <Table 
          columns={columns}
          data={habitaciones}
          emptyMessage="No hay habitaciones registradas"
        />
      </div>

      {/* Modal para crear/editar habitación */}
      <Modal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingHabitacion ? 'Editar Habitación' : 'Nueva Habitación'}
        size="lg"
      >
        <HabitacionForm
          habitacion={editingHabitacion || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="d-flex flex-column gap-3">
          <p className="text-muted mb-0">
            ¿Estás seguro de que deseas eliminar la habitación <strong>{habitacionToDelete?.numero_habitacion}</strong>?
          </p>
          <p className="small text-danger mb-0">
            Esta acción no se puede deshacer.
          </p>
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={formLoading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HabitacionesPage;