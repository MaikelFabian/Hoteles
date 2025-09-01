import React, { useState } from 'react';
import { Button, Input } from '../../components/ui';
import type { Hotel } from '../../types';

interface HotelFormProps {
  hotel?: Hotel;
  onSubmit: (hotelData: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({
  hotel,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: hotel?.nombre || '',
    direccion: hotel?.direccion || '',
    ciudad: hotel?.ciudad || '',
    nit: hotel?.nit || '',
    numero_habitaciones: hotel?.numero_habitaciones || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }

    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es requerido';
    } else if (!/^\d{9,15}$/.test(formData.nit)) {
      newErrors.nit = 'El NIT debe tener entre 9 y 15 dígitos';
    }

    if (formData.numero_habitaciones <= 0) {
      newErrors.numero_habitaciones = 'El número de habitaciones debe ser mayor a 0';
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

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
      <div className="row g-3">
        <div className="col-md-6">
          <Input
            label="Nombre del Hotel"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            error={errors.nombre}
            placeholder="Ej: Hotel Plaza"
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="NIT"
            value={formData.nit}
            onChange={(e) => handleChange('nit', e.target.value)}
            error={errors.nit}
            placeholder="Ej: 900123456"
            required
          />
        </div>
      </div>

      <Input
        label="Dirección"
        value={formData.direccion}
        onChange={(e) => handleChange('direccion', e.target.value)}
        error={errors.direccion}
        placeholder="Ej: Calle 123 #45-67"
        required
      />

      <div className="row g-3">
        <div className="col-md-6">
          <Input
            label="Ciudad"
            value={formData.ciudad}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            error={errors.ciudad}
            placeholder="Ej: Bogotá"
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Número de Habitaciones"
            type="number"
            value={formData.numero_habitaciones.toString()}
            onChange={(e) => handleChange('numero_habitaciones', parseInt(e.target.value) || 0)}
            error={errors.numero_habitaciones}
            placeholder="Ej: 50"
            min="1"
            required
          />
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
          {hotel ? 'Actualizar' : 'Crear'} Hotel
        </Button>
      </div>
    </form>
  );
};

export default HotelForm;