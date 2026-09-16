@extends('layouts.master')

@section('title', 'Student Roster')

@section('content')

    {{-- Page header --}}
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
        <h2 class="fw-bold">Student Roster</h2>
        <a href="{{ route('students.create') }}" class="btn btn-primary">
            <i class="bi bi-plus-circle me-1"></i> Add Student
        </a>
    </div>

    {{-- Student table card --}}
    <div class="card shadow-hover mb-4">
        <div class="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 class="mb-0">All Students</h5>
            <span class="badge bg-light text-dark">
                {{ $students->total() }} student{{ $students->total() !== 1 ? 's' : '' }}
            </span>
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
                            <th>Units</th>
                            <th>GPA</th>
                            <th>Attendance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($students as $student)
                            <tr>
                                <td><strong>{{ $student->student_id }}</strong></td>
                                <td>{{ $student->name }}</td>
                                <td>{{ $student->program }}</td>
                                <td>{{ $student->year_level }}</td>
                                <td>{{ $student->units }}</td>
                                <td class="{{ $student->gpaColorClass() }} fw-bold">
                                    {{ number_format($student->gpa, 2) }}
                                </td>
                                <td>{{ $student->attendance }}%</td>
                                <td>
                                    <span class="badge {{ $student->statusBadgeClass() }}">
                                        {{ $student->status }}
                                    </span>
                                </td>
                                <td>
                                    <a href="{{ route('students.show', $student) }}"
                                       class="btn btn-sm btn-info text-white" title="View">
                                        <i class="bi bi-eye"></i>
                                    </a>
                                    <a href="{{ route('students.edit', $student) }}"
                                       class="btn btn-sm btn-warning" title="Edit">
                                        <i class="bi bi-pencil"></i>
                                    </a>
                                    <form action="{{ route('students.destroy', $student) }}"
                                          method="POST" class="d-inline"
                                          onsubmit="return confirm('Delete this student? This cannot be undone.');">
                                        @csrf
                                        @method('DELETE')
                                        <button class="btn btn-sm btn-danger" title="Delete">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="text-center py-4">
                                    <i class="bi bi-inbox fs-1 d-block text-muted"></i>
                                    <p class="text-muted mb-0">No students yet. Click "Add Student" to get started.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            {{-- Pagination --}}
            <div class="mt-3">
                {{ $students->links() }}
            </div>
        </div>
    </div>

@endsection