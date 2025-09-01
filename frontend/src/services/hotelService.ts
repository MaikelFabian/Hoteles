import api from './api';
import type { Hotel, ApiResponse } from '../types';

export const hotelService = {
  // Obtener todos los hoteles
  getAll: async (): Promise<Hotel[]> => {
    const response = await api.get<ApiResponse<Hotel[]>>('/hoteles');
    return response.data.data;
  },

  // Obtener un hotel por ID
  getById: async (id: number): Promise<Hotel> => {
    const response = await api.get<ApiResponse<Hotel>>(`/hoteles/${id}`);
    return response.data.data;
  },

  // Crear un nuevo hotel
  create: async (hotel: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>): Promise<Hotel> => {
    const response = await api.post<ApiResponse<Hotel>>('/hoteles', hotel);
    return response.data.data;
  },

  // Actualizar un hotel
  update: async (id: number, hotel: Partial<Hotel>): Promise<Hotel> => {
    const response = await api.put<ApiResponse<Hotel>>(`/hoteles/${id}`, hotel);
    return response.data.data;
  },

  // Eliminar un hotel
  delete: async (id: number): Promise<void> => {
    await api.delete(`/hoteles/${id}`);
  },
};