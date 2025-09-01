<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class HotelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $hoteles = Hotel::with('habitaciones')->get();
        
        return response()->json([
            'success' => true,
            'data' => $hoteles,
            'message' => 'Hoteles obtenidos exitosamente'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'required|string|max:500',
            'ciudad' => 'required|string|max:100',
            'nit' => 'required|string|unique:hoteles,nit|max:20',
            'numero_habitaciones' => 'required|integer|min:1|max:1000'
        ]);

        $hotel = Hotel::create($validated);

        return response()->json([
            'success' => true,
            'data' => $hotel,
            'message' => 'Hotel creado exitosamente'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Hotel $hotel): JsonResponse
    {
        $hotel->load('habitaciones');
        
        return response()->json([
            'success' => true,
            'data' => $hotel,
            'message' => 'Hotel obtenido exitosamente'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Hotel $hotel): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'direccion' => 'sometimes|required|string|max:500',
            'ciudad' => 'sometimes|required|string|max:100',
            'nit' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('hoteles', 'nit')->ignore($hotel->id)
            ],
            'numero_habitaciones' => 'sometimes|required|integer|min:1|max:1000'
        ]);

        $hotel->update($validated);

        return response()->json([
            'success' => true,
            'data' => $hotel,
            'message' => 'Hotel actualizado exitosamente'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Hotel $hotel): JsonResponse
    {
        // Verificar si el hotel tiene habitaciones
        if ($hotel->habitaciones()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el hotel porque tiene habitaciones asociadas'
            ], 422);
        }

        $hotel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hotel eliminado exitosamente'
        ]);
    }

    /**
     * Get hotel statistics
     */
    public function statistics(Hotel $hotel): JsonResponse
    {
        $stats = [
            'total_habitaciones' => $hotel->habitaciones()->count(),
            'habitaciones_disponibles' => $hotel->habitaciones()->where('disponible', true)->count(),
            'habitaciones_ocupadas' => $hotel->habitaciones()->where('disponible', false)->count(),
            'tipos_habitacion' => $hotel->habitaciones()
                ->selectRaw('tipo_habitacion, COUNT(*) as cantidad')
                ->groupBy('tipo_habitacion')
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estadísticas del hotel obtenidas exitosamente'
        ]);
    }
}
