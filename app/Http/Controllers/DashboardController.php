<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Stat cards
        $totalStudents  = Student::count();
        $atRiskCount    = Student::where('status', 'At Risk')->count();
        $probationCount = Student::where('status', 'Probation')->count();
        $avgGpa         = round(Student::avg('gpa') ?? 0, 2);

        // Recent students
        $recentStudents = Student::latest()->take(5)->get();

        // Flagged students (for alert center)
        $flaggedStudents = Student::whereIn('status', ['At Risk', 'Probation'])
                                  ->orderBy('gpa')
                                  ->take(5)
                                  ->get();

        // ============================================================
        // CHART 1: Average GPA by Program
        // ============================================================
        $gpaByProgram = Student::select('program', DB::raw('AVG(gpa) as avg_gpa'))
                               ->groupBy('program')
                               ->orderBy('program')
                               ->get();

        // ============================================================
        // CHART 2: Academic Standing Distribution
        // ============================================================
        $standingDist = [
            'Good Standing' => Student::where('status', 'Good Standing')->count(),
            'At Risk'       => $atRiskCount,
            'Probation'     => $probationCount,
        ];

        // ============================================================
        // CHART 3: Top 5 Students by GPA
        // ============================================================
        $topStudents = Student::orderByDesc('gpa')->take(5)->get();

        // ============================================================
        // CHART 4: Students by Year Level
        // ============================================================
        $byYearLevel = Student::select('year_level', DB::raw('COUNT(*) as count'))
                              ->groupBy('year_level')
                              ->orderBy('year_level')
                              ->get();

        return view('dashboard', compact(
            'totalStudents',
            'atRiskCount',
            'probationCount',
            'avgGpa',
            'recentStudents',
            'flaggedStudents',
            'gpaByProgram',
            'standingDist',
            'topStudents',
            'byYearLevel'
        ));
    }
}