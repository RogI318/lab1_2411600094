<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::latest()->paginate(10);
        return view('students.index', compact('students'));
    }

    public function create()
    {
        return view('students.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules(), $this->messages());
        Student::create($validated);

        return redirect()
            ->route('students.index')
            ->with('success', 'Student added successfully.');
    }

    public function show(Student $student)
    {
        return view('students.show', compact('student'));
    }

    public function edit(Student $student)
    {
        return view('students.edit', compact('student'));
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate(
            $this->rules($student->id),
            $this->messages()
        );

        $student->update($validated);

        return redirect()
            ->route('students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()
            ->route('students.index')
            ->with('success', 'Student deleted successfully.');
    }

    private function rules($ignoreId = null): array
    {
        return [
            'student_id'  => 'required|string|max:50|unique:students,student_id'
                                . ($ignoreId ? ",$ignoreId" : ''),
            'name'        => 'required|string|max:255',
            'program'     => 'required|string|max:100',
            'year_level'  => 'required|integer|min:1|max:5',
            'units'       => 'required|integer|min:0|max:30',
            'gpa'         => 'required|numeric|min:0|max:4',
            'attendance'  => 'required|integer|min:0|max:100',
        ];
    }

    private function messages(): array
    {
        return [
            'student_id.required' => 'Please provide a student ID (e.g., 2026-00101).',
            'student_id.unique'   => 'This student ID already exists.',
            'name.required'       => "Please provide the student's full name.",
            'program.required'    => 'Please select or enter a program.',
            'year_level.min'      => 'Year level must be between 1 and 5.',
            'year_level.max'      => 'Year level must be between 1 and 5.',
            'units.max'           => 'Units cannot exceed 30.',
            'gpa.min'             => 'GPA cannot be negative.',
            'gpa.max'             => 'GPA cannot exceed 4.00.',
            'attendance.min'      => 'Attendance must be between 0 and 100.',
            'attendance.max'      => 'Attendance must be between 0 and 100.',
        ];
    }
}