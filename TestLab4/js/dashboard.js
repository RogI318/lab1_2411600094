/**
 * Dashboard Controller - Main application logic
 * For Laboratory Exercise 4 - Student Portal
 */

document.addEventListener("DOMContentLoaded", async function() {
    // Check authentication - PRESERVED from your original
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('user') || 'Student';
    
    // Set username in navbar - PRESERVED from your original
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        userNameSpan.textContent = username;
    }

    // Initialize the dashboard
    await initializeDashboard();

    // Setup event listeners
    setupEventListeners();
    setupLogout();
});

/**
 * Initialize the dashboard
 */
async function initializeDashboard() {
    // Initialize data manager
    await dataManager.initializeData();

    // Update UI with data
    updateStatistics(dataManager);
    updateGreeting();
    renderCoursesTable(dataManager.getCourses());
    populateActivityTable();

    // Render charts
    chartManager.updateAllCharts(dataManager);

    // Check for upcoming deadlines
    checkUpcomingDeadlines(dataManager);

    // Update department filter dropdown
    populateDepartmentFilter(dataManager);

    // Register data change listener
    dataManager.addListener((courses) => {
        updateStatistics(dataManager);
        renderCoursesTable(courses);
        chartManager.updateAllCharts(dataManager);
        checkUpcomingDeadlines(dataManager);
        updateItemCount(courses);
    });
}

/**
 * Update greeting based on time of day - PRESERVED from your original
 */
function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let timeOfDay = '';

    if (hour >= 5 && hour < 12) {
        timeOfDay = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
        timeOfDay = 'Good Evening';
    } else {
        timeOfDay = 'Good Night';
    }
    
    const username = localStorage.getItem('user') || 'Student';
    greetingElement.textContent = `${timeOfDay}, ${username}!`;
}

/**
 * Update statistics cards - ENHANCED with student data
 */
function updateStatistics(dataManager) {
    const stats = dataManager.getStatistics();
    
    document.getElementById('stat1-value').textContent = stats.gpa.toFixed(2);
    document.getElementById('stat2-value').textContent = stats.activeCourses;
    document.getElementById('stat3-value').textContent = stats.pendingAssignments;
    document.getElementById('stat4-value').textContent = stats.attendance + '%';
}

/**
 * Render the courses table - ENHANCED with filtering
 */
function renderCoursesTable(courses) {
    const tableBody = document.getElementById('coursesTableBody');
    if (!tableBody) return;

    if (!courses || courses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-inbox"></i> No courses found matching your criteria
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';
    courses.forEach(course => {
        const row = document.createElement('tr');
        
        // Determine status badge
        let badgeClass = 'bg-secondary';
        let statusDisplay = course.status.charAt(0).toUpperCase() + course.status.slice(1);
        if (course.status === 'active') {
            badgeClass = 'bg-success';
        } else if (course.status === 'completed') {
            badgeClass = 'bg-primary';
        } else if (course.status === 'pending') {
            badgeClass = 'bg-warning text-dark';
        }

        // Grade display
        const gradeDisplay = course.grade > 0 ? course.grade + '%' : 'N/A';
        const gradeClass = course.grade >= 90 ? 'text-success' : 
                          course.grade >= 75 ? 'text-warning' : 
                          course.grade > 0 ? 'text-danger' : '';

        // Progress bar
        const progressColor = course.progress >= 75 ? 'bg-success' :
                             course.progress >= 50 ? 'bg-warning' :
                             'bg-danger';

        row.innerHTML = `
            <td><strong>${course.code}</strong></td>
            <td>${course.name}</td>
            <td>${course.department}</td>
            <td>${course.credits}</td>
            <td class="${gradeClass} fw-bold">${gradeDisplay}</td>
            <td><span class="badge ${badgeClass}">${statusDisplay}</span></td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${progressColor}" 
                         role="progressbar" 
                         style="width: ${course.progress}%;" 
                         aria-valuenow="${course.progress}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${course.progress}%
                    </div>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Populate activity table - PRESERVED from your original but enhanced
 */
function populateActivityTable() {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;

    const activities = [
        {date: '2026-09-08 14:30', activity: 'Submitted assignment for Web Systems and Technologies', status: 'Completed'},
        {date: '2026-09-08 11:15', activity: 'Attended Systems Analysis & Design lecture', status: 'Present'},
        {date: '2026-09-07 16:00', activity: 'Quiz scheduled for Friday - Quantitative Methods', status: 'Pending'},
        {date: '2026-09-07 09:30', activity: 'Project proposal approved by professor', status: 'Approved'},
        {date: '2026-09-06 13:45', activity: 'Submitted Advanced Database Systems project', status: 'Completed'},
        {date: '2026-09-06 10:00', activity: 'Missed Systems Integration and Architecture lecture', status: 'Absent'}
    ];

    tableBody.innerHTML = '';

    activities.forEach(activity => {
        const row = document.createElement('tr');

        let badgeClass = 'bg-secondary';
        let statusText = activity.status;
        
        if (activity.status === 'Completed' || activity.status === 'Present' || activity.status === 'Approved') {
            badgeClass = 'bg-success';
        } else if (activity.status === 'Pending') {
            badgeClass = 'bg-warning text-dark';
        } else if (activity.status === 'Absent') {
            badgeClass = 'bg-danger';
        }

        row.innerHTML = `
            <td>${activity.date}</td>
            <td>${activity.activity}</td>
            <td><span class="badge ${badgeClass}">${activity.status}</span></td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Check for upcoming deadlines - NEW for Lab 4
 */
function checkUpcomingDeadlines(dataManager) {
    const upcoming = dataManager.getUpcomingDeadlines();
    const container = document.getElementById('deadlineAlertContainer');
    const message = document.getElementById('deadlineAlertMessage');
    const badge = document.getElementById('alertBadge');

    if (upcoming.length > 0) {
        container.style.display = 'block';
        const names = upcoming.map(a => a.title).join(', ');
        message.textContent = `You have ${upcoming.length} assignment(s) due soon: ${names}`;
        if (badge) {
            badge.textContent = upcoming.length;
            badge.style.display = 'inline';
        }
    } else {
        container.style.display = 'none';
        if (badge) {
            badge.style.display = 'none';
        }
    }
}

/**
 * Populate department filter dropdown - NEW for Lab 4
 */
function populateDepartmentFilter(dataManager) {
    const select = document.getElementById('filterDepartment');
    if (!select) return;

    const courses = dataManager.getAllCourses();
    const departments = [...new Set(courses.map(c => c.department))].sort();

    // Clear existing options (except the first one)
    while (select.options.length > 1) {
        select.remove(1);
    }

    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        select.appendChild(option);
    });
}

/**
 * Update item count - NEW for Lab 4
 */
function updateItemCount(courses) {
    const countElement = document.getElementById('itemCount');
    if (countElement) {
        countElement.textContent = `${courses.length} course${courses.length !== 1 ? 's' : ''}`;
    }
}

/**
 * Setup all event listeners - ENHANCED for Lab 4
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            dataManager.setSearchQuery(e.target.value);
        });
    }

    // Filter buttons
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const department = document.getElementById('filterDepartment').value;
            const status = document.getElementById('filterStatus').value;
            const minCredits = document.getElementById('filterMinCredits').value;
            const maxCredits = document.getElementById('filterMaxCredits').value;

            dataManager.setFilter('department', department);
            dataManager.setFilter('status', status);
            dataManager.setFilter('minCredits', minCredits || null);
            dataManager.setFilter('maxCredits', maxCredits || null);
        });
    }

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Reset form fields
            document.getElementById('filterDepartment').value = 'all';
            document.getElementById('filterStatus').value = 'all';
            document.getElementById('filterMinCredits').value = '';
            document.getElementById('filterMaxCredits').value = '';
            document.getElementById('searchInput').value = '';

            dataManager.clearFilters();
        });
    }

    // Export CSV
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const csvContent = dataManager.exportToCSV();
            if (csvContent) {
                downloadCSV(csvContent, `student_courses_${new Date().toISOString().slice(0,10)}.csv`);
            } else {
                alert('No data to export.');
            }
        });
    }

    // Refresh data
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Refreshing...';
            this.disabled = true;

            try {
                await dataManager.initializeData();
                // Force UI update
                dataManager.notifyListeners();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }

    // Sidebar navigation
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Simple section switching (can be enhanced)
            const section = this.dataset.section || 'dashboard';
            console.log(`Navigating to ${section}`);
        });
    });
}

/**
 * Download CSV file - NEW for Lab 4
 */
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Setup logout - PRESERVED from your original
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');

    function performLogout(e) {
        e.preventDefault();

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', performLogout);
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', performLogout);
    }
}