/**
 * Chart Manager - Handles all Chart.js visualizations
 * For Laboratory Exercise 4 - Student Portal
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.colorScheme = {
            primary: '#FB6F92',
            secondary: '#FF8FAB',
            accent: '#FFB3C6',
            light: '#FFC2D1',
            success: '#28a745',
            warning: '#f3a712',
            danger: '#dc3545',
            info: '#17a2b8'
        };
        this.chartColors = [
            '#FB6F92', '#FF8FAB', '#FFB3C6', '#FFC2D1',
            '#28a745', '#f3a712', '#dc3545', '#17a2b8',
            '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
        ];
    }

    /**
     * Create or update the grade distribution chart
     */
    renderGradeChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const gradeData = data.getGradeDistribution();

        const labels = gradeData.map(item => item.department);
        const values = gradeData.map(item => parseFloat(item.average.toFixed(1)));

        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Grade (%)',
                    data: values,
                    backgroundColor: this.chartColors.slice(0, labels.length).map(c => c + '99'),
                    borderColor: this.chartColors.slice(0, labels.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Average: ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create or update the assignment status chart
     */
    renderAssignmentChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const statusData = data.getAssignmentStatus();

        const labels = Object.keys(statusData);
        const values = Object.values(statusData);
        const colors = {
            'Submitted': this.colorScheme.success,
            'Pending': this.colorScheme.warning
        };

        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: labels.map(label => colors[label] || this.colorScheme.primary),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    /**
     * Create or update the performance chart
     */
    renderPerformanceChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const performanceData = data.getCoursePerformance();

        const labels = performanceData.map(item => item.name);
        const values = performanceData.map(item => item.grade);
        const colors = performanceData.map(item => {
            if (item.grade >= 90) return this.colorScheme.success;
            if (item.grade >= 75) return this.colorScheme.warning;
            return this.colorScheme.danger;
        });

        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Grade (%)',
                    data: values,
                    backgroundColor: colors.map(c => c + '99'),
                    borderColor: colors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Grade: ' + context.parsed.x + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Update all charts
     */
    updateAllCharts(data) {
        this.renderGradeChart('gradeChart', data);
        this.renderAssignmentChart('assignmentChart', data);
        this.renderPerformanceChart('performanceChart', data);
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }
}

// Create a singleton instance
const chartManager = new ChartManager();