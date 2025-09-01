import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../../components/ui';
import type { Habitacion, Hotel } from '../../types';
import { hotelService } from '../../services';

interface HabitacionFormProps {
  habitacion?: Habitacion;
  onSubmit: (habitacionData: Omit<Habitacion, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const HabitacionForm: React.FC<HabitacionFormProps> = ({
  habitacion,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    hotel_id: habitacion?.hotel_id || 0,
    tipo_habitacion: habitacion?.tipo_habitacion || 'ESTANDAR' as const,
    acomodacion: habitacion?.acomodacion || 'SENCILLA' as const,
    capacidad: habitacion?.capacidad || 1,
    numero_habitacion: habitacion?.numero_habitacion || '',
    disponible: habitacion?.disponible ?? true
  });

  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingHoteles, setLoadingHoteles] = useState(true);

  useEffect(() => {
    loadHoteles();
  }, []);

  const loadHoteles = async () => {
    try {
      setLoadingHoteles(true);
      const hotelesData = await hotelService.getAll();
      setHoteles(hotelesData);
    } catch (error) {
      console.error('Error loading hoteles:', error);
      setHoteles([]);
    } finally {
      setLoadingHoteles(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hotel_id || formData.hotel_id === 0) {
      newErrors.hotel_id = 'Debe seleccionar un hotel';
    }

    if (!formData.numero_habitacion.trim()) {
      newErrors.numero_habitacion = 'El número de habitación es requerido';
    }

    if (formData.capacidad <= 0) {
      newErrors.capacidad = 'La capacidad debe ser mayor a 0';
    }

    const maxCapacidad = {
      'SENCILLA': 1,
      'DOBLE': 2,
      'TRIPLE': 3,
      'CUADRUPLE': 4
    };

    if (formData.capacidad > maxCapacidad[formData.acomodacion]) {
      newErrors.capacidad = `La capacidad máxima para ${formData.acomodacion.toLowerCase()} es ${maxCapacidad[formData.acomodacion]}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field === 'acomodacion') {
      const maxCapacidad = {
        'SENCILLA': 1,
        'DOBLE': 2,
        'TRIPLE': 3,
        'CUADRUPLE': 4
      };
      const newCapacidad = maxCapacidad[value as keyof typeof maxCapacidad];
      setFormData(prev => ({ 
        ...prev, 
        acomodacion: value as 'SENCILLA' | 'DOBLE' | 'TRIPLE',
        capacidad: newCapacidad 
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const tiposHabitacion = [
    { value: 'ESTANDAR', label: 'Estándar' },
    { value: 'JUNIOR', label: 'Junior Suite' },
    { value: 'SUITE', label: 'Suite' }
  ];

  const tiposAcomodacion = [
    { value: 'SENCILLA', label: 'Sencilla (1 persona)' },
    { value: 'DOBLE', label: 'Doble (2 personas)' },
    { value: 'TRIPLE', label: 'Triple (3 personas)' },
    { value: 'CUADRUPLE', label: 'Cuadruple (4 personas)' }
  ];

  const hotelesOptions = hoteles.map(hotel => ({
    value: hotel.id.toString(),
    label: hotel.nombre
  }));

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="row g-3">
        <div className="col-md-6">
          <Select
            label="Hotel"
            value={formData.hotel_id.toString()}
            onChange={(e) => handleChange('hotel_id', parseInt(e.target.value))}
            options={[
              { value: '0', label: 'Seleccionar hotel...' },
              ...hotelesOptions
            ]}
            error={errors.hotel_id}
            disabled={loadingHoteles}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Número de Habitación"
            value={formData.numero_habitacion}
            onChange={(e) => handleChange('numero_habitacion', e.target.value)}
            error={errors.numero_habitacion}
            placeholder="Ej: 101, A-205"
            required
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <Select
            label="Tipo de Habitación"
            value={formData.tipo_habitacion}
            onChange={(e) => handleChange('tipo_habitacion', e.target.value)}
            options={tiposHabitacion}
            required
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Acomodación"
            value={formData.acomodacion}
            onChange={(e) => handleChange('acomodacion', e.target.value)}
            options={tiposAcomodacion}
            required
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <Input
            label="Capacidad"
            type="number"
            value={formData.capacidad.toString()}
            onChange={(e) => handleChange('capacidad', parseInt(e.target.value) || 1)}
            error={errors.capacidad}
            min="1"
            max="3"
            required
            readOnly
            helperText="Se ajusta automáticamente según la acomodación"
          />
        </div>

        <div className="col-md-6 d-flex align-items-center">
          <div className="form-check">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => handleChange('disponible', e.target.checked)}
              className="form-check-input"
            />
            <label htmlFor="disponible" className="form-check-label">
              Habitación disponible
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {habitacion ? 'Actualizar' : 'Crear'} Habitación
        </Button>
      </div>
    </form>
  );
};

export default HabitacionForm;