// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initial load of dashboard stats
    fetchDashboardStats();
    
    // Listen for task updates
    document.addEventListener('tasksUpdated', function() {
        fetchDashboardStats();
    });
});

// Function to fetch dashboard statistics
function fetchDashboardStats() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    fetch(`api.php?action=get_dashboard_stats&userId=${currentUser.id}`)
        .then(response => response.json())
        .then(data => {
            // Update dashboard statistics
            updateDashboardUI(data);
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
        });
}

// Function to update dashboard UI elements
function updateDashboardUI(data) {
    // Update task count elements
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const pendingTasksElement = document.getElementById('pending-tasks');
    const inProgressTasksElement = document.getElementById('in-progress-tasks');
    
    if (totalTasksElement) totalTasksElement.textContent = data.total;
    if (completedTasksElement) completedTasksElement.textContent = data.completed;
    if (pendingTasksElement) pendingTasksElement.textContent = data.pending;
    if (inProgressTasksElement) inProgressTasksElement.textContent = data.inProgress;
    
    // Update progress bars
    const completedProgressBar = document.querySelector('.completed-progress');
    const pendingProgressBar = document.querySelector('.pending-progress');
    const inProgressProgressBar = document.querySelector('.in-progress-progress');
    
    if (completedProgressBar && data.total > 0) {
        const completedPercentage = (data.completed / data.total) * 100;
        completedProgressBar.style.width = `${completedPercentage}%`;
    }
    
    if (pendingProgressBar && data.total > 0) {
        const pendingPercentage = (data.pending / data.total) * 100;
        pendingProgressBar.style.width = `${pendingPercentage}%`;
    }
    
    if (inProgressProgressBar && data.total > 0) {
        const inProgressPercentage = (data.inProgress / data.total) * 100;
        inProgressProgressBar.style.width = `${inProgressPercentage}%`;
    }
    
    // Update dashboard icons/cards
    updateDashboardIcons(data);
}

// Function to update dashboard icons
function updateDashboardIcons(data) {
    // Update completed tasks icon/card
    const completedIcon = document.querySelector('.completed-icon');
    if (completedIcon) {
        completedIcon.textContent = data.completed;
    }
    
    // Update pending tasks icon/card
    const pendingIcon = document.querySelector('.pending-icon');
    if (pendingIcon) {
        pendingIcon.textContent = data.pending;
    }
    
    // Update in-progress tasks icon/card
    const inProgressIcon = document.querySelector('.in-progress-icon');
    if (inProgressIcon) {
        inProgressIcon.textContent = data.inProgress;
    }
    
    // Update other dashboard elements as needed
    const highPriorityElement = document.querySelector('.high-priority-count');
    if (highPriorityElement) {
        highPriorityElement.textContent = data.highPriority;
    }
    
    const upcomingElement = document.querySelector('.upcoming-count');
    if (upcomingElement) {
        upcomingElement.textContent = data.upcoming;
    }
    
    const overdueElement = document.querySelector('.overdue-count');
    if (overdueElement) {
        overdueElement.textContent = data.overdue;
    }
}