import api from './api';
import type { Habitacion, ApiResponse } from '../types';

export const habitacionService = {
  // Obtener todas las habitaciones
  getAll: async (filters?: {
    hotel_id?: number;
    tipo_habitacion?: string;
    disponible?: boolean;
  }): Promise<Habitacion[]> => {
    const params = new URLSearchParams();
    if (filters?.hotel_id) params.append('hotel_id', filters.hotel_id.toString());
    if (filters?.tipo_habitacion) params.append('tipo_habitacion', filters.tipo_habitacion);
    if (filters?.disponible !== undefined) params.append('disponible', filters.disponible.toString());
    
    const response = await api.get<ApiResponse<Habitacion[]>>(`/habitaciones?${params}`);
    return response.data.data;
  },

  // Obtener una habitación por ID
  getById: async (id: number): Promise<Habitacion> => {
    const response = await api.get<ApiResponse<Habitacion>>(`/habitaciones/${id}`);
    return response.data.data;
  },

  // Crear una nueva habitación
  create: async (habitacion: Omit<Habitacion, 'id' | 'created_at' | 'updated_at'>): Promise<Habitacion> => {
    const response = await api.post<ApiResponse<Habitacion>>('/habitaciones', habitacion);
    return response.data.data;
  },

  // Actualizar una habitación
  update: async (id: number, habitacion: Partial<Habitacion>): Promise<Habitacion> => {
    const response = await api.put<ApiResponse<Habitacion>>(`/habitaciones/${id}`, habitacion);
    return response.data.data;
  },

  // Eliminar una habitación
  delete: async (id: number): Promise<void> => {
    await api.delete(`/habitaciones/${id}`);
  },
};