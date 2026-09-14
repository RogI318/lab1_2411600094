/**
 * Data Manager - Student Portal Admin
 */

const DataManager = (function () {
    'use strict';

    const API_BASE = 'api/studentData.php';

    const FALLBACK = {
        programs: ["BS Computer Science", "BS Information Technology", "BS Information Systems", "BS Data Science"],
        standingRules: { goodStanding: 2.5, probation: 1.75 },

        courses: [
            { code: "WST101", name: "Web Systems and Technologies", instructor: "Prof. Santos" },
            { code: "SAD201", name: "Systems Analysis and Design", instructor: "Prof. Reyes" },
            { code: "QM301", name: "Quantitative Methods", instructor: "Prof. Garcia" },
            { code: "ADS401", name: "Advanced Database Systems", instructor: "Prof. Cruz" },
            { code: "SIA501", name: "Systems Integration and Architecture", instructor: "Prof. Mendoza" },
            { code: "NS601", name: "Network Security", instructor: "Prof. Torres" },
            { code: "DS701", name: "Data Structures and Algorithms", instructor: "Prof. Lim" },
            { code: "CC801", name: "Cloud Computing", instructor: "Prof. Bautista" }
        ],
        students: [
            { id: "2026-00101", name: "Juan Dela Cruz", program: "BS Computer Science", year: 3, units: 18, gpa: 3.75, attendance: 94, pendingAssignments: 1 },
            { id: "2026-00102", name: "Maria Santos", program: "BS Information Technology", year: 2, units: 15, gpa: 2.10, attendance: 68, pendingAssignments: 4 },
            { id: "2026-00103", name: "Pedro Reyes", program: "BS Information Systems", year: 4, units: 21, gpa: 1.65, attendance: 55, pendingAssignments: 5 },
            { id: "2026-00104", name: "Ana Villanueva", program: "BS Data Science", year: 1, units: 18, gpa: 3.85, attendance: 98, pendingAssignments: 0 },
            { id: "2026-00105", name: "Jose Mendoza", program: "BS Computer Science", year: 3, units: 18, gpa: 3.20, attendance: 88, pendingAssignments: 2 },
            { id: "2026-00106", name: "Liza Ramos", program: "BS Information Technology", year: 4, units: 21, gpa: 2.85, attendance: 82, pendingAssignments: 3 },
            { id: "2026-00107", name: "Carlos Bautista", program: "BS Information Systems", year: 2, units: 15, gpa: 2.40, attendance: 72, pendingAssignments: 4 },
            { id: "2026-00108", name: "Sofia Garcia", program: "BS Data Science", year: 3, units: 18, gpa: 3.55, attendance: 91, pendingAssignments: 1 },
            { id: "2026-00109", name: "Miguel Torres", program: "BS Computer Science", year: 1, units: 18, gpa: 1.90, attendance: 60, pendingAssignments: 5 },
            { id: "2026-00110", name: "Isabella Cruz", program: "BS Information Technology", year: 3, units: 18, gpa: 3.95, attendance: 99, pendingAssignments: 0 },
            { id: "2026-00111", name: "Rafael Aquino", program: "BS Information Systems", year: 4, units: 21, gpa: 2.65, attendance: 78, pendingAssignments: 3 },
            { id: "2026-00112", name: "Camila Navarro", program: "BS Data Science", year: 2, units: 15, gpa: 3.10, attendance: 85, pendingAssignments: 2 },
            { id: "2026-00113", name: "Diego Fernandez", program: "BS Computer Science", year: 4, units: 21, gpa: 2.30, attendance: 70, pendingAssignments: 4 },
            { id: "2026-00114", name: "Valeria Lim", program: "BS Information Technology", year: 1, units: 18, gpa: 3.65, attendance: 95, pendingAssignments: 1 },
            { id: "2026-00115", name: "Andres Castillo", program: "BS Information Systems", year: 3, units: 18, gpa: 1.55, attendance: 52, pendingAssignments: 5 },
            { id: "2026-00116", name: "Natalia Domingo", program: "BS Data Science", year: 4, units: 21, gpa: 3.40, attendance: 89, pendingAssignments: 1 },
            { id: "2026-00117", name: "Gabriel Salazar", program: "BS Computer Science", year: 2, units: 15, gpa: 2.75, attendance: 80, pendingAssignments: 3 },
            { id: "2026-00118", name: "Beatriz Mercado", program: "BS Information Technology", year: 3, units: 18, gpa: 3.25, attendance: 87, pendingAssignments: 2 },
            { id: "2026-00119", name: "Emilio Pascual", program: "BS Information Systems", year: 1, units: 18, gpa: 2.05, attendance: 66, pendingAssignments: 4 },
            { id: "2026-00120", name: "Daniela Rivera", program: "BS Data Science", year: 3, units: 18, gpa: 3.80, attendance: 96, pendingAssignments: 0 },
            { id: "2026-00121", name: "Hector Soriano", program: "BS Computer Science", year: 4, units: 21, gpa: 2.55, attendance: 74, pendingAssignments: 3 },
            { id: "2026-00122", name: "Patricia Velasco", program: "BS Information Technology", year: 2, units: 15, gpa: 3.30, attendance: 90, pendingAssignments: 1 },
            { id: "2026-00123", name: "Ricardo Ong", program: "BS Information Systems", year: 3, units: 18, gpa: 1.85, attendance: 58, pendingAssignments: 5 },
            { id: "2026-00124", name: "Teresa Lorenzo", program: "BS Data Science", year: 1, units: 18, gpa: 3.50, attendance: 93, pendingAssignments: 1 },
            { id: "2026-00125", name: "Fernando Alonzo", program: "BS Computer Science", year: 2, units: 15, gpa: 2.95, attendance: 84, pendingAssignments: 2 },
            { id: "2026-00126", name: "Gabriela Ramos", program: "BS Information Technology", year: 4, units: 21, gpa: 3.15, attendance: 86, pendingAssignments: 2 },
            { id: "2026-00127", name: "Mario Espinosa", program: "BS Information Systems", year: 2, units: 15, gpa: 2.20, attendance: 69, pendingAssignments: 4 },
            { id: "2026-00128", name: "Lucia Yulo", program: "BS Data Science", year: 3, units: 18, gpa: 3.70, attendance: 97, pendingAssignments: 0 },
            { id: "2026-00129", name: "Enrique Villa", program: "BS Computer Science", year: 1, units: 18, gpa: 2.35, attendance: 71, pendingAssignments: 4 },
            { id: "2026-00130", name: "Rosario Delgado", program: "BS Information Technology", year: 3, units: 18, gpa: 3.60, attendance: 92, pendingAssignments: 1 }
        ],
        activities: [
            { id: 1, timestamp: "2026-09-14 14:30", studentId: "2026-00101", studentName: "Juan Dela Cruz", activity: "Grade posted for Web Systems and Technologies", category: "Grades", status: "Completed" },
            { id: 2, timestamp: "2026-09-14 11:15", studentId: "2026-00102", studentName: "Maria Santos", activity: "Attendance marked for Systems Analysis lecture", category: "Attendance", status: "Present" },
            { id: 3, timestamp: "2026-09-14 09:00", studentId: "2026-00103", studentName: "Pedro Reyes", activity: "Advisory note issued — GPA below probation threshold", category: "Advisory", status: "Pending" },
            { id: 4, timestamp: "2026-09-13 16:00", studentId: "2026-00104", studentName: "Ana Villanueva", activity: "Enrollment confirmed for next semester", category: "Enrollment", status: "Approved" },
            { id: 5, timestamp: "2026-09-13 14:20", studentId: "2026-00109", studentName: "Miguel Torres", activity: "Missed Network Security laboratory session", category: "Attendance", status: "Absent" },
            { id: 6, timestamp: "2026-09-13 10:45", studentId: "2026-00110", studentName: "Isabella Cruz", activity: "Perfect score on Database Systems final exam", category: "Grades", status: "Completed" },
            { id: 7, timestamp: "2026-09-12 15:30", studentId: "2026-00115", studentName: "Andres Castillo", activity: "Grade appeal submitted for Quantitative Methods", category: "Grades", status: "Pending" },
            { id: 8, timestamp: "2026-09-12 13:00", studentId: "2026-00107", studentName: "Carlos Bautista", activity: "Attendance flagged — below 75% threshold", category: "Attendance", status: "Absent" },
            { id: 9, timestamp: "2026-09-12 10:15", studentId: "2026-00120", studentName: "Daniela Rivera", activity: "Enrolled in Advanced Data Structures elective", category: "Enrollment", status: "Approved" },
            { id: 10, timestamp: "2026-09-11 16:45", studentId: "2026-00108", studentName: "Sofia Garcia", activity: "Grade posted for Systems Integration project", category: "Grades", status: "Completed" },
            { id: 11, timestamp: "2026-09-11 14:00", studentId: "2026-00123", studentName: "Ricardo Ong", activity: "Advisory meeting scheduled with academic counselor", category: "Advisory", status: "Pending" },
            { id: 12, timestamp: "2026-09-11 11:30", studentId: "2026-00114", studentName: "Valeria Lim", activity: "Attendance marked for Web Systems laboratory", category: "Attendance", status: "Present" },
            { id: 13, timestamp: "2026-09-10 15:00", studentId: "2026-00119", studentName: "Emilio Pascual", activity: "Enrollment status changed to At Risk", category: "Advisory", status: "Pending" },
            { id: 14, timestamp: "2026-09-10 12:30", studentId: "2026-00128", studentName: "Lucia Yulo", activity: "Grade posted for Network Security midterm", category: "Grades", status: "Completed" },
            { id: 15, timestamp: "2026-09-10 09:00", studentId: "2026-00105", studentName: "Jose Mendoza", activity: "Requested program transfer to BS Data Science", category: "Enrollment", status: "Pending" },
            { id: 16, timestamp: "2026-09-09 15:20", studentId: "2026-00130", studentName: "Rosario Delgado", activity: "Attendance marked for Advanced Database lecture", category: "Attendance", status: "Present" },
            { id: 17, timestamp: "2026-09-09 11:00", studentId: "2026-00113", studentName: "Diego Fernandez", activity: "Grade posted for Quantitative Methods quiz", category: "Grades", status: "Completed" },
            { id: 18, timestamp: "2026-09-09 08:30", studentId: "2026-00127", studentName: "Mario Espinosa", activity: "Advisory note issued — attendance below threshold", category: "Advisory", status: "Pending" },
            { id: 19, timestamp: "2026-09-08 14:00", studentId: "2026-00125", studentName: "Fernando Alonzo", activity: "Enrolled in Cloud Computing elective", category: "Enrollment", status: "Approved" },
            { id: 20, timestamp: "2026-09-08 10:00", studentId: "2026-00111", studentName: "Rafael Aquino", activity: "Grade appeal approved for Systems Analysis", category: "Grades", status: "Approved" }
        ]
    };

    let cache = null;
    let filters = { program: 'all', standing: 'all', minGpa: null, maxGpa: null, search: '' };
    let realtimeInterval = null;

    function computeStatus(gpa, rules) {
        if (gpa >= rules.goodStanding) return 'Good Standing';
        if (gpa >= rules.probation) return 'At Risk';
        return 'Probation';
    }

    function enrich(data) {
        const rules = data.standingRules || { goodStanding: 2.5, probation: 1.75 };
        data.students = data.students.map(s => ({
            ...s,
            status: computeStatus(s.gpa, rules)
        }));
        return data;
    }

    async function fetchAll() {
        try {
            const res = await fetch(`${API_BASE}?action=all`);
            if (!res.ok) throw new Error('API not reachable');
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            cache = enrich(json.data);
            console.log('DataManager: loaded from API');
            return cache;
        } catch (err) {
            console.warn('API failed, using fallback:', err.message);
            cache = enrich(JSON.parse(JSON.stringify(FALLBACK)));
            return cache;
        }
    }

    async function load() {
        if (cache) return cache;
        return await fetchAll();
    }

    function applyFilters(students) {
        let out = [...students];
        if (filters.program !== 'all') out = out.filter(s => s.program === filters.program);
        if (filters.standing !== 'all') out = out.filter(s => s.status === filters.standing);
        if (filters.minGpa !== null && filters.minGpa !== '') out = out.filter(s => s.gpa >= parseFloat(filters.minGpa));
        if (filters.maxGpa !== null && filters.maxGpa !== '') out = out.filter(s => s.gpa <= parseFloat(filters.maxGpa));
        if (filters.search) {
            const q = filters.search.toLowerCase();
            out = out.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
        }
        return out;
    }

    return {
        init: async function () { await load(); return true; },

        getStudents: async function () {
            const data = await load();
            return applyFilters(data.students);
        },
        getAllStudents: async function () {
            const data = await load();
            return data.students;
        },
        getPrograms: async function () {
            const data = await load();
            return data.programs;
        },
        getCourses: async function () {
            const data = await load();
            return data.courses || [];
        },
        getCourseCount: async function () {
            const data = await load();
            return (data.courses || []).length;
        },

        getStats: async function () {
            const students = await this.getStudents();
            const data = await load();
            const count = students.length;
            const avgGpa = count ? (students.reduce((a, s) => a + s.gpa, 0) / count).toFixed(2) : '0.00';
            const avgAtt = count ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / count) : 0;
            const totalUnits = students.reduce((a, s) => a + s.units, 0);
            const atRisk = students.filter(s => s.status !== 'Good Standing').length;
            const totalAssignments = students.reduce((a, s) => a + (s.pendingAssignments || 0), 0);
            const totalCourses = (data.courses || []).length;

            return {
                avgGpa,
                totalStudents: count,
                totalCourses,
                totalUnits,
                avgAttendance: avgAtt,
                atRisk,
                totalAssignments
            };
        },

        getQualityPointsByProgram: async function () {
            const students = await this.getAllStudents();
            const data = await load();
            const programs = data.programs;
            const sums = {}; const counts = {};
            programs.forEach(p => { sums[p] = 0; counts[p] = 0; });
            students.forEach(s => {
                if (sums[s.program] !== undefined) {
                    sums[s.program] += s.gpa;
                    counts[s.program]++;
                }
            });
            return programs.map(p => ({
                program: p,
                avgGpa: counts[p] ? parseFloat((sums[p] / counts[p]).toFixed(2)) : 0
            }));
        },

        getStandingDistribution: async function () {
            const students = await this.getAllStudents();
            const dist = { 'Good Standing': 0, 'At Risk': 0, 'Probation': 0 };
            students.forEach(s => { dist[s.status]++; });
            return dist;
        },

        getTopStudents: async function (limit = 5) {
            const students = await this.getAllStudents();
            return [...students].sort((a, b) => b.gpa - a.gpa).slice(0, limit);
        },

        getAtRiskStudents: async function () {
            const students = await this.getAllStudents();
            return students.filter(s => s.status !== 'Good Standing');
        },

        getActivities: async function () {
            const data = await load();
            return [...data.activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        },

        getAllActivities: async function () {
            const data = await load();
            return data.activities;
        },

        getActivityStats: async function () {
            const data = await load();
            const counts = { Grades: 0, Attendance: 0, Enrollment: 0, Advisory: 0 };
            data.activities.forEach(a => {
                if (counts[a.category] !== undefined) counts[a.category]++;
            });
            return counts;
        },

        setFilter: function (key, value) {
            filters[key] = value;
            document.dispatchEvent(new CustomEvent('dataFiltered'));
        },

        clearFilters: function () {
            filters = { program: 'all', standing: 'all', minGpa: null, maxGpa: null, search: '' };
            document.dispatchEvent(new CustomEvent('dataFiltered'));
        },

        getFilters: function () { return { ...filters }; },

        exportToCSV: async function () {
            const students = await this.getStudents();
            if (!students.length) return null;
            const headers = ['Student ID', 'Name', 'Program', 'Year', 'Units', 'GPA', 'Attendance', 'Status'];
            const rows = students.map(s => [s.id, s.name, s.program, s.year, s.units, s.gpa, s.attendance + '%', s.status]);
            let csv = headers.join(',') + '\n';
            rows.forEach(r => {
                csv += r.map(cell => {
                    const v = String(cell);
                    return (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v;
                }).join(',') + '\n';
            });
            return csv;
        },

        refresh: async function () {
            cache = null;
            await fetchAll();
            document.dispatchEvent(new CustomEvent('dataRefreshed'));
        },

        startRealTimeUpdates: function (intervalMs = 30000) {
            if (realtimeInterval) clearInterval(realtimeInterval);
            realtimeInterval = setInterval(async () => {
                if (!cache || !cache.students) return;

                const students = cache.students;
                const roll = Math.random();
                let student, message;

                if (roll < 0.4) {
                    // === GPA MUTATION (always a big change so it's visible) ===
                    // Prefer near-threshold so status/alerts flip
                    const nearThreshold = students.filter(s =>
                        Math.abs(s.gpa - 2.5) < 0.5 || Math.abs(s.gpa - 1.75) < 0.5
                    );
                    const pool = (nearThreshold.length > 0 && Math.random() < 0.7)
                        ? nearThreshold
                        : students;

                    student = pool[Math.floor(Math.random() * pool.length)];
                    const oldStatus = student.status;

                    // Force a noticeable change of at least ±0.15
                    const delta = (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.25);
                    let newGpa = parseFloat((student.gpa + delta).toFixed(2));
                    newGpa = Math.max(1.0, Math.min(4.0, newGpa));
                    student.gpa = newGpa;
                    student.status = computeStatus(newGpa, cache.standingRules);

                    if (student.status !== oldStatus) {
                        message = `${student.name} moved to ${student.status} (GPA: ${newGpa.toFixed(2)})`;
                    } else {
                        message = `${student.name}'s GPA updated to ${newGpa.toFixed(2)}`;
                    }
                } else if (roll < 0.7) {
                    // === ATTENDANCE MUTATION (force ±3-6% so it's visible) ===
                    student = students[Math.floor(Math.random() * students.length)];
                    const dir = Math.random() < 0.5 ? -1 : 1;
                    const delta = dir * (3 + Math.floor(Math.random() * 4));
                    let newAtt = Math.max(0, Math.min(100, student.attendance + delta));
                    student.attendance = newAtt;
                    message = `${student.name}'s attendance updated to ${newAtt}%`;
                } else {
                    // === ASSIGNMENT MUTATION (force ±1-2 so it's visible) ===
                    student = students[Math.floor(Math.random() * students.length)];
                    const dir = Math.random() < 0.5 ? -1 : 1;
                    const delta = dir * (1 + Math.floor(Math.random() * 2));
                    let newAsgn = Math.max(0, Math.min(8, (student.pendingAssignments || 0) + delta));
                    student.pendingAssignments = newAsgn;

                    if (delta > 0) {
                        message = `${student.name} was assigned new tasks (${newAsgn} pending)`;
                    } else {
                        message = `${student.name} completed tasks (${newAsgn} pending)`;
                    }
                }

                // Append to activity feed
                cache.activities.unshift({
                    id: cache.activities.length + 1,
                    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    studentId: student.id,
                    studentName: student.name,
                    activity: message,
                    category: 'Grades',
                    status: 'Completed'
                });
                if (cache.activities.length > 50) cache.activities.pop();

                console.log('SIM:', message);

                document.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: { message }
                }));
            }, intervalMs);
        },


        stopRealTimeUpdates: function () {
            if (realtimeInterval) {
                clearInterval(realtimeInterval);
                realtimeInterval = null;
            }
        }
    };
})();