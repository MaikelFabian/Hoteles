<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habitacion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HabitacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Habitacion::with('hotel');

        // Filtros opcionales
        if ($request->has('hotel_id')) {
            $query->where('hotel_id', $request->hotel_id);
        }

        if ($request->has('tipo_habitacion')) {
            $query->where('tipo_habitacion', $request->tipo_habitacion);
        }

        if ($request->has('disponible')) {
            $query->where('disponible', $request->boolean('disponible'));
        }

        $habitaciones = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $habitaciones,
            'message' => 'Habitaciones obtenidas exitosamente'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hoteles,id',
            'tipo_habitacion' => 'required|in:ESTANDAR,JUNIOR,SUITE',
            'acomodacion' => 'required|in:SENCILLA,DOBLE,TRIPLE,CUADRUPLE',
            'capacidad' => 'required|integer|min:1|max:10',
            'numero_habitacion' => 'required|string|max:10',
            'disponible' => 'boolean'
        ]);

        // Verificar que el número de habitación sea único para el hotel
        $exists = Habitacion::where('hotel_id', $validated['hotel_id'])
            ->where('numero_habitacion', $validated['numero_habitacion'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una habitación con este número en el hotel'
            ], 422);
        }

        $habitacion = Habitacion::create($validated);
        $habitacion->load('hotel');

        return response()->json([
            'success' => true,
            'data' => $habitacion,
            'message' => 'Habitación creada exitosamente'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Habitacion $habitacion): JsonResponse
    {
        $habitacion->load('hotel', 'reservas');
        
        return response()->json([
            'success' => true,
            'data' => $habitacion,
            'message' => 'Habitación obtenida exitosamente'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Habitacion $habitacion): JsonResponse
    {
        $validated = $request->validate([
            'hotel_id' => 'sometimes|required|exists:hoteles,id',
            'tipo_habitacion' => 'sometimes|required|in:ESTANDAR,JUNIOR,SUITE',
            'acomodacion' => 'sometimes|required|in:SENCILLA,DOBLE,TRIPLE,CUADRUPLE',
            'capacidad' => 'sometimes|required|integer|min:1|max:10',
            'numero_habitacion' => 'sometimes|required|string|max:10',
            'disponible' => 'sometimes|boolean'
        ]);

        // Si se está actualizando el número de habitación o hotel, verificar unicidad
        if (isset($validated['numero_habitacion']) || isset($validated['hotel_id'])) {
            $hotelId = $validated['hotel_id'] ?? $habitacion->hotel_id;
            $numeroHabitacion = $validated['numero_habitacion'] ?? $habitacion->numero_habitacion;
            
            $exists = Habitacion::where('hotel_id', $hotelId)
                ->where('numero_habitacion', $numeroHabitacion)
                ->where('id', '!=', $habitacion->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una habitación con este número en el hotel'
                ], 422);
            }
        }

        $habitacion->update($validated);
        $habitacion->load('hotel');

        return response()->json([
            'success' => true,
            'data' => $habitacion,
            'message' => 'Habitación actualizada exitosamente'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Habitacion $habitacion): JsonResponse
    {
        // Verificar si la habitación tiene reservas
        if ($habitacion->reservas()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la habitación porque tiene reservas asociadas'
            ], 422);
        }

        $habitacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Habitación eliminada exitosamente'
        ]);
    }

    /**
     * Toggle room availability
     */
    public function toggleAvailability(Habitacion $habitacion): JsonResponse
    {
        $habitacion->update([
            'disponible' => !$habitacion->disponible
        ]);

        $status = $habitacion->disponible ? 'disponible' : 'no disponible';

        return response()->json([
            'success' => true,
            'data' => $habitacion,
            'message' => "Habitación marcada como {$status}"
        ]);
    }

    /**
     * Get available rooms by hotel and dates
     */
    public function getAvailableRooms(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hoteles,id',
            'fecha_entrada' => 'required|date|after_or_equal:today',
            'fecha_salida' => 'required|date|after:fecha_entrada',
            'tipo_habitacion' => 'sometimes|in:ESTANDAR,JUNIOR,SUITE',
            'capacidad' => 'sometimes|integer|min:1'
        ]);

        $query = Habitacion::where('hotel_id', $validated['hotel_id'])
            ->where('disponible', true)
            ->whereDoesntHave('reservas', function ($q) use ($validated) {
                $q->where(function ($query) use ($validated) {
                    $query->whereBetween('fecha_entrada', [$validated['fecha_entrada'], $validated['fecha_salida']])
                          ->orWhereBetween('fecha_salida', [$validated['fecha_entrada'], $validated['fecha_salida']])
                          ->orWhere(function ($q) use ($validated) {
                              $q->where('fecha_entrada', '<=', $validated['fecha_entrada'])
                                ->where('fecha_salida', '>=', $validated['fecha_salida']);
                          });
                })->whereIn('estado', ['CONFIRMADA', 'PENDIENTE']);
            });

        if (isset($validated['tipo_habitacion'])) {
            $query->where('tipo_habitacion', $validated['tipo_habitacion']);
        }

        if (isset($validated['capacidad'])) {
            $query->where('capacidad', '>=', $validated['capacidad']);
        }

        $habitacionesDisponibles = $query->with('hotel')->get();

        return response()->json([
            'success' => true,
            'data' => $habitacionesDisponibles,
            'message' => 'Habitaciones disponibles obtenidas exitosamente'
        ]);
    }
}
