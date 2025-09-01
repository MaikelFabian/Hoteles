import api from './api';
import type { Reserva, ApiResponse, PaginatedResponse } from '../types';

export const reservaService = {
  // Obtener todas las reservas con filtros
  getAll: async (filters?: {
    hotel_id?: number;
    huesped_id?: number;
    estado?: string;
    fecha_entrada?: string;
    fecha_salida?: string;
  }): Promise<Reserva[]> => {
    const params = new URLSearchParams();
    if (filters?.hotel_id) params.append('hotel_id', filters.hotel_id.toString());
    if (filters?.huesped_id) params.append('huesped_id', filters.huesped_id.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.fecha_entrada) params.append('fecha_entrada', filters.fecha_entrada);
    if (filters?.fecha_salida) params.append('fecha_salida', filters.fecha_salida);
    
    const response = await api.get<ApiResponse<Reserva[]>>(`/reservas?${params}`);
    return response.data.data;
  },

  // Obtener reservas paginadas
  getPaginated: async (page: number = 1, perPage: number = 10, filters?: {
    hotel_id?: number;
    huesped_id?: number;
    estado?: string;
  }): Promise<PaginatedResponse<Reserva>["data"]> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    if (filters?.hotel_id) params.append('hotel_id', filters.hotel_id.toString());
    if (filters?.huesped_id) params.append('huesped_id', filters.huesped_id.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    
    const response = await api.get<PaginatedResponse<Reserva>>(`/reservas/paginated?${params}`);
    return response.data.data;
  },

  // Obtener una reserva por ID
  getById: async (id: number): Promise<Reserva> => {
    const response = await api.get<ApiResponse<Reserva>>(`/reservas/${id}`);
    return response.data.data;
  },

  // Verificar disponibilidad de habitación
  checkAvailability: async (habitacion_id: number, fecha_entrada: string, fecha_salida: string, reserva_id?: number): Promise<boolean> => {
    const payload: any = {
      habitacion_id,
      fecha_entrada,
      fecha_salida
    };
    
    // Si estamos editando una reserva, incluir el ID para excluirla de la verificación
    if (reserva_id) {
      payload.reserva_id = reserva_id;
    }
    
    const response = await api.post<ApiResponse<{ disponible: boolean }>>('/reservas/check-availability', payload);
    return response.data.data.disponible;
  },

  // Crear una nueva reserva
  create: async (reserva: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>): Promise<Reserva> => {
    const response = await api.post<ApiResponse<Reserva>>('/reservas', reserva);
    return response.data.data;
  },

  // Actualizar una reserva
  update: async (id: number, reserva: Partial<Reserva>): Promise<Reserva> => {
    const response = await api.put<ApiResponse<Reserva>>(`/reservas/${id}`, reserva);
    return response.data.data;
  },

  // Cambiar estado de reserva
  updateStatus: async (id: number, estado: string): Promise<Reserva> => {
    const response = await api.patch<ApiResponse<Reserva>>(`/reservas/${id}/status`, { estado });
    return response.data.data;
  },

  // Eliminar una reserva
  delete: async (id: number): Promise<void> => {
    await api.delete(`/reservas/${id}`);
  },
};