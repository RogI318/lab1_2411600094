document.addEventListener("DOMContentLoaded", function() {

    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('user') || 'Student';
    
    // Update UI
    updateGreeting(username);
    updateStatistics();
    populateActivityTable();
    setupLogout();

    // Set username in navbar
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        userNameSpan.textContent = username;
    }
});

function updateGreeting(username) {
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

function updateStatistics() {
    // Student Portal statistics
    const stats = [
        {title: 'GPA', value: '3.35', color: 'text-primary', icon: '📚 '},
        {title: 'Courses', value: '6', color: 'text-primary', icon: '📖'},
        {title: 'Assignments', value: '4', color: 'text-success', icon: '📝'},
        {title: 'Attendance', value: '92%', color: 'text-warning', icon: '✅'}
    ];
      
       const cardTitles = document.querySelectorAll('[id^= "stat"][id$= "-title"]');
       const cardValues = document.querySelectorAll('[id^= "stat"][id$= "-value"]');

    stats.forEach((stat, index) => {
        const titleElement = document.getElementById(`stat${index + 1}-title`);
        const valueElement = document.getElementById(`stat${index + 1}-value`);

        if (titleElement) {
            titleElement.textContent = `${stat.icon} ${stat.title}`;
        }
        if (valueElement) {
            valueElement.textContent = stat.value;
            // Remove existing color classes and add the new one
            valueElement.className = `card-text fw-bold ${stat.color}`;
        }
    });
}

function populateActivityTable() {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;

    const activities = [
        {date: '2026-08-18 14:30', activity: 'Submitted assignment for Web Systems and Technologies', status: 'Completed'},
        {date: '2026-08-18 11:15', activity: 'Attended Systems Analysis & Design lecture', status: 'Present'},
        {date: '2026-08-17 16:00', activity: 'Quiz scheduled for Friday - Quantitative Methods', status: 'Pending'},
        {date: '2026-08-17 09:30', activity: 'Project proposal approved by professor', status: 'Approved'},
        {date: '2026-08-16 13:45', activity: 'Submitted Advance Database Systems project', status: 'Completed'},
        {date: '2026-08-16 10:00', activity: 'Missed Systems Integration and Architecture lecture', status: 'Absent'}
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