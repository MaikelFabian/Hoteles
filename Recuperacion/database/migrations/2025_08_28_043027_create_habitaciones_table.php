<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('habitaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hoteles')->onDelete('cascade');
            $table->enum('tipo_habitacion', ['ESTANDAR', 'JUNIOR', 'SUITE']);
            $table->enum('acomodacion', ['SENCILLA', 'DOBLE', 'TRIPLE', 'CUADRUPLE']);
            $table->integer('capacidad');
            $table->string('numero_habitacion');
            $table->boolean('disponible')->default(true);
            $table->timestamps();
            
            $table->unique(['hotel_id', 'numero_habitacion']);
            $table->unique(['hotel_id', 'tipo_habitacion', 'acomodacion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habitaciones');
    }
};
