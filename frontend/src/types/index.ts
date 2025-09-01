export interface Hotel {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  nit: string;
  numero_habitaciones: number;
  created_at?: string;
  updated_at?: string;
  habitaciones?: Habitacion[];
}

export interface Habitacion {
  id: number;
  hotel_id: number;
  tipo_habitacion: 'ESTANDAR' | 'JUNIOR' | 'SUITE';
  acomodacion: 'SENCILLA' | 'DOBLE' | 'TRIPLE';
  capacidad: number;
  numero_habitacion: string;
  disponible: boolean;
  created_at?: string;
  updated_at?: string;
  hotel?: Hotel;
}

export interface Huesped {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'NIT';
  // email: string; // Eliminamos email
  telefono: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F' | 'O';
  nacionalidad: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reserva {
  id: number;
  hotel_id: number;
  habitacion_id: number;
  huesped_id: number;
  fecha_entrada: string;
  fecha_salida: string;
  numero_huespedes: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  precio_total: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  hotel?: Hotel;
  habitacion?: Habitacion;
  huesped_principal?: Huesped;
  huespedes?: Huesped[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}