// Centralized Task Management
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasksFromServer();
        this.updateStats();
        this.updateHeroStats();
    }

    setupEventListeners() {
        // Add new task
        const addNewBtn = document.querySelector('.add-new-btn');
        const taskModal = document.getElementById('task-modal');
        const closeModal = document.querySelector('.close-modal');
        const cancelBtn = document.querySelector('.cancel-btn');
        const taskForm = document.getElementById('task-form');

        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => this.openModal());
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // View options
        const viewOptions = document.querySelectorAll('.view-option');
        viewOptions.forEach(option => {
            option.addEventListener('click', () => {
                viewOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const view = option.dataset.view;
                const container = option.closest('.tasks-section').querySelector('.tasks-container');
                container.dataset.view = view;
                this.renderTasks();
            });
        });
    }

    openModal() {
        const taskModal = document.getElementById('task-modal');
        if (taskModal) {
            taskModal.style.display = 'block';
        }
    }

    closeModal() {
        const taskModal = document.getElementById('task-modal');
        const taskForm = document.getElementById('task-form');
        if (taskModal) {
            taskModal.style.display = 'none';
        }
        if (taskForm) {
            taskForm.reset();
        }
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const taskData = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            priority: formData.get('priority'),
            description: formData.get('description'),
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Add to local array
        this.tasks.push(taskData);
        
        // Save to localStorage
        this.saveTasks();
        
        // Save to server
        this.saveTaskToServer(taskData);
        
        this.closeModal();
        this.renderTasks();
        this.updateStats();
        this.updateHeroStats();
        this.notifyCalendar();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasksFromServer() {
        if (!this.currentUser) return;
        
        fetch(`db_connect.php?action=get_tasks&userId=${this.currentUser.id}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Convert completed from string to boolean
                    data.forEach(task => {
                        task.completed = task.completed === '1' || task.completed === true;
                    });
                    
                    this.tasks = data;
                    this.saveTasks(); // Update localStorage
                    this.renderTasks();
                    this.updateStats();
                    this.updateHeroStats();
                }
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
                // Fall back to localStorage if server request fails
                this.renderTasks();
            });
    }

    saveTaskToServer(taskData) {
        fetch('db_connect.php?action=add_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task saved to server:', data);
        })
        .catch(error => {
            console.error('Error saving task to server:', error);
        });
    }

    updateTaskOnServer(taskData) {
        fetch('db_connect.php?action=update_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task updated on server:', data);
        })
        .catch(error => {
            console.error('Error updating task on server:', error);
        });
    }

    deleteTaskFromServer(taskId) {
        fetch('db_connect.php?action=delete_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task deleted from server:', data);
        })
        .catch(error => {
            console.error('Error deleting task from server:', error);
        });
    }

    renderTasks() {
        const todayTasksContainer = document.getElementById('today-tasks');
        const upcomingTasksContainer = document.getElementById('upcoming-tasks');

        if (!todayTasksContainer || !upcomingTasksContainer) return;

        const userTasks = this.tasks.filter(task => task.userId === this.currentUser.id);
        const today = new Date().toISOString().split('T')[0];
        
        // Filter tasks for today and upcoming
        const todayTasks = userTasks.filter(task => task.date === today);
        const upcomingTasks = userTasks.filter(task => task.date > today);
        
        // Render today's tasks
        this.renderTaskList(todayTasksContainer, todayTasks);
        
        // Render upcoming tasks
        this.renderTaskList(upcomingTasksContainer, upcomingTasks);
    }

    renderTaskList(container, tasks) {
        const view = container.dataset.view || 'list';
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }
        
        if (view === 'list') {
            container.innerHTML = tasks.map(task => this.createTaskListItem(task)).join('');
        } else {
            container.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
        }
        
        // Add event listeners to the newly created elements
        this.addTaskEventListeners(container);
    }

    createTaskListItem(task) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-details">
                        <span class="task-time"><i class="far fa-clock"></i> ${task.time || 'No time set'}</span>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-task-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }

    createTaskCard(task) {
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-card-header">
                    <div class="task-checkbox">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </div>
                    <div class="task-priority ${task.priority}">${task.priority}</div>
                </div>
                <div class="task-card-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-description">${task.description || 'No description'}</div>
                </div>
                <div class="task-card-footer">
                    <div class="task-time"><i class="far fa-clock"></i> ${task.time || 'No time set'}</div>
                    <div class="task-actions">
                        <button class="edit-task-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-task-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    addTaskEventListeners(container) {
        // Checkbox event listeners
        container.querySelectorAll('.task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskElement = e.target.closest('.task-item') || e.target.closest('.task-card');
                const taskId = taskElement.dataset.id;
                this.toggleTaskCompletion(taskId);
            });
        });
        
        // Edit button event listeners
        container.querySelectorAll('.edit-task-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskElement = e.target.closest('.task-item') || e.target.closest('.task-card');
                const taskId = taskElement.dataset.id;
                this.editTask(taskId);
            });
        });
        
        // Delete button event listeners
        container.querySelectorAll('.delete-task-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskElement = e.target.closest('.task-item') || e.target.closest('.task-card');
                const taskId = taskElement.dataset.id;
                this.deleteTask(taskId);
            });
        });
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.saveTasks();
            this.updateTaskOnServer(this.tasks[taskIndex]);
            this.renderTasks();
            this.updateStats();
            this.updateHeroStats();
        }
    }

    editTask(taskId) {
        // Implement task editing functionality
        console.log('Edit task:', taskId);
    }

    deleteTask(taskId) {
        const confirmDelete = confirm('Are you sure you want to delete this task?');
        if (confirmDelete) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.deleteTaskFromServer(taskId);
            this.renderTasks();
            this.updateStats();
            this.updateHeroStats();
        }
    }

    updateStats() {
        const completedCount = document.getElementById('completed-count');
        const pendingCount = document.getElementById('pending-count');
        const overdueCount = document.getElementById('overdue-count');
        const todayCount = document.getElementById('today-count');
        
        if (!completedCount || !pendingCount || !overdueCount || !todayCount) return;
        
        const userTasks = this.tasks.filter(task => task.userId === this.currentUser.id);
        const today = new Date().toISOString().split('T')[0];
        
        const completed = userTasks.filter(task => task.completed).length;
        const pending = userTasks.filter(task => !task.completed).length;
        const overdue = userTasks.filter(task => !task.completed && task.date < today).length;
        const todayTasks = userTasks.filter(task => task.date === today).length;
        
        completedCount.textContent = completed;
        pendingCount.textContent = pending;
        overdueCount.textContent = overdue;
        todayCount.textContent = todayTasks;
    }

    updateHeroStats() {
        const heroCompleted = document.getElementById('hero-completed');
        const heroPending = document.getElementById('hero-pending');
        const heroUpcoming = document.getElementById('hero-upcoming');
        const heroUsername = document.getElementById('hero-username');
        
        if (!heroCompleted || !heroPending || !heroUpcoming) return;
        
        const userTasks = this.tasks.filter(task => task.userId === this.currentUser.id);
        const today = new Date().toISOString().split('T')[0];
        
        const completed = userTasks.filter(task => task.completed).length;
        const pending = userTasks.filter(task => !task.completed).length;
        const upcoming = userTasks.filter(task => task.date > today).length;
        
        heroCompleted.textContent = completed;
        heroPending.textContent = pending;
        heroUpcoming.textContent = upcoming;
        
        if (heroUsername && this.currentUser) {
            heroUsername.textContent = this.currentUser.fullname;
        }
    }

    notifyCalendar() {
        // Dispatch an event to notify the calendar component
        const event = new CustomEvent('tasksUpdated', { detail: { tasks: this.tasks } });
        document.dispatchEvent(event);
    }
}

// Initialize the task manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser && !window.location.pathname.includes('sign')) {
        window.location.href = 'sign-in.html';
        return;
    }
    
    // Initialize task manager
    const taskManager = new TaskManager();
    
    // Make it globally accessible
    window.taskManager = taskManager;
});