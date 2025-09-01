import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../../components/ui';
import type { Reserva, Hotel, Habitacion, Huesped } from '../../types';
import { hotelService, habitacionService, huespedService, reservaService } from '../../services';

interface ReservaFormProps {
  reserva?: Reserva;
  onSubmit: (reserva: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ReservaForm: React.FC<ReservaFormProps> = ({ reserva, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    hotel_id: reserva?.hotel_id || 0,
    habitacion_id: reserva?.habitacion_id || 0,
    huesped_id: reserva?.huesped_id || 0,
    fecha_entrada: reserva?.fecha_entrada || '',
    fecha_salida: reserva?.fecha_salida || '',
    numero_huespedes: reserva?.numero_huespedes || 1,
    estado: reserva?.estado || 'PENDIENTE' as const,
    precio_total: reserva?.precio_total || 0,
    observaciones: reserva?.observaciones || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Agregar useEffect para formatear fechas cuando se edita una reserva
  useEffect(() => {
    if (reserva) {
      // Convertir fecha de formato ISO a yyyy-MM-dd para el input date
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        // Extraer solo la parte de la fecha (yyyy-MM-dd) del formato ISO
        return dateString.split('T')[0];
      };

      setFormData({
        hotel_id: reserva.hotel_id,
        habitacion_id: reserva.habitacion_id,
        huesped_id: reserva.huesped_id,
        fecha_entrada: formatDateForInput(reserva.fecha_entrada),
        fecha_salida: formatDateForInput(reserva.fecha_salida),
        numero_huespedes: reserva.numero_huespedes,
        estado: reserva.estado,
        precio_total: reserva.precio_total,
        observaciones: reserva.observaciones || ''
      });
    }
  }, [reserva?.id]); // Cambiar de [reserva] a [reserva?.id]

  useEffect(() => {
    if (formData.hotel_id) {
      loadHabitaciones(formData.hotel_id);
    } else {
      setHabitaciones([]);
      setFormData(prev => ({ ...prev, habitacion_id: 0 }));
    }
  }, [formData.hotel_id]);

  useEffect(() => {
    if (formData.habitacion_id && formData.fecha_entrada && formData.fecha_salida) {
      checkAvailability();
    } else {
      setIsAvailable(null);
    }
  }, [formData.habitacion_id, formData.fecha_entrada, formData.fecha_salida]);

  const loadInitialData = async () => {
    try {
      const [hotelesData, huespedesData] = await Promise.all([
        hotelService.getAll(),
        huespedService.getAll()
      ]);
      setHoteles(Array.isArray(hotelesData) ? hotelesData : []);
      setHuespedes(Array.isArray(huespedesData) ? huespedesData : []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setHoteles([]);
      setHuespedes([]);
    }
  };

  const loadHabitaciones = async (hotelId: number) => {
    try {
      const habitacionesData = await habitacionService.getAll({ hotel_id: hotelId, disponible: true });
      setHabitaciones(habitacionesData);
    } catch (error) {
      console.error('Error loading habitaciones:', error);
      setHabitaciones([]);
    }
  };

  const checkAvailability = async () => {
    if (!formData.habitacion_id || !formData.fecha_entrada || !formData.fecha_salida) return;
    
    setAvailabilityChecking(true);
    try {
      const available = await reservaService.checkAvailability(
        formData.habitacion_id,
        formData.fecha_entrada,
        formData.fecha_salida,
        reserva?.id // Pasar el ID de la reserva si estamos editando
      );
      setIsAvailable(available);
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hotel_id) newErrors.hotel_id = 'El hotel es requerido';
    if (!formData.habitacion_id) newErrors.habitacion_id = 'La habitación es requerida';
    if (!formData.huesped_id) newErrors.huesped_id = 'El huésped es requerido';
    if (!formData.fecha_entrada) newErrors.fecha_entrada = 'La fecha de entrada es requerida';
    if (!formData.fecha_salida) newErrors.fecha_salida = 'La fecha de salida es requerida';
    if (formData.numero_huespedes < 1) newErrors.numero_huespedes = 'Debe haber al menos 1 huésped';
    if (formData.precio_total < 0) newErrors.precio_total = 'El precio no puede ser negativo';

    // Solo validar que la fecha de salida sea posterior a la fecha de entrada
    if (formData.fecha_entrada && formData.fecha_salida) {
      const entrada = new Date(formData.fecha_entrada);
      const salida = new Date(formData.fecha_salida);
      
      if (salida <= entrada) {
        newErrors.fecha_salida = 'La fecha de salida debe ser posterior a la fecha de entrada';
      }
    }

    // Comentar o quitar la validación de disponibilidad si quieres permitir cualquier fecha
    // if (isAvailable === false) {
    //   newErrors.habitacion_id = 'La habitación no está disponible para las fechas seleccionadas';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit({
        hotel_id: formData.hotel_id,
        habitacion_id: formData.habitacion_id,
        huesped_id: formData.huesped_id,
        fecha_entrada: formData.fecha_entrada,
        fecha_salida: formData.fecha_salida,
        numero_huespedes: formData.numero_huespedes,
        estado: formData.estado,
        precio_total: formData.precio_total,
        observaciones: formData.observaciones
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const estadoOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'CANCELADA', label: 'Cancelada' },
    
  ];

  const hotelOptions = hoteles.map(hotel => ({
    value: hotel.id.toString(),
    label: hotel.nombre
  }));

  const habitacionOptions = habitaciones.map(habitacion => ({
    value: habitacion.id.toString(),
    label: `${habitacion.numero_habitacion} - ${habitacion.tipo_habitacion} (${habitacion.acomodacion})`
  }));

  const huespedOptions = (Array.isArray(huespedes) ? huespedes : []).map(huesped => ({
    value: huesped.id.toString(),
    label: `${huesped.nombre} ${huesped.apellido} - ${huesped.documento}`
  }));

  return (
    <div className="container" style={{maxWidth: '768px'}}>
      <div className="card">
        <div className="card-body">
          <h2 className="h4 fw-bold text-dark mb-4">
            {reserva ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <Select
                  label="Hotel"
                  value={formData.hotel_id.toString()}
                  onChange={(e) => handleChange('hotel_id', parseInt(e.target.value))}
                  options={[{ value: '0', label: 'Seleccionar hotel' }, ...hotelOptions]}
                  error={errors.hotel_id}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Select
                  label="Habitación"
                  value={formData.habitacion_id.toString()}
                  onChange={(e) => handleChange('habitacion_id', parseInt(e.target.value))}
                  options={[{ value: '0', label: 'Seleccionar habitación' }, ...habitacionOptions]}
                  error={errors.habitacion_id}
                  required
                  disabled={!formData.hotel_id}
                />
              </div>

              <div className="col-12 col-md-6">
                <Select
                  label="Huésped Principal"
                  value={formData.huesped_id.toString()}
                  onChange={(e) => handleChange('huesped_id', parseInt(e.target.value))}
                  options={[{ value: '0', label: 'Seleccionar huésped' }, ...huespedOptions]}
                  error={errors.huesped_id}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  type="number"
                  label="Número de Huéspedes"
                  value={formData.numero_huespedes.toString()}
                  onChange={(e) => handleChange('numero_huespedes', parseInt(e.target.value) || 1)}
                  error={errors.numero_huespedes}
                  min="1"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  type="date"
                  label="Fecha de Entrada"
                  value={formData.fecha_entrada}
                  onChange={(e) => handleChange('fecha_entrada', e.target.value)}
                  error={errors.fecha_entrada}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  type="date"
                  label="Fecha de Salida"
                  value={formData.fecha_salida}
                  onChange={(e) => handleChange('fecha_salida', e.target.value)}
                  error={errors.fecha_salida}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  type="number"
                  label="Precio Total"
                  value={formData.precio_total.toString()}
                  onChange={(e) => handleChange('precio_total', parseFloat(e.target.value) || 0)}
                  error={errors.precio_total}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <Select
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value as 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA')}
                  options={estadoOptions}
                  error={errors.estado}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium text-dark">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                rows={3}
                className="form-control"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Indicador de disponibilidad */}
            {formData.habitacion_id && formData.fecha_entrada && formData.fecha_salida && (
              <div className="p-3 rounded mb-4">
                {availabilityChecking ? (
                  <div className="d-flex align-items-center text-primary">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Verificando disponibilidad...
                  </div>
                ) : isAvailable === true ? (
                  <div className="d-flex align-items-center text-success">
                    <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Habitación disponible
                  </div>
                ) : isAvailable === false ? (
                  <div className="d-flex align-items-center text-danger">
                    <svg className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Habitación no disponible para estas fechas
                  </div>
                ) : null}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || isAvailable === false}
              >
                {loading ? 'Guardando...' : reserva ? 'Actualizar' : 'Crear'} Reserva
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservaForm;