/**
 * Dashboard Controller
 * Main application logic for Student Portal Dashboard
 * Laboratory Exercise 4
 */

document.addEventListener("DOMContentLoaded", async function() {
    'use strict';

    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('user') || 'Student';
    
    // Set username in navbar
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        userNameSpan.textContent = username;
    }

    try {
        // Initialize DataManager
        await DataManager.init();
        console.log('DataManager initialized');

        // Update UI
        await updateGreeting(username);
        await updateStatistics();
        await populateActivityTable();
        await renderCoursesTable();  // NEW: Render courses table
        await renderAlerts();
        setupLogout();
        setupFiltersAndSearch();
        setupExport();
        setupRefresh();
        await setupPerformanceAlert();
        setupRealTimeUpdates();

        // Initialize charts
        await initializeCharts();
        console.log('Charts initialized');

        // Listen for data filter events
        document.addEventListener('dataFiltered', function() {
            populateActivityTable();
            renderCoursesTable();  // NEW: Update courses table
            updateResultCount();
        });

        // Listen for data updates
        document.addEventListener('dataUpdated', function(e) {
            updateStatistics();
            populateActivityTable();
            renderCoursesTable();  // NEW: Update courses table
            renderAlerts();
            ChartManager.updateCharts();
            updateResultCount();
            setupPerformanceAlert();
            showToast(e.detail.message, 'success');
        });

        // Listen for refresh events
        document.addEventListener('dataRefreshed', function() {
            updateStatistics();
            populateActivityTable();
            renderCoursesTable();  // NEW: Update courses table
            renderAlerts();
            ChartManager.updateCharts();
            updateResultCount();
            setupPerformanceAlert();
            showToast('Data refreshed successfully!', 'info');
        });

    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showToast('Error loading data. Please refresh.', 'danger');
    }
});

async function initializeCharts() {
    if (typeof ChartManager !== 'undefined') {
        try {
            await ChartManager.initCharts();
            console.log('Charts rendered');
        } catch (error) {
            console.error('Chart initialization failed:', error);
        }
    } else {
        console.error('ChartManager not loaded');
    }
}

async function updateGreeting(username) {
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
    
    greetingElement.textContent = `${timeOfDay}, ${username}!`;
}

async function updateStatistics() {
    try {
        const stats = await DataManager.getStatistics();
        console.log('Statistics:', stats);
        
        const statConfigs = [
            { icon: '📚', title: 'GPA', value: stats.gpa.toFixed(2), color: 'text-primary' },
            { icon: '📖', title: 'Courses', value: stats.courseCount, color: 'text-primary' },
            { icon: '📝', title: 'Assignments', value: stats.pendingAssignments, color: 'text-success' },
            { icon: '✅', title: 'Attendance', value: stats.attendanceRate + '%', color: 'text-warning' }
        ];

        statConfigs.forEach((stat, index) => {
            const titleElement = document.getElementById(`stat${index + 1}-title`);
            const valueElement = document.getElementById(`stat${index + 1}-value`);

            if (titleElement) {
                titleElement.textContent = `${stat.icon} ${stat.title}`;
            }
            if (valueElement) {
                valueElement.textContent = stat.value;
                valueElement.className = `card-text fw-bold ${stat.color}`;
                valueElement.classList.add('updated');
                setTimeout(() => valueElement.classList.remove('updated'), 500);
            }
        });
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

async function populateActivityTable() {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;

    try {
        const activities = await DataManager.getActivities();
        console.log('Activities loaded:', activities.length);
        
        const noResults = document.getElementById('noResults');

        if (activities.length === 0) {
            tableBody.innerHTML = '';
            if (noResults) noResults.classList.remove('d-none');
            updateResultCount();
            return;
        }

        if (noResults) noResults.classList.add('d-none');

        tableBody.innerHTML = '';

        activities.forEach(activity => {
            const row = document.createElement('tr');

            let badgeClass = 'bg-secondary';
            
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

        updateResultCount();
    } catch (error) {
        console.error('Error populating activity table:', error);
    }
}

/**
 * Render filtered courses table - NEW
 */
async function renderCoursesTable() {
    const tableBody = document.getElementById('coursesTableBody');
    const courseCount = document.getElementById('courseCount');
    const noCoursesFound = document.getElementById('noCoursesFound');
    
    if (!tableBody) return;

    try {
        const courses = await DataManager.getFilteredCourses();
        console.log('Filtered courses:', courses);
        
        if (courseCount) {
            courseCount.textContent = `${courses.length} course${courses.length !== 1 ? 's' : ''}`;
        }

        if (courses.length === 0) {
            tableBody.innerHTML = '';
            if (noCoursesFound) noCoursesFound.classList.remove('d-none');
            return;
        }

        if (noCoursesFound) noCoursesFound.classList.add('d-none');

        tableBody.innerHTML = '';

        courses.forEach(course => {
            const row = document.createElement('tr');
            
            let gradeColor = 'text-success';
            if (course.gradeValue < 2.5) gradeColor = 'text-danger';
            else if (course.gradeValue < 3.0) gradeColor = 'text-warning';
            
            row.innerHTML = `
                <td><strong>${course.code}</strong></td>
                <td>${course.name}</td>
                <td><span class="badge bg-primary">${course.credits}</span></td>
                <td class="${gradeColor} fw-bold">${course.grade}</td>
                <td>${course.instructor}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error rendering courses table:', error);
    }
}

function updateResultCount() {
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        DataManager.getActivities().then(activities => {
            resultCount.textContent = `Showing ${activities.length} items`;
        }).catch(() => {
            resultCount.textContent = 'Showing 0 items';
        });
    }
}

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

function setupFiltersAndSearch() {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            DataManager.setFilter('status', this.value);
        });
    }

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    function performSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        DataManager.setFilter('search', query);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // MIN/MAX CREDITS FILTER
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const minCreditsInput = document.getElementById('minCreditsFilter');
    const maxCreditsInput = document.getElementById('maxCreditsFilter');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const minCredits = minCreditsInput ? minCreditsInput.value : '';
            const maxCredits = maxCreditsInput ? maxCreditsInput.value : '';
            
            DataManager.setFilter('minCredits', minCredits || null);
            DataManager.setFilter('maxCredits', maxCredits || null);
            
            // Show detailed feedback
            let message = 'Filters applied!';
            if (minCredits && maxCredits) {
                message = ` Showing courses with ${minCredits}-${maxCredits} credits`;
            } else if (minCredits) {
                message = ` Showing courses with ${minCredits}+ credits`;
            } else if (maxCredits) {
                message = `Showing courses with ${maxCredits} or fewer credits`;
            }
            showToast(message, 'success');
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            if (statusFilter) statusFilter.value = 'all';
            if (searchInput) searchInput.value = '';
            if (minCreditsInput) minCreditsInput.value = '';
            if (maxCreditsInput) maxCreditsInput.value = '';
            
            DataManager.clearAllFilters();
            
            showToast('All filters cleared!', 'info');
        });
    }
}

function setupExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', async function() {
        try {
            const csv = await DataManager.exportToCSV();
            if (!csv) {
                showToast('No data to export!', 'warning');
                return;
            }

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `student_activities_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            showToast('Export failed. Please try again.', 'danger');
        }
    });
}

function setupRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (!refreshBtn) return;

    refreshBtn.addEventListener('click', async function() {
        this.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Refreshing...';
        this.disabled = true;

        try {
            await DataManager.refresh();
            await updateStatistics();
            await populateActivityTable();
            await renderCoursesTable();
            await renderAlerts();
            await ChartManager.updateCharts();
            await setupPerformanceAlert();
            showToast('Dashboard refreshed!', 'success');
        } catch (error) {
            console.error('Refresh failed:', error);
            showToast('Refresh failed. Please try again.', 'danger');
        } finally {
            this.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Refresh';
            this.disabled = false;
        }
    });
}

async function setupPerformanceAlert() {
    try {
        const stats = await DataManager.getStatistics();
        const alertEl = document.getElementById('performanceAlert');
        if (!alertEl) return;

        if (stats.gpa < 2.0) {
            alertEl.classList.remove('d-none');
        } else {
            alertEl.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error checking performance:', error);
    }
}

async function renderAlerts() {
    try {
        const alerts = await DataManager.getAllAlerts();
        const alertContainer = document.getElementById('alertContainer');
        const noAlerts = document.getElementById('noAlerts');
        const alertsList = document.getElementById('alertsList');
        const alertBadge = document.getElementById('alertBadge');
        
        if (!alertContainer) return;
        
        if (alertBadge) {
            if (alerts.length > 0) {
                alertBadge.textContent = alerts.length;
                alertBadge.style.display = 'inline';
            } else {
                alertBadge.style.display = 'none';
            }
        }
        
        if (alerts.length === 0) {
            if (noAlerts) noAlerts.style.display = 'block';
            if (alertsList) alertsList.style.display = 'none';
            return;
        }
        
        if (noAlerts) noAlerts.style.display = 'none';
        if (alertsList) {
            alertsList.style.display = 'block';
            alertsList.innerHTML = '';
        }
        
        alerts.forEach((alert, index) => {
            const alertDiv = document.createElement('div');
            const bgClass = alert.bgClass || 'bg-warning text-dark';
            
            alertDiv.className = `alert ${bgClass} alert-dismissible fade show d-flex align-items-center mb-2`;
            alertDiv.setAttribute('role', 'alert');
            
            alertDiv.innerHTML = `
                <i class="bi ${alert.icon} me-3 fs-4"></i>
                <div class="flex-grow-1">
                    <strong>${alert.title}</strong>
                    <span>${alert.message}</span>
                    ${alert.daysUntil ? `<br><small> ${alert.daysUntil} day${alert.daysUntil > 1 ? 's' : ''} remaining</small>` : ''}
                    ${alert.rate ? `<br><small> Attendance: ${alert.rate}%</small>` : ''}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            alertDiv.style.animation = `slideIn 0.3s ease ${index * 0.1}s both`;
            alertsList.appendChild(alertDiv);
        });
    } catch (error) {
        console.error('Error rendering alerts:', error);
    }
}

function setupRealTimeUpdates() {
    DataManager.startRealTimeUpdates(30000);

    window.addEventListener('beforeunload', function() {
        DataManager.stopRealTimeUpdates();
    });
}

function showToast(message, type = 'info') {
    const toastEl = document.querySelector('#notificationToast .toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toastEl || !toastMessage) return;

    const icons = {
        'success': 'bi-check-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'danger': 'bi-x-circle-fill',
        'info': 'bi-info-circle-fill'
    };

    const bgColors = {
        'success': 'bg-success',
        'warning': 'bg-warning text-dark',
        'danger': 'bg-danger',
        'info': 'bg-info text-dark'
    };

    toastMessage.innerHTML = `<i class="bi ${icons[type] || icons.info} me-2"></i>${message}`;
    
    toastEl.className = `toast align-items-center text-white border-0 ${bgColors[type] || bgColors.info}`;
    
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 5000
    });
    toast.show();
}