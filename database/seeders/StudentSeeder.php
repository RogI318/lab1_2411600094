<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing records so seeding is idempotent
        Student::truncate();

        $students = [
            // ==================== BS COMPUTER SCIENCE ====================
            ['student_id' => '2026-00101', 'name' => 'Juan Dela Cruz',   'program' => 'BS Computer Science',      'year_level' => 3, 'units' => 18, 'gpa' => 3.75, 'attendance' => 94],
            ['student_id' => '2026-00105', 'name' => 'Jose Mendoza',     'program' => 'BS Computer Science',      'year_level' => 3, 'units' => 18, 'gpa' => 3.20, 'attendance' => 88],
            ['student_id' => '2026-00109', 'name' => 'Miguel Torres',    'program' => 'BS Computer Science',      'year_level' => 1, 'units' => 18, 'gpa' => 1.90, 'attendance' => 60],
            ['student_id' => '2026-00113', 'name' => 'Diego Fernandez',  'program' => 'BS Computer Science',      'year_level' => 4, 'units' => 21, 'gpa' => 2.30, 'attendance' => 70],
            ['student_id' => '2026-00117', 'name' => 'Gabriel Salazar',  'program' => 'BS Computer Science',      'year_level' => 2, 'units' => 15, 'gpa' => 2.75, 'attendance' => 80],
            ['student_id' => '2026-00121', 'name' => 'Hector Soriano',   'program' => 'BS Computer Science',      'year_level' => 4, 'units' => 21, 'gpa' => 2.55, 'attendance' => 74],
            ['student_id' => '2026-00125', 'name' => 'Fernando Alonzo',  'program' => 'BS Computer Science',      'year_level' => 2, 'units' => 15, 'gpa' => 2.95, 'attendance' => 84],
            ['student_id' => '2026-00129', 'name' => 'Enrique Villa',    'program' => 'BS Computer Science',      'year_level' => 1, 'units' => 18, 'gpa' => 2.35, 'attendance' => 71],

            // ==================== BS INFORMATION TECHNOLOGY ====================
            ['student_id' => '2026-00102', 'name' => 'Maria Santos',     'program' => 'BS Information Technology','year_level' => 2, 'units' => 15, 'gpa' => 2.10, 'attendance' => 68],
            ['student_id' => '2026-00106', 'name' => 'Liza Ramos',       'program' => 'BS Information Technology','year_level' => 4, 'units' => 21, 'gpa' => 2.85, 'attendance' => 82],
            ['student_id' => '2026-00110', 'name' => 'Isabella Cruz',    'program' => 'BS Information Technology','year_level' => 3, 'units' => 18, 'gpa' => 3.95, 'attendance' => 99],
            ['student_id' => '2026-00114', 'name' => 'Valeria Lim',      'program' => 'BS Information Technology','year_level' => 1, 'units' => 18, 'gpa' => 3.65, 'attendance' => 95],
            ['student_id' => '2026-00118', 'name' => 'Beatriz Mercado',  'program' => 'BS Information Technology','year_level' => 3, 'units' => 18, 'gpa' => 3.25, 'attendance' => 87],
            ['student_id' => '2026-00122', 'name' => 'Patricia Velasco', 'program' => 'BS Information Technology','year_level' => 2, 'units' => 15, 'gpa' => 3.30, 'attendance' => 90],
            ['student_id' => '2026-00126', 'name' => 'Gabriela Ramos',   'program' => 'BS Information Technology','year_level' => 4, 'units' => 21, 'gpa' => 3.15, 'attendance' => 86],
            ['student_id' => '2026-00130', 'name' => 'Rosario Delgado',  'program' => 'BS Information Technology','year_level' => 3, 'units' => 18, 'gpa' => 3.60, 'attendance' => 92],

            // ==================== BS INFORMATION SYSTEMS ====================
            ['student_id' => '2026-00103', 'name' => 'Pedro Reyes',      'program' => 'BS Information Systems',   'year_level' => 4, 'units' => 21, 'gpa' => 1.65, 'attendance' => 55],
            ['student_id' => '2026-00107', 'name' => 'Carlos Bautista',  'program' => 'BS Information Systems',   'year_level' => 2, 'units' => 15, 'gpa' => 2.40, 'attendance' => 72],
            ['student_id' => '2026-00111', 'name' => 'Rafael Aquino',    'program' => 'BS Information Systems',   'year_level' => 4, 'units' => 21, 'gpa' => 2.65, 'attendance' => 78],
            ['student_id' => '2026-00115', 'name' => 'Andres Castillo',  'program' => 'BS Information Systems',   'year_level' => 3, 'units' => 18, 'gpa' => 1.55, 'attendance' => 52],
            ['student_id' => '2026-00119', 'name' => 'Emilio Pascual',   'program' => 'BS Information Systems',   'year_level' => 1, 'units' => 18, 'gpa' => 2.05, 'attendance' => 66],
            ['student_id' => '2026-00123', 'name' => 'Ricardo Ong',      'program' => 'BS Information Systems',   'year_level' => 3, 'units' => 18, 'gpa' => 1.85, 'attendance' => 58],
            ['student_id' => '2026-00127', 'name' => 'Mario Espinosa',   'program' => 'BS Information Systems',   'year_level' => 2, 'units' => 15, 'gpa' => 2.20, 'attendance' => 69],

            // ==================== BS DATA SCIENCE ====================
            ['student_id' => '2026-00104', 'name' => 'Ana Villanueva',   'program' => 'BS Data Science',          'year_level' => 1, 'units' => 18, 'gpa' => 3.85, 'attendance' => 98],
            ['student_id' => '2026-00108', 'name' => 'Sofia Garcia',     'program' => 'BS Data Science',          'year_level' => 3, 'units' => 18, 'gpa' => 3.55, 'attendance' => 91],
            ['student_id' => '2026-00112', 'name' => 'Camila Navarro',   'program' => 'BS Data Science',          'year_level' => 2, 'units' => 15, 'gpa' => 3.10, 'attendance' => 85],
            ['student_id' => '2026-00116', 'name' => 'Natalia Domingo',  'program' => 'BS Data Science',          'year_level' => 4, 'units' => 21, 'gpa' => 3.40, 'attendance' => 89],
            ['student_id' => '2026-00120', 'name' => 'Daniela Rivera',   'program' => 'BS Data Science',          'year_level' => 3, 'units' => 18, 'gpa' => 3.80, 'attendance' => 96],
            ['student_id' => '2026-00124', 'name' => 'Teresa Lorenzo',   'program' => 'BS Data Science',          'year_level' => 1, 'units' => 18, 'gpa' => 3.50, 'attendance' => 93],
            ['student_id' => '2026-00128', 'name' => 'Lucia Yulo',       'program' => 'BS Data Science',          'year_level' => 3, 'units' => 18, 'gpa' => 3.70, 'attendance' => 97],
        ];

        foreach ($students as $data) {
            Student::create($data);
        }
    }
}