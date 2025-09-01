<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Huesped;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class HuespedController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Huesped::query();

        // Filtros opcionales
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'ILIKE', "%{$search}%")
                  ->orWhere('apellido', 'ILIKE', "%{$search}%")
                  ->orWhere('documento', 'ILIKE', "%{$search}%");
                  // Eliminamos la búsqueda por email
            });
        }

        if ($request->has('tipo_documento')) {
            $query->where('tipo_documento', $request->tipo_documento);
        }

        if ($request->has('nacionalidad')) {
            $query->where('nacionalidad', 'ILIKE', "%{$request->nacionalidad}%");
        }

        $huespedes = $query->with('reservasPrincipales')->get();
        
        return response()->json([
            'success' => true,
            'data' => $huespedes,
            'message' => 'Huéspedes obtenidos exitosamente'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'documento' => 'required|string|unique:huespedes,documento|max:20',
            'tipo_documento' => 'required|in:CC,CE,TI,PP,NIT',
            // Eliminamos la validación de email
            'telefono' => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date|before:today',
            'genero' => 'required|in:M,F,O',
            'nacionalidad' => 'required|string|max:50'
        ]);
    
        // Validar edad mínima (18 años)
        $fechaNacimiento = new \DateTime($validated['fecha_nacimiento']);
        $hoy = new \DateTime();
        $edad = $hoy->diff($fechaNacimiento)->y;
        
        if ($edad < 18) {
            return response()->json([
                'success' => false,
                'message' => 'El huésped debe ser mayor de edad (18 años)'
            ], 422);
        }
    
        $huesped = Huesped::create($validated);
    
        return response()->json([
            'success' => true,
            'data' => $huesped,
            'message' => 'Huésped creado exitosamente'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Huesped $huesped): JsonResponse
    {
        $huesped->load('reservasPrincipales.hotel', 'reservas.hotel');
        
        return response()->json([
            'success' => true,
            'data' => $huesped,
            'message' => 'Huésped obtenido exitosamente'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Huesped $huesped): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'documento' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('huespedes', 'documento')->ignore($huesped->id)
            ],
            'tipo_documento' => 'sometimes|required|in:CC,CE,TI,PP,NIT',
            // Eliminamos la validación de email
            'telefono' => 'sometimes|required|string|max:20',
            'fecha_nacimiento' => 'sometimes|required|date|before:today',
            'genero' => 'sometimes|required|in:M,F,O',
            'nacionalidad' => 'sometimes|required|string|max:50'
        ]);
    
        // Validar edad mínima si se actualiza la fecha de nacimiento
        if (isset($validated['fecha_nacimiento'])) {
            $fechaNacimiento = new \DateTime($validated['fecha_nacimiento']);
            $hoy = new \DateTime();
            $edad = $hoy->diff($fechaNacimiento)->y;
            
            if ($edad < 18) {
                return response()->json([
                    'success' => false,
                    'message' => 'El huésped debe ser mayor de edad (18 años)'
                ], 422);
            }
        }
    
        $huesped->update($validated);
    
        return response()->json([
            'success' => true,
            'data' => $huesped,
            'message' => 'Huésped actualizado exitosamente'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Huesped $huesped): JsonResponse
    {
        // Verificar si el huésped tiene reservas
        if ($huesped->reservasPrincipales()->count() > 0 || $huesped->reservas()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el huésped porque tiene reservas asociadas'
            ], 422);
        }

        $huesped->delete();

        return response()->json([
            'success' => true,
            'message' => 'Huésped eliminado exitosamente'
        ]);
    }

    /**
     * Get guest statistics
     */
    public function statistics(Huesped $huesped): JsonResponse
    {
        $stats = [
            'total_reservas' => $huesped->reservasPrincipales()->count(),
            'reservas_confirmadas' => $huesped->reservasPrincipales()->where('estado', 'CONFIRMADA')->count(),
            'reservas_pendientes' => $huesped->reservasPrincipales()->where('estado', 'PENDIENTE')->count(),
            'reservas_canceladas' => $huesped->reservasPrincipales()->where('estado', 'CANCELADA')->count(),
            'hoteles_visitados' => $huesped->reservasPrincipales()
                ->with('hotel')
                ->get()
                ->pluck('hotel')
                ->unique('id')
                ->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estadísticas del huésped obtenidas exitosamente'
        ]);
    }
}
