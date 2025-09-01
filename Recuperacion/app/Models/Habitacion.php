<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Habitacion extends Model
{
    use HasFactory;

    protected $table = 'habitaciones';

    protected $fillable = [
        'hotel_id',
        'tipo_habitacion',
        'acomodacion',
        'capacidad',
        'numero_habitacion',
        'disponible'
    ];

    protected $casts = [
        'disponible' => 'boolean'
    ];

    // Relaciones
    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
