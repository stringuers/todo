// Analytics functionality
class Analytics {
    constructor() {
        this.tasks = []; // This will be populated from the main tasks array
        this.dateRange = 'week';
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCharts();
    }

    setupEventListeners() {
        // Date range buttons
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.dateRange = btn.dataset.range;
                this.updateCharts();
            });
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.analytics-card');
                const chartId = card.querySelector('canvas').id;
                this.exportChart(chartId);
            });
        });
    }

    renderCharts() {
        // Task Completion Rate Chart
        this.charts.completionChart = new Chart(
            document.getElementById('completionChart'),
            this.getCompletionChartConfig()
        );

        // Task Distribution Chart
        this.charts.distributionChart = new Chart(
            document.getElementById('distributionChart'),
            this.getDistributionChartConfig()
        );

        // Productivity Trends Chart
        this.charts.productivityChart = new Chart(
            document.getElementById('productivityChart'),
            this.getProductivityChartConfig()
        );

        // Task Priority Distribution Chart
        this.charts.priorityChart = new Chart(
            document.getElementById('priorityChart'),
            this.getPriorityChartConfig()
        );
    }

    updateCharts() {
        this.charts.completionChart.data = this.getCompletionChartData();
        this.charts.distributionChart.data = this.getDistributionChartData();
        this.charts.productivityChart.data = this.getProductivityChartData();
        this.charts.priorityChart.data = this.getPriorityChartData();

        Object.values(this.charts).forEach(chart => chart.update());
    }

    getCompletionChartConfig() {
        return {
            type: 'line',
            data: this.getCompletionChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    }
                }
            }
        };
    }

    getCompletionChartData() {
        // Sample data - replace with actual task completion data
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: [65, 75, 80, 85, 90, 95, 100],
                borderColor: '#4f46e5',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.1)'
            }]
        };
    }

    getDistributionChartConfig() {
        return {
            type: 'doughnut',
            data: this.getDistributionChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        };
    }

    getDistributionChartData() {
        // Sample data - replace with actual task distribution data
        return {
            labels: ['Completed', 'In Progress', 'Pending'],
            datasets: [{
                data: [60, 25, 15],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        };
    }

    getProductivityChartConfig() {
        return {
            type: 'bar',
            data: this.getProductivityChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
    }

    getProductivityChartData() {
        // Sample data - replace with actual productivity data
        return {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                data: [8, 12, 15, 10],
                backgroundColor: '#4f46e5'
            }]
        };
    }

    getPriorityChartConfig() {
        return {
            type: 'pie',
            data: this.getPriorityChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        };
    }

    getPriorityChartData() {
        // Sample data - replace with actual priority distribution data
        return {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                data: [30, 50, 20],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
            }]
        };
    }

    exportChart(chartId) {
        const chart = this.charts[chartId];
        const link = document.createElement('a');
        link.download = `${chartId}.png`;
        link.href = chart.toBase64Image();
        link.click();
    }

    updateTasks(tasks) {
        this.tasks = tasks;
        this.updateCharts();
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const analytics = new Analytics();
    
    // Update analytics with tasks from the main app
    if (window.tasks) {
        analytics.updateTasks(window.tasks);
    }
}); 