/**
 * Charts Module
 * Handles all Chart.js visualizations for the Student Portal Dashboard
 */

const ChartManager = (function() {
    'use strict';

    let gradeChart = null;
    let courseChart = null;
    let assignmentChart = null;
    let attendanceChart = null;

    const colors = {
        primary: '#FB6F92',
        secondary: '#FF8FAB',
        accent: '#FFB3C6',
        light: '#FFC2D1',
        background: '#FFE5EC',
        success: '#e254cb',
        warning: '#6849af',
        danger: '#dc3589',
        info: '#17a2b8'
    };

    const responsiveOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 12 }
                }
            }
        }
    };

    function getGradeChartOptions() {
        return {
            ...responsiveOptions,
            plugins: {
                ...responsiveOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} courses (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }

    function getCourseChartOptions() {
        return {
            ...responsiveOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4.0,
                    ticks: {
                        stepSize: 0.5,
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Grade Points'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                ...responsiveOptions.plugins,
                legend: { display: false }
            }
        };
    }

    function getAssignmentChartOptions() {
        return {
            ...responsiveOptions,
            plugins: {
                ...responsiveOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }

    function getAttendanceChartOptions() {
        return {
            ...responsiveOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Attendance Rate (%)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                ...responsiveOptions.plugins,
                legend: { display: false }
            }
        };
    }

    function destroyCharts() {
        if (gradeChart) { gradeChart.destroy(); gradeChart = null; }
        if (courseChart) { courseChart.destroy(); courseChart = null; }
        if (assignmentChart) { assignmentChart.destroy(); assignmentChart = null; }
        if (attendanceChart) { attendanceChart.destroy(); attendanceChart = null; }
    }

    async function createGradeChart(ctx) {
        try {
            const distribution = await DataManager.getGradeDistribution();
            console.log('Grade distribution:', distribution);
            
            const gradeOrder = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
            const sortedLabels = [];
            const sortedData = [];
            
            gradeOrder.forEach(grade => {
                if (distribution[grade]) {
                    sortedLabels.push(grade);
                    sortedData.push(distribution[grade]);
                }
            });

            if (sortedLabels.length === 0) {
                sortedLabels.push('No Data');
                sortedData.push(1);
            }

            return new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: sortedLabels,
                    datasets: [{
                        data: sortedData,
                        backgroundColor: sortedData.length > 1 ? [
                            '#db3295', '#d32abc', '#ec6ec2', '#bb59be', '#ac75cc',
                            '#ad3e76', '#d35400', '#e74c3c', '#c0392b', '#dc3545'
                        ] : ['#ddd'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: getGradeChartOptions()
            });
        } catch (error) {
            console.error('Error creating grade chart:', error);
            return new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{ data: [1], backgroundColor: ['#ddd'], borderWidth: 2, borderColor: '#fff' }]
                },
                options: getGradeChartOptions()
            });
        }
    }

    async function createCourseChart(ctx) {
        try {
            const performance = await DataManager.getCoursePerformance();
            console.log('Course performance:', performance);
            
            const labels = performance.map(p => p.name);
            const data = performance.map(p => p.gradeValue);

            if (labels.length === 0) {
                labels.push('No Data');
                data.push(0);
            }

            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Grade Points',
                        data: data,
                        backgroundColor: data.map(value => {
                            if (value >= 3.5) return '#d32abc';
                            if (value >= 3.0) return '#bb4c8d';
                            if (value >= 2.5) return '#ec6ec2';
                            if (value >= 2.0) return '#ac75cc';
                            return '#dc3545';
                        }),
                        borderColor: '#fff',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: getCourseChartOptions()
            });
        } catch (error) {
            console.error('Error creating course chart:', error);
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{ label: 'Grade Points', data: [0], backgroundColor: ['#ddd'], borderColor: '#fff', borderWidth: 1, borderRadius: 4 }]
                },
                options: getCourseChartOptions()
            });
        }
    }

    async function createAssignmentChart(ctx) {
        try {
            const statuses = await DataManager.getAssignmentStatus();
            console.log('Assignment status:', statuses);
            
            const labels = Object.keys(statuses);
            const data = labels.map(label => statuses[label]);

            const statusColors = {
                'Completed': colors.success,
                'Pending': colors.warning,
                'In Progress': colors.info
            };

            if (labels.length === 0) {
                labels.push('No Data');
                data.push(1);
            }

            const backgroundColors = labels.map(label => statusColors[label] || colors.primary);

            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: getAssignmentChartOptions()
            });
        } catch (error) {
            console.error('Error creating assignment chart:', error);
            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['No Data'],
                    datasets: [{ data: [1], backgroundColor: ['#ddd'], borderWidth: 2, borderColor: '#fff' }]
                },
                options: getAssignmentChartOptions()
            });
        }
    }

    async function createAttendanceChart(ctx) {
        try {
            const trend = await DataManager.getAttendanceTrend();
            console.log('Attendance trend:', trend);
            
            const labels = trend.map(t => t.week);
            const data = trend.map(t => t.rate);

            if (labels.length === 0) {
                labels.push('No Data');
                data.push(0);
            }

            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Attendance Rate',
                        data: data,
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '33',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: getAttendanceChartOptions()
            });
        } catch (error) {
            console.error('Error creating attendance chart:', error);
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Attendance Rate',
                        data: [0],
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '33',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: getAttendanceChartOptions()
            });
        }
    }

    return {
        initCharts: async function() {
            console.log('Initializing charts...');
            destroyCharts();

            const gradeCanvas = document.getElementById('gradeChart');
            const courseCanvas = document.getElementById('courseChart');
            const assignmentCanvas = document.getElementById('assignmentChart');
            const attendanceCanvas = document.getElementById('attendanceChart');

            try {
                if (gradeCanvas) {
                    const ctx = gradeCanvas.getContext('2d');
                    gradeChart = await createGradeChart(ctx);
                    console.log('Grade chart created');
                }

                if (courseCanvas) {
                    const ctx = courseCanvas.getContext('2d');
                    courseChart = await createCourseChart(ctx);
                    console.log('Course chart created');
                }

                if (assignmentCanvas) {
                    const ctx = assignmentCanvas.getContext('2d');
                    assignmentChart = await createAssignmentChart(ctx);
                    console.log('Assignment chart created');
                }

                if (attendanceCanvas) {
                    const ctx = attendanceCanvas.getContext('2d');
                    attendanceChart = await createAttendanceChart(ctx);
                    console.log('Attendance chart created');
                }
            } catch (error) {
                console.error('Error initializing charts:', error);
            }
        },

        updateCharts: function() {
            console.log('Updating charts...');
            this.initCharts();
        },

        handleResize: function() {}
    };
})();