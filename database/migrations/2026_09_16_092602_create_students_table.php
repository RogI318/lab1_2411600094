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
    Schema::create('students', function (Blueprint $table) {
        $table->id();
        $table->string('student_id')->unique();
        $table->string('name');
        $table->string('program');
        $table->integer('year_level');
        $table->integer('units')->default(0);
        $table->decimal('gpa', 3, 2)->default(0.00);
        $table->integer('attendance')->default(0);
        $table->string('status')->default('Good Standing');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
