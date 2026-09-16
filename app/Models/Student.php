<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes.
     */
    protected $fillable = [
        'student_id',
        'name',
        'program',
        'year_level',
        'units',
        'gpa',
        'attendance',
        'status',
    ];

    /**
     * Cast attributes to proper types.
     */
    protected $casts = [
        'gpa' => 'decimal:2',
        'year_level' => 'integer',
        'units' => 'integer',
        'attendance' => 'integer',
    ];

    // ==============================================================
    // BUSINESS LOGIC HELPERS
    // ==============================================================

    /**
     * Compute academic standing from GPA.
     *   >= 2.50  → Good Standing
     *   1.75-2.49 → At Risk
     *   < 1.75   → Probation
     */
    public static function computeStatus(float $gpa): string
    {
        if ($gpa >= 2.5)  return 'Good Standing';
        if ($gpa >= 1.75) return 'At Risk';
        return 'Probation';
    }

    /**
     * Is this student at risk (below Good Standing)?
     */
    public function isAtRisk(): bool
    {
        return $this->status === 'At Risk';
    }

    /**
     * Is this student on probation?
     */
    public function isOnProbation(): bool
    {
        return $this->status === 'Probation';
    }

    /**
     * Is this student in good standing?
     */
    public function isGoodStanding(): bool
    {
        return $this->status === 'Good Standing';
    }

    /**
     * Get the Bootstrap badge class for the status.
     */
    public function statusBadgeClass(): string
    {
        return match ($this->status) {
            'Good Standing' => 'bg-success',
            'At Risk'       => 'bg-warning text-dark',
            'Probation'     => 'bg-danger',
            default         => 'bg-secondary',
        };
    }

    /**
     * Get the text color class for GPA value.
     */
    public function gpaColorClass(): string
    {
        if ($this->gpa < 1.75) return 'text-danger';
        if ($this->gpa < 2.50) return 'text-warning';
        return 'text-success';
    }

    /**
     * Auto-compute and set status when saving.
     */
    protected static function booted(): void
    {
        static::saving(function (Student $student) {
            $student->status = self::computeStatus((float) $student->gpa);
        });
    }
}