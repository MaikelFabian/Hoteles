<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Huesped extends Model
{
    use HasFactory;

    protected $table = 'huespedes';

    protected $fillable = [
        'nombre',
        'apellido',
        'documento',
        'tipo_documento',
      
        'telefono',
        'fecha_nacimiento',
        'genero',
        'nacionalidad'
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date'
    ];

    // Relaciones
    public function reservas()
    {
        return $this->belongsToMany(Reserva::class, 'reserva_huesped')
                    ->withPivot('es_titular')
                    ->withTimestamps();
    }

    public function reservasPrincipales()
    {
        return $this->hasMany(Reserva::class);
    }
}
