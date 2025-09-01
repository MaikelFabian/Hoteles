<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Hotel;
use App\Models\Habitacion;
use App\Models\Huesped;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReservaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Reserva::with(['hotel', 'habitacion', 'huespedPrincipal', 'huespedes']);

        // Filtros opcionales
        if ($request->filled('hotel_id')) {
            $query->where('hotel_id', $request->hotel_id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('fecha_entrada')) {
            $query->whereDate('fecha_entrada', '>=', $request->fecha_entrada);
        }

        if ($request->filled('fecha_salida')) {
            $query->whereDate('fecha_salida', '<=', $request->fecha_salida);
        }

        if ($request->filled('huesped_id')) {
            $query->where('huesped_id', $request->huesped_id);
        }

        $reservas = $query->orderBy('fecha_entrada', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reservas,
            'message' => 'Reservas obtenidas exitosamente'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hoteles,id',
            'habitacion_id' => 'required|exists:habitaciones,id',
            'huesped_id' => 'required|exists:huespedes,id',
            'fecha_entrada' => 'required|date',
            'fecha_salida' => 'required|date|after:fecha_entrada',
            'numero_huespedes' => 'required|integer|min:1|max:10',
            'precio_total' => 'required|numeric|min:0',
            'observaciones' => 'nullable|string|max:1000',
            'huespedes_adicionales' => 'sometimes|array',
            'huespedes_adicionales.*' => 'exists:huespedes,id'
        ]);

        try {
            $reserva = DB::transaction(function () use ($validated) {
                // Verificar que la habitación pertenezca al hotel
                $habitacion = Habitacion::where('id', $validated['habitacion_id'])
                    ->where('hotel_id', $validated['hotel_id'])
                    ->first();

                if (!$habitacion) {
                    throw new \Exception('La habitación no pertenece al hotel seleccionado', 422);
                }

                // Verificar capacidad
                if ($validated['numero_huespedes'] > $habitacion->capacidad) {
                    throw new \Exception("La habitación solo tiene capacidad para {$habitacion->capacidad} huéspedes", 422);
                }

                // Verificar disponibilidad
                $conflicto = Reserva::where('habitacion_id', $validated['habitacion_id'])
                    ->where(function ($query) use ($validated) {
                        $query->whereBetween('fecha_entrada', [$validated['fecha_entrada'], $validated['fecha_salida']])
                              ->orWhereBetween('fecha_salida', [$validated['fecha_entrada'], $validated['fecha_salida']])
                              ->orWhere(function ($q) use ($validated) {
                                  $q->where('fecha_entrada', '<=', $validated['fecha_entrada'])
                                    ->where('fecha_salida', '>=', $validated['fecha_salida']);
                              });
                    })
                    ->whereIn('estado', ['CONFIRMADA', 'PENDIENTE'])
                    ->exists();

                if ($conflicto) {
                    throw new \Exception('La habitación no está disponible en las fechas seleccionadas', 422);
                }

                // Crear reserva
                $reserva = Reserva::create($validated);

                // Agregar huéspedes
                $huespedes = collect($validated['huespedes_adicionales'] ?? []);
                $huespedes->prepend($validated['huesped_id']); // titular

                foreach ($huespedes as $index => $huespedId) {
                    $reserva->huespedes()->attach($huespedId, [
                        'es_titular' => $index === 0,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }

                return $reserva;
            });

            $reserva->load(['hotel', 'habitacion', 'huespedPrincipal', 'huespedes']);

            return response()->json([
                'success' => true,
                'data' => $reserva,
                'message' => 'Reserva creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            $code = $e->getCode() === 422 ? 422 : 500;
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $code);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Reserva $reserva): JsonResponse
    {
        $reserva->load(['hotel', 'habitacion', 'huespedPrincipal', 'huespedes']);

        return response()->json([
            'success' => true,
            'data' => $reserva,
            'message' => 'Reserva obtenida exitosamente'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reserva $reserva): JsonResponse
    {
        // Solo bloquear la edición de reservas confirmadas si no se está cambiando el estado
        if ($reserva->estado === 'CONFIRMADA' && !$request->has('estado')) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede modificar una reserva confirmada sin cambiar su estado'
            ], 422);
        }
    
        // Las reservas PENDIENTES y CANCELADAS se pueden editar libremente
        // Eliminar esta validación completamente
        // if ($reserva->estado === 'CANCELADA' && !$request->has('estado')) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Solo se puede cambiar el estado de una reserva cancelada'
        //     ], 422);
        // }
    
        $validated = $request->validate([
            'habitacion_id' => 'sometimes|exists:habitaciones,id',
            'fecha_entrada' => 'sometimes|date',
            'fecha_salida' => 'sometimes|date|after:fecha_entrada',
            'numero_huespedes' => 'sometimes|integer|min:1',
            'precio_total' => 'sometimes|numeric|min:0',
            'estado' => 'sometimes|in:PENDIENTE,CONFIRMADA,CANCELADA',
            'observaciones' => 'sometimes|string|nullable',
            'huesped_id' => 'sometimes|exists:huespedes,id',
            'reserva_id' => 'sometimes|exists:reservas,id' // Para excluir en caso de edición
        ]);

        $reserva = DB::transaction(function () use ($validated, $reserva, $request) {
            if (isset($validated['fecha_entrada']) || isset($validated['fecha_salida']) || isset($validated['habitacion_id'])) {
                $entrada = $validated['fecha_entrada'] ?? $reserva->fecha_entrada;
                $salida = $validated['fecha_salida'] ?? $reserva->fecha_salida;
                $habitacion_id = $validated['habitacion_id'] ?? $reserva->habitacion_id;

                $conflicto = Reserva::where('habitacion_id', $habitacion_id)
                    ->where('id', '!=', $reserva->id)
                    ->where(function ($query) use ($entrada, $salida) {
                        $query->whereBetween('fecha_entrada', [$entrada, $salida])
                              ->orWhereBetween('fecha_salida', [$entrada, $salida])
                              ->orWhere(function ($q) use ($entrada, $salida) {
                                  $q->where('fecha_entrada', '<=', $entrada)
                                    ->where('fecha_salida', '>=', $salida);
                              });
                    })
                    ->whereIn('estado', ['CONFIRMADA', 'PENDIENTE'])
                    ->exists();

                if ($conflicto) {
                    throw new \Exception('La habitación no está disponible en las nuevas fechas seleccionadas', 422);
                }
            }

            if (isset($validated['numero_huespedes'])) {
                $habitacion = isset($validated['habitacion_id']) 
                    ? \App\Models\Habitacion::find($validated['habitacion_id'])
                    : $reserva->habitacion;
                    
                if ($validated['numero_huespedes'] > $habitacion->capacidad) {
                    throw new \Exception("La habitación solo tiene capacidad para {$habitacion->capacidad} huéspedes", 422);
                }
            }

            $reserva->update($validated);
            return $reserva;
        });

        $reserva->load(['hotel', 'habitacion', 'huespedPrincipal', 'huespedes']);

        return response()->json([
            'success' => true,
            'data' => $reserva,
            'message' => 'Reserva actualizada exitosamente'
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Reserva $reserva): JsonResponse
    {
        if ($reserva->estado === 'CONFIRMADA') {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar una reserva confirmada. Debe cancelarla primero.'
            ], 422);
        }

        $reserva->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reserva eliminada exitosamente'
        ]);
    }

    public function cancel(Reserva $reserva): JsonResponse
    {
        if ($reserva->estado === 'CANCELADA') {
            return response()->json([
                'success' => false,
                'message' => 'La reserva ya está cancelada'
            ], 422);
        }

        $reserva->update(['estado' => 'CANCELADA']);

        return response()->json([
            'success' => true,
            'data' => $reserva,
            'message' => 'Reserva cancelada exitosamente'
        ]);
    }

    public function confirm(Reserva $reserva): JsonResponse
    {
        if ($reserva->estado === 'CONFIRMADA') {
            return response()->json([
                'success' => false,
                'message' => 'La reserva ya está confirmada'
            ], 422);
        }

        if ($reserva->estado === 'CANCELADA') {
            return response()->json([
                'success' => false,
                'message' => 'No se puede confirmar una reserva cancelada'
            ], 422);
        }

        $reserva->update(['estado' => 'CONFIRMADA']);

        return response()->json([
            'success' => true,
            'data' => $reserva,
            'message' => 'Reserva confirmada exitosamente'
        ]);
    }

    /**
     * Estadísticas de reservas
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Reserva::query();

        if ($request->filled('hotel_id')) {
            $query->where('hotel_id', $request->hotel_id);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_entrada', [$request->fecha_inicio, $request->fecha_fin]);
        }

        $stats = [
            'total_reservas' => $query->count(),
            'reservas_confirmadas' => (clone $query)->where('estado', 'CONFIRMADA')->count(),
            'reservas_pendientes' => (clone $query)->where('estado', 'PENDIENTE')->count(),
            'reservas_canceladas' => (clone $query)->where('estado', 'CANCELADA')->count(),
            'ingresos_totales' => (clone $query)->where('estado', 'CONFIRMADA')->sum('precio_total'),
            'promedio_estancia' => (clone $query)
                ->selectRaw("AVG(DATEDIFF(fecha_salida, fecha_entrada)) as promedio")
                ->value('promedio'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estadísticas de reservas obtenidas exitosamente'
        ]);
    }

    /**
     * Actualizar solo el estado de una reserva
     */
    public function updateStatus(Request $request, Reserva $reserva): JsonResponse
    {
        $validated = $request->validate([
            'estado' => 'required|in:PENDIENTE,CONFIRMADA,CANCELADA'
        ]);
    
        // Comentar o eliminar estas validaciones para permitir cambiar cualquier estado
        // if ($validated['estado'] === 'CONFIRMADA' && $reserva->estado === 'CANCELADA') {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'No se puede confirmar una reserva cancelada'
        //     ], 422);
        // }    
    
        if ($validated['estado'] === 'CANCELADA' && $reserva->estado === 'CONFIRMADA') {
            // Permitir cancelar reservas confirmadas con advertencia
        }
    
        $reserva->update(['estado' => $validated['estado']]);
        $reserva->load(['hotel', 'habitacion', 'huespedPrincipal', 'huespedes']);

        return response()->json([
            'success' => true,
            'data' => $reserva,
            'message' => "Reserva " . strtolower($validated['estado']) . " exitosamente"
        ]);
    }

    /**
     * Verificar disponibilidad de habitación
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'habitacion_id' => 'required|exists:habitaciones,id',
            'fecha_entrada' => 'required|date',
            'fecha_salida' => 'required|date|after:fecha_entrada',
            'reserva_id' => 'sometimes|exists:reservas,id'
        ]);
    
        // Buscar conflictos de fechas para la habitación
        $query = Reserva::where('habitacion_id', $validated['habitacion_id'])
            ->where('estado', '!=', 'CANCELADA')
            ->where(function ($q) use ($validated) {
                $q->whereBetween('fecha_entrada', [$validated['fecha_entrada'], $validated['fecha_salida']])
                  ->orWhereBetween('fecha_salida', [$validated['fecha_entrada'], $validated['fecha_salida']])
                  ->orWhere(function ($subQ) use ($validated) {
                      $subQ->where('fecha_entrada', '<=', $validated['fecha_entrada'])
                           ->where('fecha_salida', '>=', $validated['fecha_salida']);
                  });
            });
    
        // Excluir reserva actual si se está editando
        if (isset($validated['reserva_id'])) {
            $query->where('id', '!=', $validated['reserva_id']);
        }
    
        $disponible = !$query->exists();
    
        return response()->json([
            'success' => true,
            'data' => [
                'disponible' => $disponible,
                'habitacion_id' => $validated['habitacion_id'],
                'fecha_entrada' => $validated['fecha_entrada'],
                'fecha_salida' => $validated['fecha_salida']
            ],
            'message' => $disponible ? 'Habitación disponible' : 'Habitación no disponible en las fechas seleccionadas'
        ]);
    }
}
