/**
 * Charts Module - Student Portal Admin
 */

const ChartManager = (function() {
    'use strict';

    let qualityChart = null;
    let standingChart = null;
    let topStudentsChart = null;
    let activityChart = null;

    const COLORS = {
        primary:    '#FB6F92',
        secondary:  '#FF8FAB',
        accent:     '#FFB3C6',
        light:      '#FFC2D1',
        background: '#FFE5EC',
        good:       '#28a745',
        warning:    '#f3a712',
        danger:     '#dc3545'
    };

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
            }
        }
    };

    function destroyAll() {
        if (qualityChart)     { qualityChart.destroy();     qualityChart = null; }
        if (standingChart)    { standingChart.destroy();    standingChart = null; }
        if (topStudentsChart) { topStudentsChart.destroy(); topStudentsChart = null; }
        if (activityChart)    { activityChart.destroy();    activityChart = null; }
    }

    async function buildQualityChart(ctx) {
        const data = await DataManager.getQualityPointsByProgram();
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.program.replace('BS ', '')),
                datasets: [{
                    label: 'Avg GPA',
                    data: data.map(d => d.avgGpa),
                    backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.light],
                    borderColor: '#fff',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                ...baseOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4.0,
                        ticks: { stepSize: 0.5, callback: v => v.toFixed(1) },
                        title: { display: true, text: 'Average GPA' }
                    },
                    x: { ticks: { maxRotation: 30, minRotation: 0 } }
                },
                plugins: { ...baseOptions.plugins, legend: { display: false } }
            }
        });
    }

    async function buildStandingChart(ctx) {
        const dist = await DataManager.getStandingDistribution();
        const labels = Object.keys(dist);
        const values = labels.map(l => dist[l]);
        const bg = labels.map(l => {
            if (l === 'Good Standing') return COLORS.good;
            if (l === 'At Risk')       return COLORS.warning;
            return COLORS.danger;
        });

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: bg,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...baseOptions,
                cutout: '55%',
                plugins: {
                    ...baseOptions.plugins,
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                                return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    async function buildTopStudentsChart(ctx) {
        const top = await DataManager.getTopStudents(5);
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top.map(s => s.name),
                datasets: [{
                    label: 'GPA',
                    data: top.map(s => s.gpa),
                    backgroundColor: COLORS.primary,
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 4.0,
                        ticks: { stepSize: 0.5, callback: v => v.toFixed(1) }
                    }
                },
                plugins: { ...baseOptions.plugins, legend: { display: false } }
            }
        });
    }

    async function buildActivityChart(ctx) {
        const counts = await DataManager.getActivityStats();
        const labels = Object.keys(counts);
        const values = labels.map(k => counts[k]);
        const palette = {
            'Grades':     '#FB6F92',
            'Attendance': '#17a2b8',
            'Enrollment': '#28a745',
            'Advisory':   '#f3a712'
        };

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Events',
                    data: values,
                    backgroundColor: labels.map(l => palette[l]),
                    borderColor: '#fff',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                ...baseOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0 },
                        title: { display: true, text: 'Number of Events' }
                    }
                },
                plugins: { ...baseOptions.plugins, legend: { display: false } }
            }
        });
    }

    return {
        initCharts: async function() {
            destroyAll();
            const qualityCanvas     = document.getElementById('qualityChart');
            const standingCanvas    = document.getElementById('standingChart');
            const topStudentsCanvas = document.getElementById('topStudentsChart');
            const activityCanvas    = document.getElementById('activityChart');

            try {
                if (qualityCanvas)     qualityChart     = await buildQualityChart(qualityCanvas.getContext('2d'));
                if (standingCanvas)    standingChart    = await buildStandingChart(standingCanvas.getContext('2d'));
                if (topStudentsCanvas) topStudentsChart = await buildTopStudentsChart(topStudentsCanvas.getContext('2d'));
                if (activityCanvas)    activityChart    = await buildActivityChart(activityCanvas.getContext('2d'));
                console.log('Charts rendered');
            } catch (err) {
                console.error('Chart init error:', err);
            }
        },

        updateCharts: async function() {
            await this.initCharts();
        }
    };
})();