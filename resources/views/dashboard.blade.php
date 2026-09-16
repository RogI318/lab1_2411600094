@extends('layouts.master')

@section('title', 'Dashboard')

@section('content')

    {{-- ============================================================
         GREETING HEADER (time-based)
         ============================================================ --}}
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
        <h2 id="greeting" class="fw-bold">Dashboard</h2>
    </div>

    {{-- ============================================================
         STAT CARDS
         ============================================================ --}}
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="card stat-card text-center shadow-hover border-accent">
                <div class="card-body">
                    <h5 class="card-title text-muted">👥 TOTAL STUDENTS</h5>
                    <h2 class="card-text fw-bold text-primary">{{ $totalStudents }}</h2>
                    <small>All enrolled students</small>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card stat-card text-center shadow-hover border-primary-custom">
                <div class="card-body">
                    <h5 class="card-title text-muted">⚠️ AT RISK</h5>
                    <h2 class="card-text fw-bold text-warning">{{ $atRiskCount }}</h2>
                    <small>GPA between 1.75 and 2.49</small>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card stat-card text-center shadow-hover border-success-custom">
                <div class="card-body">
                    <h5 class="card-title text-muted">🚫 PROBATION</h5>
                    <h2 class="card-text fw-bold text-danger">{{ $probationCount }}</h2>
                    <small>GPA below 1.75</small>
                </div>
            </div>
        </div>

        <div class="col-md-3 mb-3">
            <div class="card stat-card text-center shadow-hover border-accent">
                <div class="card-body">
                    <h5 class="card-title text-muted">📊 AVERAGE GPA</h5>
                    <h2 class="card-text fw-bold text-primary">{{ number_format($avgGpa, 2) }}</h2>
                    <small>Across all students</small>
                </div>
            </div>
        </div>
    </div>

    {{-- ============================================================
         ALERT CENTER
         ============================================================ --}}
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow-hover">
                <div class="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Alert Center</h5>
                    @if($flaggedStudents->count() > 0)
                        <span class="badge bg-light text-dark">
                            {{ $flaggedStudents->count() }} alert{{ $flaggedStudents->count() !== 1 ? 's' : '' }}
                        </span>
                    @endif
                </div>
                <div class="card-body">
                    @if($flaggedStudents->isEmpty())
                        <div class="text-center py-2">
                            <i class="bi bi-check-circle-fill text-success fs-1 d-block"></i>
                            <p class="text-muted mb-0">No at-risk students. Everything looks good!</p>
                        </div>
                    @else
                        @foreach($flaggedStudents as $student)
                            <div class="alert {{ $student->isOnProbation() ? 'bg-danger text-white' : 'bg-warning text-dark' }}
                                        alert-dismissible fade show d-flex align-items-center mb-2" role="alert">
                                <i class="bi {{ $student->isOnProbation() ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill' }} me-3 fs-4"></i>
                                <div class="flex-grow-1">
                                    <strong>{{ $student->status }}:</strong>
                                    {{ $student->name }} ({{ $student->student_id }})
                                    — GPA {{ number_format($student->gpa, 2) }}, Attendance {{ $student->attendance }}%
                                </div>
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endforeach
                    @endif
                </div>
            </div>
        </div>
    </div>

    {{-- ============================================================
         CHARTS ROW 1 — 3 charts side by side
         ============================================================ --}}
    <div class="row mb-4">
        <div class="col-lg-4 mb-4">
            <div class="card shadow-hover">
                <div class="card-header bg-gradient-primary text-white">
                    <h5 class="mb-0">Average GPA by Program</h5>
                </div>
                <div class="card-body" style="height: 300px;">
                    <canvas id="gpaByProgramChart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-lg-4 mb-4">
            <div class="card shadow-hover">
                <div class="card-header bg-gradient-primary text-white">
                    <h5 class="mb-0">Academic Standing Distribution</h5>
                </div>
                <div class="card-body" style="height: 300px;">
                    <canvas id="standingChart"></canvas>
                </div>
            </div>
        </div>

        <div class="col-lg-4 mb-4">
            <div class="card shadow-hover">
                <div class="card-header bg-gradient-primary text-white">
                    <h5 class="mb-0">Top Students by GPA</h5>
                </div>
                <div class="card-body" style="height: 300px;">
                    <canvas id="topStudentsChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    {{-- ============================================================
         CHART ROW 2 — Full-width Students by Year Level
         ============================================================ --}}
    <div class="row mb-4">
        <div class="col-12 mb-4">
            <div class="card shadow-hover">
                <div class="card-header bg-gradient-primary text-white">
                    <h5 class="mb-0">Students by Year Level</h5>
                </div>
                <div class="card-body" style="height: 280px;">
                    <canvas id="yearLevelChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    {{-- ============================================================
         RECENT STUDENTS TABLE
         ============================================================ --}}
    <div class="card shadow-hover mb-4">
        <div class="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 class="mb-0">Recently Added Students</h5>
            <a href="{{ route('students.index') }}" class="btn btn-sm btn-light">
                View All <i class="bi bi-arrow-right"></i>
            </a>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle" id="rosterTable">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Program</th>
                            <th>Year</th>
                            <th>GPA</th>
                            <th>Attendance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentStudents as $student)
                            <tr>
                                <td><strong>{{ $student->student_id }}</strong></td>
                                <td>{{ $student->name }}</td>
                                <td>{{ $student->program }}</td>
                                <td>{{ $student->year_level }}</td>
                                <td class="{{ $student->gpaColorClass() }} fw-bold">
                                    {{ number_format($student->gpa, 2) }}
                                </td>
                                <td>{{ $student->attendance }}%</td>
                                <td>
                                    <span class="badge {{ $student->statusBadgeClass() }}">
                                        {{ $student->status }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-4">
                                    <i class="bi bi-inbox fs-1 d-block text-muted"></i>
                                    <p class="text-muted mb-0">No students yet.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- ============================================================
         SCRIPTS — Chart.js + Greeting
         ============================================================ --}}
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        // ==========================================================
        // GREETING (time-based)
        // ==========================================================
        (function() {
            const h = new Date().getHours();
            let tod = 'Good Evening';
            if (h >= 5 && h < 12)       tod = 'Good Morning';
            else if (h >= 12 && h < 17) tod = 'Good Afternoon';
            else if (h >= 17 && h < 21) tod = 'Good Evening';
            else                        tod = 'Good Night';

            const userName = 'Admin'
            document.getElementById('greeting').textContent = `${tod}, ${userName}!`;
        })();

        // ==========================================================
        // CHART COLORS (from your Lab 4 palette)
        // ==========================================================
        const COLORS = {
            primary:    '#FB6F92',
            secondary:  '#FF8FAB',
            accent:     '#FFB3C6',
            light:      '#FFC2D1',
            background: '#FFE5EC',
            good:       '#28a745',
            warning:    '#f3a712',
            danger:     '#dc3545'
        };

        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
                }
            }
        };

        // ==========================================================
        // CHART 1: Average GPA by Program
        // ==========================================================
        const gpaByProgramData = @json($gpaByProgram);
        new Chart(document.getElementById('gpaByProgramChart'), {
            type: 'bar',
            data: {
                labels: gpaByProgramData.map(d => d.program.replace('BS ', '')),
                datasets: [{
                    label: 'Avg GPA',
                    data: gpaByProgramData.map(d => parseFloat(d.avg_gpa).toFixed(2)),
                    backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.light],
                    borderColor: '#fff',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                ...baseOptions,
                scales: {
                    y: {
                        beginAtZero: true, max: 4.0,
                        ticks: { stepSize: 0.5, callback: v => v.toFixed(1) }
                    }
                },
                plugins: { ...baseOptions.plugins, legend: { display: false } }
            }
        });

        // ==========================================================
        // CHART 2: Academic Standing Distribution (doughnut)
        // ==========================================================
        const standingData = @json($standingDist);
        new Chart(document.getElementById('standingChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(standingData),
                datasets: [{
                    data: Object.values(standingData),
                    backgroundColor: [COLORS.good, COLORS.warning, COLORS.danger],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...baseOptions,
                cutout: '55%'
            }
        });

        // ==========================================================
        // CHART 3: Top 5 Students by GPA (horizontal bar)
        // ==========================================================
        const topStudentsData = @json($topStudents);
        new Chart(document.getElementById('topStudentsChart'), {
            type: 'bar',
            data: {
                labels: topStudentsData.map(s => s.name),
                datasets: [{
                    label: 'GPA',
                    data: topStudentsData.map(s => parseFloat(s.gpa)),
                    backgroundColor: COLORS.primary,
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true, max: 4.0,
                        ticks: { stepSize: 0.5, callback: v => v.toFixed(1) }
                    }
                },
                plugins: { ...baseOptions.plugins, legend: { display: false } }
            }
        });

        // ==========================================================
        // CHART 4: Students by Year Level
        // ==========================================================
        const yearLevelData = @json($byYearLevel);
        new Chart(document.getElementById('yearLevelChart'), {
            type: 'bar',
            data: {
                labels: yearLevelData.map(d => 'Year ' + d.year_level),
                datasets: [{
                    label: 'Number of Students',
                    data: yearLevelData.map(d => d.count),
                    backgroundColor: COLORS.secondary,
                    borderColor: '#fff',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                ...baseOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0 }
                    }
                },
                plugins: { ...baseOptions.plugins, legend: { display: false } }
            }
        });
    </script>

@endsection