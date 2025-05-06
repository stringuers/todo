// Notifications
let notifications = [
    {
        id: 1,
        title: "Task Due Soon",
        message: "Your task 'Complete Project Proposal' is due in 2 hours",
        time: "10 minutes ago",
        type: "warning",
        unread: true
    },
    {
        id: 2,
        title: "Task Completed",
        message: "You completed 'Review Documentation'",
        time: "1 hour ago",
        type: "success",
        unread: true
    },
    {
        id: 3,
        title: "New Task Assigned",
        message: "A new task 'Update Dashboard' has been assigned to you",
        time: "2 hours ago",
        type: "info",
        unread: false
    }
];

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => n.unread).length;
    const badge = document.querySelector('.notification-badge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const notificationList = document.querySelector('.notification-list');
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
            <div class="notification-icon" style="background-color: var(--${notification.type}-color)">
                <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${notification.time}</div>
            </div>
        </div>
    `).join('');

    updateNotificationBadge();
}

function getNotificationIcon(type) {
    switch (type) {
        case 'warning': return 'exclamation-circle';
        case 'success': return 'check-circle';
        case 'info': return 'info-circle';
        default: return 'bell';
    }
}

// Task Management
let tasks = [
    {
        id: 1,
        title: "Complete Project Proposal",
        description: "Finish the project proposal document and submit for review",
        dueDate: new Date().toISOString().split('T')[0], // Today's date
        priority: "high",
        completed: false
    },
    {
        id: 2,
        title: "Review Documentation",
        description: "Go through the updated API documentation",
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        priority: "medium",
        completed: false
    },
    {
        id: 3,
        title: "Update Dashboard",
        description: "Implement new features in the dashboard",
        dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
        priority: "low",
        completed: false
    }
];

function renderTasks(containerId, view = 'list', taskList = tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const tasksContainer = container.querySelector('.tasks-container');
    if (!tasksContainer) return;
    
    tasksContainer.setAttribute('data-view', view);

    if (taskList.length === 0) {
        tasksContainer.innerHTML = `
            <div class="no-tasks-message">
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks found</p>
                <button class="add-task-btn" onclick="showAddTaskModal()">
                    <i class="fas fa-plus"></i>
                    Add New Task
                </button>
            </div>
        `;
        return;
    }

    tasksContainer.innerHTML = taskList.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox" onclick="toggleTaskCompletion(${task.id})">
                <i class="fas fa-check"></i>
            </div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <div class="task-date">
                        <i class="far fa-calendar"></i>
                        ${formatDate(task.dueDate)}
                    </div>
                    <div class="task-priority ${task.priority}">
                        <i class="fas fa-flag"></i>
                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        updateTasksDisplay();
        updateDashboardStats();
    }
}

function updateStats() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const upcomingTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) > new Date()).length;

    document.querySelector('.stat-value.completed').textContent = completedTasks;
    document.querySelector('.stat-value.pending').textContent = pendingTasks;
    document.querySelector('.stat-value.upcoming').textContent = upcomingTasks;
}

// View Toggle
function toggleView(containerId, view) {
    const container = document.getElementById(containerId);
    const buttons = container.querySelectorAll('.view-option');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks(containerId, view);
}

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.main-content > *');

    // Hide all sections except dashboard initially
    sections.forEach(section => {
        if (!section.classList.contains('hero-section') && !section.classList.contains('header')) {
            section.style.display = 'none';
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked nav item
            item.classList.add('active');
            
            const section = item.dataset.section;
            const href = item.getAttribute('href');
            
            if (href && href !== '#') {
                window.location.href = href;
                return;
            }
            
            // Hide all sections
            sections.forEach(section => {
                if (!section.classList.contains('hero-section') && !section.classList.contains('header')) {
                    section.style.display = 'none';
                }
            });

            // Show the selected section
            switch(section) {
                case 'dashboard':
                    document.querySelector('.hero-section').style.display = 'flex';
                    document.querySelector('.stats-container').style.display = 'grid';
                    document.querySelectorAll('.tasks-section').forEach(section => {
                        section.style.display = 'block';
                    });
                    updateDashboardStats();
                    break;
                case 'tasks':
                    document.querySelector('.hero-section').style.display = 'none';
                    document.querySelector('.stats-container').style.display = 'none';
                    document.querySelectorAll('.tasks-section').forEach(section => {
                        section.style.display = 'block';
                    });
                    updateTasksDisplay();
                    break;
                case 'calendar':
                    showCalendarSection();
                    break;
                case 'analytics':
                    showAnalyticsSection();
                    break;
                case 'settings':
                    showSettingsSection();
                    break;
            }
        });
    });
}

function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const upcomingTasks = tasks.filter(t => t.dueDate > today && !t.completed).length;

    // Update hero stats
    const heroCompleted = document.getElementById('hero-completed');
    const heroPending = document.getElementById('hero-pending');
    const heroUpcoming = document.getElementById('hero-upcoming');

    if (heroCompleted) heroCompleted.textContent = completedTasks;
    if (heroPending) heroPending.textContent = pendingTasks;
    if (heroUpcoming) heroUpcoming.textContent = upcomingTasks;

    // Update stat cards
    const statCompleted = document.querySelector('.stat-value.completed');
    const statPending = document.querySelector('.stat-value.pending');
    const statUpcoming = document.querySelector('.stat-value.upcoming');

    if (statCompleted) statCompleted.textContent = completedTasks;
    if (statPending) statPending.textContent = pendingTasks;
    if (statUpcoming) statUpcoming.textContent = upcomingTasks;

    // Update progress bars
    const totalTasks = tasks.length;
    const completedPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const pendingPercentage = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;
    const upcomingPercentage = totalTasks > 0 ? (upcomingTasks / totalTasks) * 100 : 0;

    const progressBars = document.querySelectorAll('.progress');
    if (progressBars.length > 0) {
        progressBars.forEach((progress, index) => {
            const percentages = [completedPercentage, pendingPercentage, upcomingPercentage];
            progress.style.width = `${percentages[index]}%`;
        });
    }
}

function updateTasksDisplay() {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter tasks for today
    const todayTasks = tasks.filter(task => task.dueDate === today && !task.completed);
    renderTasks('today-tasks', 'list', todayTasks);
    
    // Filter upcoming tasks
    const upcomingTasks = tasks.filter(task => task.dueDate > today && !task.completed);
    renderTasks('upcoming-tasks', 'list', upcomingTasks);
}

function showCalendarSection() {
    let calendarSection = document.querySelector('.calendar-section');
    if (!calendarSection) {
        calendarSection = document.createElement('div');
        calendarSection.className = 'calendar-section';
        calendarSection.innerHTML = `
            <div class="section-header">
                <h2>Calendar</h2>
                <div class="calendar-actions">
                    <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
                    <span class="current-month">March 2024</span>
                    <button class="next-month"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="calendar-container">
                <div class="calendar-grid">
                    <div class="calendar-header">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div class="calendar-days">
                        ${generateCalendarDays()}
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(calendarSection);
    }
    calendarSection.style.display = 'block';
}

function showAnalyticsSection() {
    let analyticsSection = document.querySelector('.analytics-section');
    if (!analyticsSection) {
        analyticsSection = document.createElement('div');
        analyticsSection.className = 'analytics-section';
        analyticsSection.innerHTML = `
            <div class="section-header">
                <h2>Analytics</h2>
                <div class="analytics-filters">
                    <select class="time-filter">
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>
            <div class="analytics-container">
                <div class="analytics-chart">
                    <canvas id="taskChart"></canvas>
                </div>
                <div class="analytics-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Completion Rate</h3>
                            <div class="stat-value">75%</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Average Time</h3>
                            <div class="stat-value">2.5h</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(analyticsSection);
    }
    analyticsSection.style.display = 'block';
}

function showSettingsSection() {
    let settingsSection = document.querySelector('.settings-section');
    if (!settingsSection) {
        settingsSection = document.createElement('div');
        settingsSection.className = 'settings-section';
        settingsSection.innerHTML = `
            <div class="section-header">
                <h2>Settings</h2>
            </div>
            <div class="settings-container">
                <div class="settings-card">
                    <div class="card-header">
                        <h3>Profile Settings</h3>
                    </div>
                    <form class="settings-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" value="Moemen">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" value="user@example.com">
                        </div>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </form>
                </div>
                <div class="settings-card">
                    <div class="card-header">
                        <h3>Appearance</h3>
                    </div>
                    <div class="theme-options">
                        <div class="toggle-group">
                            <span>Dark Mode</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="darkMode">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(settingsSection);
    }
    settingsSection.style.display = 'block';
}

function generateCalendarDays() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    let daysHTML = '';
    let dayCount = 1;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        daysHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
        const isToday = i === today.getDate();
        const hasTasks = tasks.some(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === i && 
                   taskDate.getMonth() === today.getMonth() && 
                   taskDate.getFullYear() === today.getFullYear();
        });
        
        daysHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}">
                <span class="day-number">${i}</span>
                ${hasTasks ? '<span class="task-dot"></span>' : ''}
            </div>
        `;
    }
    
    return daysHTML;
}

function showAddTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function addTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;
    
    const newTask = {
        id: tasks.length + 1,
        title,
        description,
        dueDate,
        priority,
        completed: false
    };
    
    tasks.push(newTask);
    updateTasksDisplay();
    updateDashboardStats();
    
    // Close modal and reset form
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    event.target.reset();
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    updateTasksDisplay();
    updateDashboardStats();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('task-modal');
    if (!modal) return;

    // Fill the form with task data
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const dateInput = document.getElementById('task-date');
    const priorityInput = document.getElementById('task-priority');

    if (titleInput) titleInput.value = task.title;
    if (descriptionInput) descriptionInput.value = task.description;
    if (dateInput) dateInput.value = task.dueDate;
    if (priorityInput) priorityInput.value = task.priority;

    // Show the modal
    modal.style.display = 'flex';

    // Update the form submission to handle editing
    const form = document.getElementById('task-form');
    if (!form) return;

    const originalSubmit = form.onsubmit;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Update the task
        if (titleInput) task.title = titleInput.value;
        if (descriptionInput) task.description = descriptionInput.value;
        if (dateInput) task.dueDate = dateInput.value;
        if (priorityInput) task.priority = priorityInput.value;
        
        // Update displays
        updateTasksDisplay();
        updateDashboardStats();
        
        // Close modal and reset form
        modal.style.display = 'none';
        form.reset();
        
        // Restore original submit handler
        form.onsubmit = originalSubmit;
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    updateDashboardStats();
    updateTasksDisplay();
    renderNotifications();

    // Add event listeners
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', addTask);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.style.display = 'none';
            }
        });
    }
    
    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('task-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });

    // Add task button in hero section
    const addTaskBtn = document.querySelector('.add-new-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showAddTaskModal);
    }

    // Close modal button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('task-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Cancel button in modal
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const modal = document.getElementById('task-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Set initial active section
    const currentPath = window.location.pathname;
    if (currentPath.includes('mytasks.html')) {
        document.querySelector('.nav-item[data-section="tasks"]').classList.add('active');
        document.querySelector('.hero-section').style.display = 'none';
        document.querySelector('.stats-container').style.display = 'none';
        document.querySelectorAll('.tasks-section').forEach(section => {
            section.style.display = 'block';
        });
        updateTasksDisplay();
    } else {
        document.querySelector('.nav-item[data-section="dashboard"]').classList.add('active');
        document.querySelector('.hero-section').style.display = 'flex';
        document.querySelector('.stats-container').style.display = 'grid';
        document.querySelectorAll('.tasks-section').forEach(section => {
            section.style.display = 'block';
        });
        updateDashboardStats();
    }
}); 