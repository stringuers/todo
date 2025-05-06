// Tasks Page Functionality
class TasksPage {
    constructor() {
        this.tasks = [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentView = 'list';
        this.currentTab = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
        this.updateUserInfo();
        this.updateTaskSummary();
        
        // Remove sample tasks after loading real tasks
        setTimeout(() => {
            this.renderTasks();
        }, 1000);
    }

    loadTasks() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('username').textContent = this.currentUser.fullname || 'User';
            document.getElementById('user-email').textContent = this.currentUser.email || 'user@example.com';
        }
    }

    updateTaskSummary() {
        const userTasks = this.tasks.filter(task => task.userId === this.currentUser.id);
        const today = new Date().toISOString().split('T')[0];

        const completedCount = userTasks.filter(task => task.completed).length;
        const pendingCount = userTasks.filter(task => !task.completed).length;
        const overdueCount = userTasks.filter(task => !task.completed && task.date < today).length;
        const todayCount = userTasks.filter(task => task.date === today).length;

        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('overdue-count').textContent = overdueCount;
        document.getElementById('today-count').textContent = todayCount;
        document.getElementById('tasks-count').textContent = userTasks.length;
    }

    setupEventListeners() {
        // View options
        const viewOptions = document.querySelectorAll('.view-option');
        viewOptions.forEach(option => {
            option.addEventListener('click', () => {
                viewOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.currentView = option.dataset.view;
                this.renderTasks();
            });
        });

        // Tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                tabButtons.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.renderTasks();
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-tasks');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.renderTasks(searchTerm);
            });
        }

        // Add new task button
        const addNewBtn = document.querySelector('.add-new-btn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => this.openTaskModal());
        }

        // Close modal
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeTaskModal());
        }

        // Cancel button
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeTaskModal());
        }

        // Task form
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // For sample tasks
        const sampleCheckboxes = document.querySelectorAll('.task-checkbox');
        const sampleEditBtns = document.querySelectorAll('.edit-task');
        const sampleDeleteBtns = document.querySelectorAll('.delete-task');

        sampleCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', () => {
                const taskElement = checkbox.closest('.task-card');
                taskElement.classList.toggle('completed');
                checkbox.classList.toggle('completed');
                taskElement.querySelector('.task-title').classList.toggle('completed');
            });
        });

        sampleEditBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openTaskModal());
        });

        sampleDeleteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    btn.closest('.task-card').remove();
                }
            });
        });
    }

    openTaskModal() {
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        if (modal) {
            modal.style.display = 'none';
        }
        if (form) {
            form.reset();
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

        this.tasks.push(taskData);
        this.saveTasks();
        this.closeTaskModal();
        this.renderTasks();
        this.updateTaskSummary();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks(searchTerm = '') {
        const tasksContainer = document.getElementById('all-tasks');
        if (!tasksContainer) return;

        // Set the view
        tasksContainer.dataset.view = this.currentView;
        
        // Clear the container
        tasksContainer.innerHTML = '';

        // Filter tasks based on the current tab and user
        const userTasks = this.tasks.filter(task => task.userId === this.currentUser.id);
        let filteredTasks = [];
        
        const today = new Date().toISOString().split('T')[0];

        switch (this.currentTab) {
            case 'all':
                filteredTasks = userTasks;
                break;
            case 'today':
                filteredTasks = userTasks.filter(task => task.date === today);
                break;
            case 'upcoming':
                filteredTasks = userTasks.filter(task => task.date > today);
                break;
            case 'completed':
                filteredTasks = userTasks.filter(task => task.completed);
                break;
            case 'overdue':
                filteredTasks = userTasks.filter(task => !task.completed && task.date < today);
                break;
        }

        // Apply search filter if term exists
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        // Update task count
        document.getElementById('tasks-count').textContent = filteredTasks.length;

        // Handle no tasks
        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="no-tasks-message">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No ${this.currentTab} tasks found</p>
                    <button class="add-task-btn" onclick="tasksPage.openTaskModal()">
                        <i class="fas fa-plus"></i>
                        Add New Task
                    </button>
                </div>
            `;
            return;
        }

        // Handle board view
        if (this.currentView === 'board') {
            this.renderBoardView(tasksContainer, filteredTasks);
            return;
        }

        // Render tasks for list and grid views
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-card ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            const priorityClass = `priority-${task.priority}`;
            const completedClass = task.completed ? 'completed' : '';

            taskElement.innerHTML = `
                <div class="task-header">
                    <div class="task-checkbox ${completedClass}" data-id="${task.id}">
                        <i class="fas fa-check"></i>
                    </div>
                    <h3 class="task-title ${completedClass}">${task.title}</h3>
                    <div class="task-actions">
                        <button class="edit-task" data-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-task" data-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-details">
                    <span class="task-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(task.date)}
                    </span>
                    <span class="task-time">
                        <i class="fas fa-clock"></i>
                        ${this.formatTime(task.time)}
                    </span>
                    <span class="task-priority ${priorityClass}">
                        <i class="fas fa-flag"></i>
                        ${task.priority}
                    </span>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            `;

            tasksContainer.appendChild(taskElement);

            // Add event listeners
            const checkbox = taskElement.querySelector('.task-checkbox');
            const editBtn = taskElement.querySelector('.edit-task');
            const deleteBtn = taskElement.querySelector('.delete-task');

            checkbox.addEventListener('click', () => this.toggleTaskComplete(task.id));
            editBtn.addEventListener('click', () => this.editTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        });
    }

    renderBoardView(container, tasks) {
        // Create columns
        const columns = {
            todo: {
                title: 'To Do',
                tasks: tasks.filter(t => !t.completed && new Date(t.date) >= new Date())
            },
            inProgress: {
                title: 'In Progress',
                tasks: tasks.filter(t => !t.completed && new Date(t.date) < new Date())
            },
            completed: {
                title: 'Completed',
                tasks: tasks.filter(t => t.completed)
            }
        };

        // Render each column
        Object.keys(columns).forEach(columnKey => {
            const column = columns[columnKey];
            const columnElement = document.createElement('div');
            columnElement.className = 'board-column';
            columnElement.innerHTML = `
                <h3>
                    ${column.title}
                    <span class="column-count">${column.tasks.length}</span>
                </h3>
            `;

            const columnTasks = document.createElement('div');
            columnTasks.className = 'column-tasks';

            if (column.tasks.length === 0) {
                columnTasks.innerHTML = `<p class="no-tasks">No tasks</p>`;
            } else {
                column.tasks.forEach(task => {
                    const taskElement = document.createElement('div');
                    taskElement.className = `task-card ${task.completed ? 'completed' : ''}`;
                    taskElement.dataset.id = task.id;

                    const priorityClass = `priority-${task.priority}`;

                    taskElement.innerHTML = `
                        <div class="task-header">
                            <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                                <i class="fas fa-check"></i>
                            </div>
                            <h3 class="task-title">${task.title}</h3>
                        </div>
                        <div class="task-details">
                            <span class="task-date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDate(task.date)}
                            </span>
                            <span class="task-priority ${priorityClass}">
                                <i class="fas fa-flag"></i>
                                ${task.priority}
                            </span>
                        </div>
                    `;

                    columnTasks.appendChild(taskElement);

                    // Add event listener
                    const checkbox = taskElement.querySelector('.task-checkbox');
                    checkbox.addEventListener('click', () => this.toggleTaskComplete(task.id));
                });
            }

            columnElement.appendChild(columnTasks);
            container.appendChild(columnElement);
        });
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskSummary();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            // Populate the form
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-date').value = task.date;
            document.getElementById('task-time').value = task.time;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-description').value = task.description || '';

            // Remove the task
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();

            // Open the modal
            this.openTaskModal();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateTaskSummary();
            
            // Dispatch event to update dashboard
            document.dispatchEvent(new Event('tasksUpdated'));
            
            // Call API to delete task
            fetch('api.php?action=delete_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: taskId })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task deleted from server:', data);
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
        }
    }

    // Add task to server
    addTask(taskData) {
        // Add to local storage first
        this.tasks.push(taskData);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskSummary();
        
        // Dispatch event to update dashboard
        document.dispatchEvent(new Event('tasksUpdated'));
        
        // Send to server
        fetch('api.php?action=add_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task added to server:', data);
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
    }
    
    // Update task on server
    updateTask(taskData) {
        // Update in local storage first
        const index = this.tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            this.tasks[index] = taskData;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskSummary();
        }
        
        // Dispatch event to update dashboard
        document.dispatchEvent(new Event('tasksUpdated'));
        
        // Send to server
        fetch('api.php?action=update_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task updated on server:', data);
        })
        .catch(error => {
            console.error('Error updating task:', error);
        });
    }
    
    // Toggle task completion status
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskSummary();
            
            // Dispatch event to update dashboard
            document.dispatchEvent(new Event('tasksUpdated'));
            
            // Update on server
            fetch('api.php?action=update_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task completion status updated on server:', data);
            })
            .catch(error => {
                console.error('Error updating task completion status:', error);
            });
        }
    }
    
    formatDate(dateString) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const taskDate = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        // Format today and tomorrow specially
        if (taskDate.toDateString() === today.toDateString()) {
            return "Today";
        } else if (taskDate.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        } else {
            // For dates within the next week, show "in X days"
            const diffTime = Math.abs(taskDate - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 7 && taskDate > today) {
                return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
            } else {
                return taskDate.toLocaleDateString('en-US', options);
            }
        }
    }

    formatTime(timeString) {
        if (!timeString) return '';
        try {
            return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return timeString;
        }
    }
}

// Initialize the Tasks page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'sign-in.html';
        return;
    }

    // Initialize the Tasks page
    window.tasksPage = new TasksPage();
});