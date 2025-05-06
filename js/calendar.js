// Calendar functionality
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.tasks = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
        this.renderCalendar();
    }

    setupEventListeners() {
        // Previous month button
        document.querySelector('.prev-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        // Next month button
        document.querySelector('.next-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // View options
        document.querySelectorAll('.view-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.view-option').forEach(btn => btn.classList.remove('active'));
                option.classList.add('active');
                // Add view switching logic here
            });
        });

        // Day click handler
        document.querySelector('.calendar-days')?.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (dayElement && !dayElement.classList.contains('other-month')) {
                const day = parseInt(dayElement.textContent);
                const month = this.currentDate.getMonth();
                const year = this.currentDate.getFullYear();
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                this.showDayTasks(dateStr);
            }
        });
    }

    loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.tasks = tasks.filter(task => task.userId === currentUser.id);
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month and year display
        const monthYearDisplay = document.querySelector('.current-month');
        if (monthYearDisplay) {
            monthYearDisplay.textContent = 
                this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        }

        // Get first day of month and total days in month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Clear previous days
        const calendarDays = document.querySelector('.calendar-days');
        if (!calendarDays) return;
        calendarDays.innerHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if it's today
            if (day === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            // Check if there are tasks for this day
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = this.tasks.filter(task => task.date === dateStr);
            
            if (dayTasks.length > 0) {
                dayElement.classList.add('has-tasks');
                const taskCount = document.createElement('div');
                taskCount.className = 'task-count';
                taskCount.textContent = dayTasks.length;
                dayElement.appendChild(taskCount);
            }

            calendarDays.appendChild(dayElement);
        }

        // Add empty cells for days after the last day of the month
        const remainingCells = 42 - (startingDay + totalDays); // 6 rows * 7 days = 42
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarDays.appendChild(emptyDay);
        }
    }

    showDayTasks(dateStr) {
        const dayTasks = this.tasks.filter(task => task.date === dateStr);
        if (dayTasks.length > 0) {
            // Create a modal or popup to show tasks
            const modal = document.createElement('div');
            modal.className = 'day-tasks-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Tasks for ${this.formatDate(dateStr)}</h3>
                    <div class="tasks-list">
                        ${dayTasks.map(task => `
                            <div class="task-item ${task.completed ? 'completed' : ''}">
                                <div class="task-checkbox" data-id="${task.id}">
                                    <i class="fas fa-check"></i>
                                </div>
                                <div class="task-info">
                                    <h4>${task.title}</h4>
                                    <p>${task.time}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="close-modal">Close</button>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.remove();
            });

            modal.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('click', (e) => {
                    const taskId = e.currentTarget.dataset.id;
                    if (window.taskManager) {
                        window.taskManager.toggleTaskComplete(taskId);
                        this.loadTasks();
                        this.renderCalendar();
                    }
                });
            });
        }
    }

    updateTasks(tasks) {
        this.tasks = tasks;
        this.renderCalendar();
    }

    formatDate(dateString) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new Calendar();
}); 