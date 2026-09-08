/**
 * Data Manager Module - With Min/Max Filters & Alerts
 * For Laboratory Exercise 4 - Student Portal
 */

const DataManager = (function() {
    'use strict';

    // API base URL
    const API_BASE = 'api/studentData.php';
    
    // Current state with min/max filters
    let currentFilters = {
        status: 'all',
        search: '',
        minCredits: null,
        maxCredits: null
    };
    
    let cachedData = null;
    let lastFetch = null;
    let updateInterval = null;
    let isInitialized = false;
    let usingFallback = false;

    // FALLBACK DATA WITH ALERTS TRIGGERED
    const FALLBACK_DATA = {
        courses: [
            { id: 1, name: 'Web Systems and Technologies', code: 'WST101', credits: 3, grade: 'A', gradeValue: 4.0, instructor: 'Prof. Santos', schedule: 'MW 10:00-11:30' },
            { id: 2, name: 'Systems Analysis and Design', code: 'SAD201', credits: 3, grade: 'B+', gradeValue: 3.5, instructor: 'Prof. Reyes', schedule: 'TTh 13:00-14:30' },
            { id: 3, name: 'Quantitative Methods', code: 'QM301', credits: 3, grade: 'B', gradeValue: 3.0, instructor: 'Prof. Garcia', schedule: 'MW 14:00-15:30' },
            { id: 4, name: 'Advanced Database Systems', code: 'ADS401', credits: 3, grade: 'A-', gradeValue: 3.7, instructor: 'Prof. Cruz', schedule: 'TTh 10:00-11:30' },
            { id: 5, name: 'Systems Integration and Architecture', code: 'SIA501', credits: 3, grade: 'C+', gradeValue: 2.5, instructor: 'Prof. Mendoza', schedule: 'F 09:00-12:00' },
            { id: 6, name: 'Network Security', code: 'NS601', credits: 3, grade: 'C', gradeValue: 2.0, instructor: 'Prof. Torres', schedule: 'MW 16:00-17:30' }
        ],
        assignments: [
            { id: 1, courseId: 1, title: 'HTML/CSS Project', dueDate: getDateDays(1), status: 'Pending', score: null },
            { id: 2, courseId: 1, title: 'JavaScript Quiz', dueDate: getDateDays(2), status: 'Pending', score: null },
            { id: 3, courseId: 2, title: 'Use Case Diagram', dueDate: getDateDays(3), status: 'Pending', score: null },
            { id: 4, courseId: 2, title: 'System Proposal', dueDate: getDateDays(-5), status: 'Completed', score: 88 },
            { id: 5, courseId: 3, title: 'Statistics Homework', dueDate: getDateDays(4), status: 'Pending', score: null },
            { id: 6, courseId: 3, title: 'Data Analysis Report', dueDate: getDateDays(-3), status: 'Completed', score: 76 },
            { id: 7, courseId: 4, title: 'Database Design', dueDate: getDateDays(5), status: 'Pending', score: null },
            { id: 8, courseId: 4, title: 'SQL Project', dueDate: getDateDays(-7), status: 'Completed', score: 94 },
            { id: 9, courseId: 5, title: 'Integration Report', dueDate: getDateDays(6), status: 'Pending', score: null },
            { id: 10, courseId: 6, title: 'Security Audit', dueDate: getDateDays(7), status: 'Pending', score: null }
        ],
        attendance: [
            { courseId: 1, date: getDateDays(-4), status: 'Present' },
            { courseId: 1, date: getDateDays(-6), status: 'Present' },
            { courseId: 1, date: getDateDays(-8), status: 'Present' },
            { courseId: 2, date: getDateDays(-4), status: 'Present' },
            { courseId: 2, date: getDateDays(-6), status: 'Absent' },
            { courseId: 2, date: getDateDays(-8), status: 'Present' },
            { courseId: 3, date: getDateDays(-4), status: 'Present' },
            { courseId: 3, date: getDateDays(-6), status: 'Present' },
            { courseId: 3, date: getDateDays(-8), status: 'Present' },
            { courseId: 4, date: getDateDays(-4), status: 'Present' },
            { courseId: 4, date: getDateDays(-6), status: 'Present' },
            { courseId: 4, date: getDateDays(-8), status: 'Present' },
            { courseId: 5, date: getDateDays(-4), status: 'Absent' },
            { courseId: 5, date: getDateDays(-6), status: 'Present' },
            { courseId: 5, date: getDateDays(-8), status: 'Absent' },
            { courseId: 6, date: getDateDays(-4), status: 'Present' },
            { courseId: 6, date: getDateDays(-6), status: 'Present' },
            { courseId: 6, date: getDateDays(-8), status: 'Present' }
        ],
        activities: [
            { date: getDateDays(0) + ' 14:30', activity: 'Submitted assignment for Web Systems and Technologies', status: 'Completed' },
            { date: getDateDays(0) + ' 11:15', activity: 'Attended Systems Analysis & Design lecture', status: 'Present' },
            { date: getDateDays(-1) + ' 16:00', activity: 'Quiz scheduled for Friday - Quantitative Methods', status: 'Pending' },
            { date: getDateDays(-1) + ' 09:30', activity: 'Project proposal approved by professor', status: 'Approved' },
            { date: getDateDays(-2) + ' 13:45', activity: 'Submitted Advanced Database Systems project', status: 'Completed' },
            { date: getDateDays(-2) + ' 10:00', activity: 'Missed Systems Integration and Architecture lecture', status: 'Absent' }
        ],
        gpaHistory: [
            { semester: '2025-1', gpa: 3.20 },
            { semester: '2025-2', gpa: 3.35 },
            { semester: '2026-1', gpa: 3.10 }
        ]
    };

    function getDateDays(offset) {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().slice(0, 10);
    }

    async function apiRequest(action, method = 'GET', data = null) {
        try {
            const url = `${API_BASE}?action=${action}`;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }
            
            return result.data;
        } catch (error) {
            console.warn('API request failed:', error.message);
            return null;
        }
    }

    async function fetchAllData() {
        try {
            const data = await apiRequest('all');
            if (data) {
                cachedData = data;
                lastFetch = new Date();
                isInitialized = true;
                usingFallback = false;
                console.log('Data loaded from API');
                return data;
            }
        } catch (error) {
            console.warn('API fetch failed, using fallback data');
        }
        
        cachedData = FALLBACK_DATA;
        lastFetch = new Date();
        isInitialized = true;
        usingFallback = true;
        console.log('Data loaded from fallback with alerts triggered');
        return cachedData;
    }

    async function loadData() {
        if (cachedData && lastFetch && (new Date() - lastFetch) < 30000) {
            return cachedData;
        }
        return await fetchAllData();
    }

    function calculateGPA(courses) {
        let totalPoints = 0;
        let totalCredits = 0;
        
        courses.forEach(course => {
            if (course.gradeValue !== undefined && course.gradeValue > 0) {
                totalPoints += course.gradeValue * course.credits;
                totalCredits += course.credits;
            }
        });
        
        return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
    }

    function getAttendanceRate(attendance) {
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'Present').length;
        return total > 0 ? Math.round((present / total) * 100) : 0;
    }

    function getPendingAssignments(assignments) {
        return assignments.filter(a => a.status === 'Pending').length;
    }

    function getUpcomingDeadlines(assignments) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return assignments.filter(a => {
            if (a.status === 'Completed') return false;
            const dueDate = new Date(a.dueDate);
            return dueDate >= today && dueDate <= nextWeek;
        });
    }

    function getLowPerformanceCourses(courses) {
        return courses.filter(c => {
            return c.gradeValue && c.gradeValue < 2.5;
        });
    }

    function getAttendanceAlerts(courses, attendance) {
        const courseAttendance = {};
        attendance.forEach(a => {
            if (!courseAttendance[a.courseId]) {
                courseAttendance[a.courseId] = { present: 0, total: 0 };
            }
            courseAttendance[a.courseId].total++;
            if (a.status === 'Present') {
                courseAttendance[a.courseId].present++;
            }
        });
        
        const alerts = [];
        for (const [courseId, stats] of Object.entries(courseAttendance)) {
            const rate = Math.round((stats.present / stats.total) * 100);
            if (rate < 70) {
                const course = courses.find(c => c.id === parseInt(courseId));
                if (course) {
                    alerts.push({
                        courseId: parseInt(courseId),
                        courseName: course.name,
                        attendanceRate: rate,
                        message: `Attendance rate is ${rate}% - below 70% threshold`
                    });
                }
            }
        }
        return alerts;
    }

    // Filter courses by min/max credits
    function filterCoursesByCredits(courses) {
        let filtered = [...courses];
        
        if (currentFilters.minCredits !== null && currentFilters.minCredits !== '') {
            filtered = filtered.filter(c => c.credits >= parseFloat(currentFilters.minCredits));
        }
        if (currentFilters.maxCredits !== null && currentFilters.maxCredits !== '') {
            filtered = filtered.filter(c => c.credits <= parseFloat(currentFilters.maxCredits));
        }
        
        return filtered;
    }

    function filterActivities(activities) {
        let filtered = [...activities];
        
        if (currentFilters.status !== 'all') {
            filtered = filtered.filter(a => a.status === currentFilters.status);
        }
        
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            filtered = filtered.filter(a => 
                a.activity.toLowerCase().includes(searchLower) ||
                a.date.includes(searchLower)
            );
        }
        
        return filtered;
    }

    // Public API
    return {
        init: async function() {
            try {
                await fetchAllData();
                console.log('DataManager initialized');
                return true;
            } catch (error) {
                console.error('Failed to initialize DataManager:', error);
                cachedData = FALLBACK_DATA;
                isInitialized = true;
                return true;
            }
        },

        getStudentData: async function() {
            return await loadData();
        },

        getStatistics: async function() {
            const data = await loadData();
            return {
                gpa: calculateGPA(data.courses),
                courseCount: data.courses.length,
                pendingAssignments: getPendingAssignments(data.assignments),
                attendanceRate: getAttendanceRate(data.attendance)
            };
        },

        getGradeDistribution: async function() {
            const data = await loadData();
            const grades = data.courses.map(c => c.grade);
            const distribution = {};
            
            grades.forEach(grade => {
                distribution[grade] = (distribution[grade] || 0) + 1;
            });
            
            return distribution;
        },

        getCoursePerformance: async function() {
            const data = await loadData();
            return data.courses.map(c => ({
                name: c.code,
                gradeValue: c.gradeValue
            }));
        },

        getAssignmentStatus: async function() {
            const data = await loadData();
            const statuses = data.assignments.map(a => a.status);
            const distribution = {};
            
            statuses.forEach(status => {
                distribution[status] = (distribution[status] || 0) + 1;
            });
            
            return distribution;
        },

        getAttendanceTrend: async function() {
            const data = await loadData();
            const weeks = {};
            data.attendance.forEach(a => {
                const date = new Date(a.date);
                const weekNum = getWeekNumber(date);
                const key = `Week ${weekNum}`;
                if (!weeks[key]) {
                    weeks[key] = { present: 0, total: 0 };
                }
                weeks[key].total++;
                if (a.status === 'Present') {
                    weeks[key].present++;
                }
            });
            
            const result = [];
            for (const [week, weekData] of Object.entries(weeks)) {
                result.push({
                    week: week,
                    rate: Math.round((weekData.present / weekData.total) * 100)
                });
            }
            return result;
        },

        getActivities: async function() {
            const data = await loadData();
            return filterActivities(data.activities);
        },

        getFilteredCourses: async function() {
            const data = await loadData();
            return filterCoursesByCredits(data.courses);
        },

        getUpcomingDeadlines: async function() {
            const data = await loadData();
            return getUpcomingDeadlines(data.assignments);
        },

        getLowPerformanceAlerts: async function() {
            const data = await loadData();
            return getLowPerformanceCourses(data.courses);
        },

        getAttendanceAlerts: async function() {
            const data = await loadData();
            return getAttendanceAlerts(data.courses, data.attendance);
        },

        getAllAlerts: async function() {
            const [deadlines, lowPerformance, attendanceAlerts] = await Promise.all([
                this.getUpcomingDeadlines(),
                this.getLowPerformanceAlerts(),
                this.getAttendanceAlerts()
            ]);
            
            const alerts = [];
            
            deadlines.forEach(a => {
                const dueDate = new Date(a.dueDate);
                const today = new Date();
                const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                let priority = 'warning';
                let icon = 'bi-exclamation-triangle-fill';
                let bgClass = 'bg-warning text-dark';
                
                if (daysUntil <= 1) {
                    priority = 'danger';
                    icon = 'bi-exclamation-triangle-fill';
                    bgClass = 'bg-danger text-white';
                } else if (daysUntil <= 3) {
                    priority = 'warning';
                    icon = 'bi-clock-fill';
                    bgClass = 'bg-warning text-dark';
                } else {
                    priority = 'info';
                    icon = 'bi-clock-history';
                    bgClass = 'bg-info text-white';
                }
                
                const course = cachedData.courses.find(c => c.id === a.courseId);
                alerts.push({
                    type: 'deadline',
                    priority: priority,
                    icon: icon,
                    bgClass: bgClass,
                    title: `📋 Assignment Due Soon!`,
                    message: `"${a.title}" for ${course ? course.code : 'course'} is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
                    dueDate: a.dueDate,
                    daysUntil: daysUntil
                });
            });
            
            lowPerformance.forEach(c => {
                alerts.push({
                    type: 'performance',
                    priority: 'danger',
                    icon: 'bi-graph-down',
                    bgClass: 'bg-danger text-white',
                    title: `⚠️ Low Performance Alert!`,
                    message: `${c.name} (${c.code}) has a grade of ${c.grade} (${c.gradeValue.toFixed(1)} GPA). Please seek help.`,
                    courseId: c.id
                });
            });
            
            attendanceAlerts.forEach(a => {
                alerts.push({
                    type: 'attendance',
                    priority: 'warning',
                    icon: 'bi-person-x-fill',
                    bgClass: 'bg-warning text-dark',
                    title: `👤 Attendance Alert!`,
                    message: `${a.courseName}: ${a.message}`,
                    courseId: a.courseId,
                    rate: a.attendanceRate
                });
            });
            
            const priorityOrder = { danger: 0, warning: 1, info: 2 };
            alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            
            return alerts;
        },

        setFilter: function(filterType, value) {
            if (filterType === 'status') {
                currentFilters.status = value;
            } else if (filterType === 'search') {
                currentFilters.search = value;
            } else if (filterType === 'minCredits') {
                currentFilters.minCredits = value;
            } else if (filterType === 'maxCredits') {
                currentFilters.maxCredits = value;
            }
            document.dispatchEvent(new CustomEvent('dataFiltered'));
        },

        clearAllFilters: function() {
            currentFilters = {
                status: 'all',
                search: '',
                minCredits: null,
                maxCredits: null
            };
            document.dispatchEvent(new CustomEvent('dataFiltered'));
        },

        getCurrentFilters: function() {
            return { ...currentFilters };
        },

        exportToCSV: async function() {
            const activities = await this.getActivities();
            if (activities.length === 0) return null;
            
            const headers = ['Date', 'Activity', 'Status'];
            const rows = activities.map(a => [a.date, a.activity, a.status]);
            
            let csv = headers.join(',') + '\n';
            rows.forEach(row => {
                const escapedRow = row.map(cell => {
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                        return `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                });
                csv += escapedRow.join(',') + '\n';
            });
            
            return csv;
        },

        simulateUpdate: async function() {
            try {
                const data = await loadData();
                const pendingAssignments = data.assignments.filter(a => a.status === 'Pending');
                
                if (pendingAssignments.length > 0) {
                    const randomIndex = Math.floor(Math.random() * pendingAssignments.length);
                    const assignment = pendingAssignments[randomIndex];
                    
                    assignment.status = 'Completed';
                    assignment.score = Math.floor(Math.random() * 30) + 70;
                    
                    const newActivity = {
                        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                        activity: `Completed: ${assignment.title}`,
                        status: 'Completed'
                    };
                    data.activities.unshift(newActivity);
                    
                    if (data.activities.length > 10) {
                        data.activities.pop();
                    }
                    
                    cachedData = data;
                    
                    return {
                        message: `✅ Assignment "${assignment.title}" has been completed! Score: ${assignment.score}%`,
                        assignment: assignment
                    };
                }
                return null;
            } catch (error) {
                console.error('Simulation failed:', error);
                return null;
            }
        },

        startRealTimeUpdates: function(intervalMs = 30000) {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
            
            updateInterval = setInterval(async () => {
                try {
                    const result = await this.simulateUpdate();
                    if (result) {
                        document.dispatchEvent(new CustomEvent('dataUpdated', {
                            detail: result
                        }));
                    }
                } catch (error) {
                    console.error('Real-time update failed:', error);
                }
            }, intervalMs);
        },

        stopRealTimeUpdates: function() {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        },

        refresh: async function() {
            await fetchAllData();
            document.dispatchEvent(new CustomEvent('dataRefreshed'));
        },

        isReady: function() {
            return isInitialized;
        },

        isUsingFallback: function() {
            return usingFallback;
        }
    };

    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
})();