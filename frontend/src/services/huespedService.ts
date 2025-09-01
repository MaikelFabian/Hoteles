import api from './api';
import type { Huesped } from '../types';

export const huespedService = {
  // Obtener todos los huéspedes
  getAll: async (): Promise<Huesped[]> => {
    const response = await api.get('/huespedes');
    // La API devuelve datos paginados, extraemos el array de huéspedes
    return response.data.data || [];
  },

  // Obtener un huésped por ID
  getById: async (id: number): Promise<Huesped> => {
    const response = await api.get(`/huespedes/${id}`);
    return response.data.data;
  },

  // Buscar huésped por documento
  getByDocumento: async (documento: string): Promise<Huesped | null> => {
    try {
      const response = await api.get(`/huespedes/documento/${documento}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  // Crear un nuevo huésped
  create: async (huesped: Omit<Huesped, 'id' | 'created_at' | 'updated_at'>): Promise<Huesped> => {
    const response = await api.post('/huespedes', huesped);
    return response.data.data;
  },

  // Actualizar un huésped
  update: async (id: number, huesped: Partial<Huesped>): Promise<Huesped> => {
    const response = await api.put(`/huespedes/${id}`, huesped);
    return response.data.data;
  },

  // Eliminar un huésped
  delete: async (id: number): Promise<void> => {
    await api.delete(`/huespedes/${id}`);
  },
};