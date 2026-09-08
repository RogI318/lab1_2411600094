/**
 * Data Manager Module - Handles all student data operations
 * For Laboratory Exercise 4 - Student Portal
 */

class DataManager {
    constructor() {
        this.courses = [];
        this.assignments = [];
        this.filteredCourses = [];
        this.currentFilters = {
            department: 'all',
            status: 'all',
            minCredits: null,
            maxCredits: null,
            searchQuery: ''
        };
        this.listeners = [];
        this.lastUpdate = null;
        this.updateInterval = null;
        this.studentName = localStorage.getItem('user') || 'Student';
    }

    /**
     * Initialize data - loads from API or uses sample data
     */
    async initializeData() {
        try {
            // Try to fetch from API first
            const response = await fetch('api/studentData.php');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.courses = data.courses || [];
                    this.assignments = data.assignments || [];
                } else {
                    this.loadSampleData();
                }
            } else {
                this.loadSampleData();
            }
        } catch (error) {
            console.log('API not available, using sample data');
            this.loadSampleData();
        }

        this.filteredCourses = [...this.courses];
        this.lastUpdate = new Date();
        this.notifyListeners();
        this.startRealTimeUpdates();
        
        return this.courses;
    }

    /**
     * Load sample student data
     */
    loadSampleData() {
        this.courses = [
            { 
                id: 1, 
                code: 'CS301', 
                name: 'Web Systems and Technologies', 
                department: 'Computer Science', 
                credits: 3, 
                grade: 92, 
                status: 'active',
                progress: 85,
                instructor: 'Prof. Santos',
                schedule: 'MWF 10:00-11:00'
            },
            { 
                id: 2, 
                code: 'CS302', 
                name: 'Systems Analysis and Design', 
                department: 'Computer Science', 
                credits: 3, 
                grade: 88, 
                status: 'active',
                progress: 75,
                instructor: 'Prof. Reyes',
                schedule: 'TTh 09:00-10:30'
            },
            { 
                id: 3, 
                code: 'MATH201', 
                name: 'Quantitative Methods', 
                department: 'Mathematics', 
                credits: 3, 
                grade: 76, 
                status: 'active',
                progress: 60,
                instructor: 'Prof. Gomez',
                schedule: 'MWF 13:00-14:00'
            },
            { 
                id: 4, 
                code: 'CS202', 
                name: 'Advanced Database Systems', 
                department: 'Computer Science', 
                credits: 3, 
                grade: 94, 
                status: 'completed',
                progress: 100,
                instructor: 'Prof. Cruz',
                schedule: 'TTh 13:00-14:30'
            },
            { 
                id: 5, 
                code: 'IT301', 
                name: 'Systems Integration and Architecture', 
                department: 'Information Technology', 
                credits: 3, 
                grade: 70, 
                status: 'active',
                progress: 50,
                instructor: 'Prof. Tan',
                schedule: 'MWF 15:00-16:00'
            },
            { 
                id: 6, 
                code: 'GE101', 
                name: 'English for Academic Purposes', 
                department: 'General Education', 
                credits: 3, 
                grade: 85, 
                status: 'completed',
                progress: 100,
                instructor: 'Prof. Lim',
                schedule: 'TTh 16:00-17:30'
            },
            { 
                id: 7, 
                code: 'CS303', 
                name: 'Software Engineering', 
                department: 'Computer Science', 
                credits: 3, 
                grade: 0, 
                status: 'pending',
                progress: 0,
                instructor: 'Prof. Santos',
                schedule: 'MWF 08:00-09:00'
            }
        ];

        this.assignments = [
            { id: 1, courseId: 1, title: 'Assignment 1: HTML/CSS Project', dueDate: '2026-09-15', status: 'submitted', grade: 90 },
            { id: 2, courseId: 1, title: 'Assignment 2: JavaScript Implementation', dueDate: '2026-09-22', status: 'pending', grade: null },
            { id: 3, courseId: 2, title: 'Systems Analysis Project', dueDate: '2026-09-20', status: 'pending', grade: null },
            { id: 4, courseId: 3, title: 'Statistical Analysis Report', dueDate: '2026-09-18', status: 'submitted', grade: 78 },
            { id: 5, courseId: 4, title: 'Database Design Project', dueDate: '2026-08-30', status: 'submitted', grade: 95 },
            { id: 6, courseId: 5, title: 'Integration Project', dueDate: '2026-09-25', status: 'pending', grade: null }
        ];
    }

    /**
     * Get all courses (with current filters applied)
     */
    getCourses() {
        return this.filteredCourses;
    }

    /**
     * Get all courses (unfiltered)
     */
    getAllCourses() {
        return this.courses;
    }

    /**
     * Get course by ID
     */
    getCourseById(id) {
        return this.courses.find(c => c.id === id);
    }

    /**
     * Get courses by department
     */
    getCoursesByDepartment(department) {
        if (department === 'all') return this.courses;
        return this.courses.filter(c => c.department === department);
    }

    /**
     * Get upcoming deadlines (assignments due in the next 7 days)
     */
    getUpcomingDeadlines() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return this.assignments.filter(a => {
            if (a.status === 'submitted') return false;
            const dueDate = new Date(a.dueDate);
            return dueDate >= today && dueDate <= nextWeek;
        });
    }

    /**
     * Get pending assignments
     */
    getPendingAssignments() {
        return this.assignments.filter(a => a.status === 'pending');
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const totalCourses = this.courses.length;
        const activeCourses = this.courses.filter(c => c.status === 'active').length;
        const completedCourses = this.courses.filter(c => c.status === 'completed').length;
        const pendingCourses = this.courses.filter(c => c.status === 'pending').length;
        
        // Calculate GPA (average of grades)
        const gradedCourses = this.courses.filter(c => c.grade > 0);
        const gpa = gradedCourses.length > 0 
            ? gradedCourses.reduce((sum, c) => sum + c.grade, 0) / gradedCourses.length 
            : 0;

        // Calculate attendance (random for demo)
        const attendance = 92;

        const pendingAssignments = this.getPendingAssignments().length;
        const upcomingDeadlines = this.getUpcomingDeadlines().length;

        return {
            totalCourses,
            activeCourses,
            completedCourses,
            pendingCourses,
            gpa: parseFloat(gpa.toFixed(2)),
            attendance,
            pendingAssignments,
            upcomingDeadlines
        };
    }

    /**
     * Get grade distribution by course department
     */
    getGradeDistribution() {
        const distribution = {};
        this.courses.forEach(course => {
            if (course.grade > 0) {
                if (!distribution[course.department]) {
                    distribution[course.department] = {
                        department: course.department,
                        grades: [],
                        average: 0
                    };
                }
                distribution[course.department].grades.push(course.grade);
            }
        });

        Object.keys(distribution).forEach(key => {
            const grades = distribution[key].grades;
            distribution[key].average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        });

        return Object.values(distribution);
    }

    /**
     * Get assignment status distribution
     */
    getAssignmentStatus() {
        const submitted = this.assignments.filter(a => a.status === 'submitted').length;
        const pending = this.assignments.filter(a => a.status === 'pending').length;
        return {
            'Submitted': submitted,
            'Pending': pending
        };
    }

    /**
     * Get course performance data
     */
    getCoursePerformance() {
        return this.courses
            .filter(c => c.grade > 0)
            .map(c => ({
                name: c.code,
                grade: c.grade,
                department: c.department
            }))
            .sort((a, b) => a.grade - b.grade);
    }

    /**
     * Apply filters to courses
     */
    applyFilters() {
        let filtered = [...this.courses];

        // Department filter
        if (this.currentFilters.department !== 'all') {
            filtered = filtered.filter(c => c.department === this.currentFilters.department);
        }

        // Status filter
        if (this.currentFilters.status !== 'all') {
            filtered = filtered.filter(c => c.status === this.currentFilters.status);
        }

        // Credit hours range filter
        if (this.currentFilters.minCredits !== null && this.currentFilters.minCredits !== '') {
            filtered = filtered.filter(c => c.credits >= parseFloat(this.currentFilters.minCredits));
        }
        if (this.currentFilters.maxCredits !== null && this.currentFilters.maxCredits !== '') {
            filtered = filtered.filter(c => c.credits <= parseFloat(this.currentFilters.maxCredits));
        }

        // Search filter
        if (this.currentFilters.searchQuery && this.currentFilters.searchQuery.trim() !== '') {
            const query = this.currentFilters.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.code.toLowerCase().includes(query) ||
                c.department.toLowerCase().includes(query) ||
                c.instructor.toLowerCase().includes(query)
            );
        }

        this.filteredCourses = filtered;
        this.notifyListeners();
        return this.filteredCourses;
    }

    /**
     * Set a filter value
     */
    setFilter(filterName, value) {
        this.currentFilters[filterName] = value;
        this.applyFilters();
    }

    /**
     * Set search query
     */
    setSearchQuery(query) {
        this.currentFilters.searchQuery = query;
        this.applyFilters();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {
            department: 'all',
            status: 'all',
            minCredits: null,
            maxCredits: null,
            searchQuery: ''
        };
        this.filteredCourses = [...this.courses];
        this.notifyListeners();
        return this.filteredCourses;
    }

    /**
     * Get current filters
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Register a listener for data changes
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of data changes
     */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.filteredCourses));
    }

    /**
     * Export data to CSV format
     */
    exportToCSV(courses = null) {
        const dataToExport = courses || this.filteredCourses || this.courses;
        if (!dataToExport || dataToExport.length === 0) {
            return null;
        }

        const headers = ['Course Code', 'Course Name', 'Department', 'Credits', 'Grade', 'Status', 'Instructor'];
        const rows = dataToExport.map(c => [
            `"${c.code}"`,
            `"${c.name}"`,
            `"${c.department}"`,
            c.credits,
            c.grade > 0 ? c.grade : 'N/A',
            `"${c.status}"`,
            `"${c.instructor}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Simulate real-time updates (grade changes, new assignments, etc.)
     */
    startRealTimeUpdates(intervalMs = 30000) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.simulateUpdate();
        }, intervalMs);
    }

    /**
     * Stop real-time updates
     */
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Simulate a data change
     */
    simulateUpdate() {
        // Randomly select a course and update its progress
        const randomIndex = Math.floor(Math.random() * this.courses.length);
        const course = this.courses[randomIndex];
        
        if (course.status === 'active' && course.progress < 100) {
            const oldProgress = course.progress;
            const increase = Math.floor(Math.random() * 10) + 1;
            const newProgress = Math.min(100, oldProgress + increase);
            
            if (newProgress !== oldProgress) {
                course.progress = newProgress;
                
                // If completed, update status
                if (newProgress === 100 && course.status === 'active') {
                    course.status = 'completed';
                    // Random grade
                    course.grade = Math.floor(Math.random() * 20) + 80; // 80-100
                }

                // Update filtered courses
                const filteredIndex = this.filteredCourses.findIndex(c => c.id === course.id);
                if (filteredIndex !== -1) {
                    this.filteredCourses[filteredIndex] = course;
                }

                this.lastUpdate = new Date();
                this.notifyListeners();

                // Log the update
                console.log(`[Real-time] ${course.code}: Progress ${oldProgress}% → ${newProgress}%`);
            }
        }
    }

    /**
     * Get last update time
     */
    getLastUpdate() {
        return this.lastUpdate;
    }

    /**
     * Get student name
     */
    getStudentName() {
        return this.studentName;
    }
}

// Create a singleton instance
const dataManager = new DataManager();