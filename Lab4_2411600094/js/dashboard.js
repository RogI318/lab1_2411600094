document.addEventListener('DOMContentLoaded', async function() {
    'use strict';

    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('user') || 'admin';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = username;

    try {
        await DataManager.init();

        updateGreeting();
        await updateStatistics();
        await renderAlerts();
        await populateProgramFilter();
        await renderRoster();
        await populateActivityTable();
        await ChartManager.initCharts();

        setupLogout();
        setupFilters();
        setupSearch();
        setupExport();

        // === LISTENERS (attached before starting sim) ===
        document.addEventListener('dataUpdated', async (e) => {
            console.log('dataUpdated:', e.detail);
            await updateStatistics();
            await renderRoster();
            await renderAlerts();
            await populateActivityTable();
            await ChartManager.updateCharts();
            showToast(e.detail.message || 'Data updated', 'success');
        });

        document.addEventListener('dataFiltered', async () => {
            await updateStatistics();
            await renderRoster();
            await renderAlerts();
            await populateActivityTable();
            await ChartManager.updateCharts();
        });

        document.addEventListener('dataRefreshed', async () => {
            await updateStatistics();
            await renderRoster();
            await renderAlerts();
            await populateActivityTable();
            await ChartManager.updateCharts();
        });

        // === START SIM LAST ===
        DataManager.startRealTimeUpdates(5000); // 5 seconds — easier to test
        console.log('Real-time simulation started (5s interval)');

    } catch (err) {
        console.error('Dashboard init failed:', err);
    }
});

function updateGreeting() {
    const el = document.getElementById('greeting');
    if (!el) return;
    const h = new Date().getHours();
    let tod = 'Good Evening';
    if (h >= 5 && h < 12)       tod = 'Good Morning';
    else if (h >= 12 && h < 17) tod = 'Good Afternoon';
    else if (h >= 17 && h < 21) tod = 'Good Evening';
    else                        tod = 'Good Night';
    el.textContent = `${tod}, admin!`;
}

async function updateStatistics() {
    const stats = await DataManager.getStats();
    const gpaEl = document.getElementById('stat-gpa');
    const coursesEl = document.getElementById('stat-courses');
    const assignEl = document.getElementById('stat-assignments');
    const attEl = document.getElementById('stat-attendance');

    if (gpaEl) gpaEl.textContent = stats.avgGpa;
    if (coursesEl) coursesEl.textContent = stats.totalCourses;
    if (assignEl) assignEl.textContent = stats.totalAssignments;
    if (attEl) attEl.textContent = stats.avgAttendance + '%';
}

async function populateProgramFilter() {
    const sel = document.getElementById('programFilter');
    if (!sel) return;
    const programs = await DataManager.getPrograms();
    programs.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        sel.appendChild(opt);
    });
}

async function renderRoster() {
    const tbody = document.getElementById('rosterBody');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');
    if (!tbody) return;

    const students = await DataManager.getStudents();

    if (resultCount) {
        resultCount.textContent = `Showing ${students.length} student${students.length !== 1 ? 's' : ''}`;
    }

    if (students.length === 0) {
        tbody.innerHTML = '';
        if (noResults) noResults.classList.remove('d-none');
        return;
    }
    if (noResults) noResults.classList.add('d-none');
    tbody.innerHTML = '';

    students.forEach(s => {
        const tr = document.createElement('tr');
        let badge = 'bg-success';
        if (s.status === 'At Risk')   badge = 'bg-warning text-dark';
        if (s.status === 'Probation') badge = 'bg-danger';

        let gpaClass = 'text-success';
        if (s.gpa < 2.5)  gpaClass = 'text-warning';
        if (s.gpa < 1.75) gpaClass = 'text-danger';

        tr.innerHTML = `
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${s.program}</td>
            <td>${s.year}</td>
            <td>${s.units}</td>
            <td class="${gpaClass} fw-bold">${s.gpa.toFixed(2)}</td>
            <td>${s.attendance}%</td>
            <td><span class="badge ${badge}">${s.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

async function renderAlerts() {
    const atRisk = await DataManager.getAtRiskStudents();
    const noAlerts = document.getElementById('noAlerts');
    const alertsList = document.getElementById('alertsList');
    const alertBadge = document.getElementById('alertBadge');

    if (alertBadge) {
        if (atRisk.length > 0) {
            alertBadge.textContent = atRisk.length;
            alertBadge.style.display = 'inline-block';
        } else {
            alertBadge.style.display = 'none';
        }
    }

    if (atRisk.length === 0) {
        if (noAlerts) noAlerts.style.display = 'block';
        if (alertsList) alertsList.style.display = 'none';
        return;
    }
    if (noAlerts) noAlerts.style.display = 'none';
    if (alertsList) {
        alertsList.style.display = 'block';
        alertsList.innerHTML = '';
    }

    atRisk.forEach(s => {
        const isProbation = s.status === 'Probation';
        const div = document.createElement('div');
        div.className = `alert ${isProbation ? 'bg-danger text-white' : 'bg-warning text-dark'} alert-dismissible fade show d-flex align-items-center mb-2`;
        div.innerHTML = `
            <i class="bi ${isProbation ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill'} me-3 fs-4"></i>
            <div class="flex-grow-1">
                <strong>${s.status}:</strong> ${s.name} (${s.id}) — GPA ${s.gpa.toFixed(2)}, Attendance ${s.attendance}%
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertsList.appendChild(div);
    });
}

async function populateActivityTable() {
    const tbody = document.getElementById('activityTableBody');
    const noActivity = document.getElementById('noActivity');
    const countEl = document.getElementById('activityCount');
    if (!tbody) return;

    const activities = await DataManager.getActivities();

    if (countEl) {
        countEl.textContent = `${activities.length} event${activities.length !== 1 ? 's' : ''}`;
    }

    if (activities.length === 0) {
        tbody.innerHTML = '';
        if (noActivity) noActivity.classList.remove('d-none');
        return;
    }
    if (noActivity) noActivity.classList.add('d-none');
    tbody.innerHTML = '';

    activities.forEach(a => {
        const tr = document.createElement('tr');

        let catBadge = 'bg-secondary';
        if (a.category === 'Grades')          catBadge = 'bg-primary';
        else if (a.category === 'Attendance') catBadge = 'bg-info text-dark';
        else if (a.category === 'Enrollment') catBadge = 'bg-success';
        else if (a.category === 'Advisory')   catBadge = 'bg-warning text-dark';

        let statusBadge = 'bg-secondary';
        if (a.status === 'Completed' || a.status === 'Present' || a.status === 'Approved') {
            statusBadge = 'bg-success';
        } else if (a.status === 'Pending') {
            statusBadge = 'bg-warning text-dark';
        } else if (a.status === 'Absent') {
            statusBadge = 'bg-danger';
        }

        tr.innerHTML = `
            <td><small class="text-muted">${a.timestamp}</small></td>
            <td><strong>${a.studentName}</strong><br><small class="text-muted">${a.studentId}</small></td>
            <td>${a.activity}</td>
            <td><span class="badge ${catBadge}">${a.category}</span></td>
            <td><span class="badge ${statusBadge}">${a.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function setupLogout() {
    const btn = document.getElementById('logoutBtn');
    const link = document.getElementById('logoutLink');
    function doLogout(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
    if (btn)  btn.addEventListener('click', doLogout);
    if (link) link.addEventListener('click', doLogout);
}

function setupFilters() {
    const programSel = document.getElementById('programFilter');
    const standingSel = document.getElementById('standingFilter');
    const minGpa = document.getElementById('minGpaFilter');
    const maxGpa = document.getElementById('maxGpaFilter');
    const resetBtn = document.getElementById('resetFiltersBtn');

    if (programSel) programSel.addEventListener('change', function() {
        DataManager.setFilter('program', this.value);
    });
    if (standingSel) standingSel.addEventListener('change', function() {
        DataManager.setFilter('standing', this.value);
    });
    if (minGpa) minGpa.addEventListener('input', function() {
        DataManager.setFilter('minGpa', this.value);
    });
    if (maxGpa) maxGpa.addEventListener('input', function() {
        DataManager.setFilter('maxGpa', this.value);
    });
    if (resetBtn) resetBtn.addEventListener('click', function() {
        if (programSel) programSel.value = 'all';
        if (standingSel) standingSel.value = 'all';
        if (minGpa) minGpa.value = '';
        if (maxGpa) maxGpa.value = '';
        const search = document.getElementById('searchInput');
        if (search) search.value = '';
        DataManager.clearFilters();
        showToast('Filters reset', 'info');
    });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', function() {
        DataManager.setFilter('search', this.value.trim());
    });
}

function setupExport() {
    const btn = document.getElementById('exportBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const csv = await DataManager.exportToCSV();
        if (!csv) {
            showToast('No data to export', 'warning');
            return;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_roster_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSV exported successfully', 'success');
    });
}

function setupRealTime() {
    DataManager.startRealTimeUpdates(30000);
    window.addEventListener('beforeunload', () => DataManager.stopRealTimeUpdates());
}

function showToast(message, type = 'info') {
    const toastEl = document.querySelector('#notificationToast .toast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toastEl || !toastMsg) return;

    const icons = {
        success: 'bi-check-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        danger:  'bi-x-circle-fill',
        info:    'bi-info-circle-fill'
    };
    const bgs = {
        success: 'bg-success',
        warning: 'bg-warning text-dark',
        danger:  'bg-danger',
        info:    'bg-info text-dark'
    };

    toastMsg.innerHTML = `<i class="bi ${icons[type]} me-2"></i>${message}`;
    toastEl.className = `toast align-items-center border-0 ${bgs[type]}`;
    if (type === 'success' || type === 'danger') toastEl.classList.add('text-white');

    new bootstrap.Toast(toastEl, { autohide: true, delay: 4000 }).show();
}