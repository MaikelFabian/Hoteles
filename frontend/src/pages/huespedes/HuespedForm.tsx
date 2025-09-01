import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../../components/ui';
import type { Huesped } from '../../types';

interface HuespedFormProps {
  huesped?: Huesped;
  onSubmit: (huespedData: Omit<Huesped, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const HuespedForm: React.FC<HuespedFormProps> = ({
  huesped,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'CC' as 'CC' | 'CE' | 'TI' | 'PP' | 'NIT',
    documento: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: 'M' as 'M' | 'F' | 'O',
    nacionalidad: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (huesped) {
      // Convertir fecha de formato ISO a yyyy-MM-dd para el input date
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        // Extraer solo la parte de la fecha (yyyy-MM-dd) del formato ISO
        return dateString.split('T')[0];
      };

      setFormData({
        nombre: huesped.nombre,
        apellido: huesped.apellido,
        tipo_documento: huesped.tipo_documento,
        documento: huesped.documento,
        telefono: huesped.telefono || '',
        fecha_nacimiento: formatDateForInput(huesped.fecha_nacimiento || ''),
        genero: huesped.genero || 'M',
        nacionalidad: huesped.nacionalidad || ''
      });
    }
  }, [huesped]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    } else if (formData.documento.length < 6) {
      newErrors.documento = 'El documento debe tener al menos 6 caracteres';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono solo puede contener números, espacios y símbolos +, -, ()';
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }

    if (!formData.nacionalidad.trim()) {
      newErrors.nacionalidad = 'La nacionalidad es requerida';
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' }
  ];

  const generos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body p-4">
              <h2 className="card-title h3 fw-bold text-dark mb-4">
                {huesped ? 'Editar Huésped' : 'Nuevo Huésped'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <Input
                      label="Nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      error={errors.nombre}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Apellido"
                      value={formData.apellido}
                      onChange={(e) => handleChange('apellido', e.target.value)}
                      error={errors.apellido}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <Select
                      label="Tipo de Documento"
                      value={formData.tipo_documento}
                      onChange={(e) => handleChange('tipo_documento', e.target.value)}
                      options={tiposDocumento}
                      error={errors.tipo_documento}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <Input
                      label="Documento"
                      value={formData.documento}
                      onChange={(e) => handleChange('documento', e.target.value)}
                      error={errors.documento}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <Input
                      label="Teléfono"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      error={errors.telefono}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <Input
                      label="Fecha de Nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                      error={errors.fecha_nacimiento}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Select
                      label="Género"
                      value={formData.genero}
                      onChange={(e) => handleChange('genero', e.target.value)}
                      options={generos}
                      error={errors.genero}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <Input
                      label="Nacionalidad"
                      value={formData.nacionalidad}
                      onChange={(e) => handleChange('nacionalidad', e.target.value)}
                      error={errors.nacionalidad}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-3">
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
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : (huesped ? 'Actualizar' : 'Crear')}
                  
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuespedForm;