<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'habitacion_id',
        'huesped_id',
        'fecha_entrada',
        'fecha_salida',
        'numero_huespedes',
        'estado',
        'precio_total',
        'observaciones'
    ];

    protected $casts = [
        'fecha_entrada' => 'date',
        'fecha_salida' => 'date',
        'precio_total' => 'decimal:2'
    ];

    // Relaciones
    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function habitacion()
    {
        return $this->belongsTo(Habitacion::class);
    }

    public function huespedPrincipal()
    {
        return $this->belongsTo(Huesped::class, 'huesped_id');
    }

    public function huespedes()
    {
        return $this->belongsToMany(Huesped::class, 'reserva_huesped')
                    ->withPivot('es_titular')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->whereIn('estado', ['PENDIENTE', 'CONFIRMADA']);
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->where(function($q) use ($fechaInicio, $fechaFin) {
            $q->whereBetween('fecha_entrada', [$fechaInicio, $fechaFin])
              ->orWhereBetween('fecha_salida', [$fechaInicio, $fechaFin])
              ->orWhere(function($q2) use ($fechaInicio, $fechaFin) {
                  $q2->where('fecha_entrada', '<=', $fechaInicio)
                     ->where('fecha_salida', '>=', $fechaFin);
              });
        });
    }
}
