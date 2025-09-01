<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\HabitacionController;
use App\Http\Controllers\Api\HuespedController;
use App\Http\Controllers\Api\ReservaController;

// Ruta básica para obtener información del usuario autenticado
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// === RUTAS BÁSICAS PARA HOTELES ===
Route::get('/hoteles', [HotelController::class, 'index']);           // Ver todos los hoteles
Route::post('/hoteles', [HotelController::class, 'store']);          // Crear hotel
Route::get('/hoteles/{hotel}', [HotelController::class, 'show']);       // Ver un hotel
Route::put('/hoteles/{hotel}', [HotelController::class, 'update']);     // Actualizar hotel
Route::delete('/hoteles/{hotel}', [HotelController::class, 'destroy']); // Eliminar hotel

// === RUTAS BÁSICAS PARA HABITACIONES ===
Route::get('/habitaciones', [HabitacionController::class, 'index']);           // Ver todas las habitaciones
Route::post('/habitaciones', [HabitacionController::class, 'store']);          // Crear habitación
Route::get('/habitaciones/{habitacion}', [HabitacionController::class, 'show']);       // Ver una habitación
Route::put('/habitaciones/{habitacion}', [HabitacionController::class, 'update']);     // Actualizar habitación
Route::delete('/habitaciones/{habitacion}', [HabitacionController::class, 'destroy']); // Eliminar habitación

// === RUTAS BÁSICAS PARA HUÉSPEDES ===
Route::get('/huespedes', [HuespedController::class, 'index']);           // Ver todos los huéspedes
Route::post('/huespedes', [HuespedController::class, 'store']);          // Crear huésped
Route::get('/huespedes/{huesped}', [HuespedController::class, 'show']);       // Ver un huésped
Route::put('/huespedes/{huesped}', [HuespedController::class, 'update']);     // Actualizar huésped
Route::delete('/huespedes/{huesped}', [HuespedController::class, 'destroy']); // Eliminar huésped

// === RUTAS BÁSICAS PARA RESERVAS ===
Route::get('/reservas', [ReservaController::class, 'index']);           // Ver todas las reservas
Route::post('/reservas', [ReservaController::class, 'store']);          // Crear reserva
Route::post('/reservas/check-availability', [ReservaController::class, 'checkAvailability']); // Verificar disponibilidad
Route::patch('/reservas/{reserva}/status', [ReservaController::class, 'updateStatus']); // Actualizar estado
Route::get('/reservas/{reserva}', [ReservaController::class, 'show']);       // Ver una reserva
Route::put('/reservas/{reserva}', [ReservaController::class, 'update']);     // Actualizar reserva
Route::delete('/reservas/{reserva}', [ReservaController::class, 'destroy']); // Eliminar reserva
