import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button, Table, Modal, Loading } from '../../components/ui';
import type { Hotel } from '../../types';
import { hotelService } from '../../services';
import HotelForm from './HotelForm';

const HotelesPage: React.FC = () => {
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<Hotel | null>(null);

  useEffect(() => {
    loadHoteles();
  }, []);

  const loadHoteles = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getAll();
      setHoteles(response);
    } catch (error) {
      console.error('Error loading hoteles:', error);
      alert('Error al cargar los hoteles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHotel(null);
    setModalOpen(true);
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setModalOpen(true);
  };

  const handleDelete = (hotel: Hotel) => {
    setHotelToDelete(hotel);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;

    try {
      setFormLoading(true);
      await hotelService.delete(hotelToDelete.id);
      await loadHoteles();
      setDeleteConfirmOpen(false);
      setHotelToDelete(null);
      alert('Hotel eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Error al eliminar el hotel');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (hotelData: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      
      if (editingHotel) {
        await hotelService.update(editingHotel.id, hotelData);
        alert('Hotel actualizado exitosamente');
      } else {
        await hotelService.create(hotelData);
        alert('Hotel creado exitosamente');
      }
      
      await loadHoteles();
      setModalOpen(false);
      setEditingHotel(null);
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('Error al guardar el hotel');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingHotel(null);
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre'
    },
    {
      key: 'direccion',
      header: 'Dirección'
    },
    {
      key: 'ciudad',
      header: 'Ciudad'
    },
    {
      key: 'nit',
      header: 'NIT'
    },
    {
      key: 'numero_habitaciones',
      header: 'N° Habitaciones'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (value: any, hotel: Hotel) => (
        <div className="d-flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEdit(hotel)}
            title="Editar hotel"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => handleDelete(hotel)}
            title="Eliminar hotel"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading text="Cargando hoteles..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Hoteles</h1>
          <p className="text-muted mb-0">Gestiona los hoteles del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 me-2" />
          Nuevo Hotel
        </Button>
      </div>

      <div className="bg-white rounded shadow">
        <Table 
          columns={columns}
          data={hoteles}
          emptyMessage="No hay hoteles registrados"
        />
      </div>

      {/* Modal para crear/editar hotel */}
      <Modal 
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingHotel ? 'Editar Hotel' : 'Nuevo Hotel'}
        size="lg"
      >
        <HotelForm
          hotel={editingHotel || undefined}
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
            ¿Estás seguro de que deseas eliminar el hotel <strong>{hotelToDelete?.nombre}</strong>?
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

export default HotelesPage;