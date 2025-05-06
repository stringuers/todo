// Settings Management
class SettingsManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            theme: 'light',
            notifications: true,
            darkMode: false,
            emailNotifications: true,
            pushNotifications: true,
            taskReminders: true,
            defaultView: 'list'
        };
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.applySettings();
        this.updateUserInfo();
    }

    setupEventListeners() {
        // Theme Selection
        const themeOptions = document.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const theme = option.dataset.theme;
                this.settings.theme = theme;
                this.settings.darkMode = theme === 'dark';
                this.saveSettings();
                this.applyTheme(theme);
            });
        });

        // Toggle Switches
        const toggleSwitches = document.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(switch_ => {
            switch_.addEventListener('change', (e) => {
                const toggleItem = e.target.closest('.toggle-item');
                const settingName = toggleItem.querySelector('span').textContent.toLowerCase().replace(/\s+/g, '');
                
                if (settingName.includes('email')) {
                    this.settings.emailNotifications = e.target.checked;
                } else if (settingName.includes('push')) {
                    this.settings.pushNotifications = e.target.checked;
                } else if (settingName.includes('task')) {
                    this.settings.taskReminders = e.target.checked;
                } else {
                    this.settings.notifications = e.target.checked;
                }
                
                this.saveSettings();
            });
        });

        // Default View Selection
        const viewSelect = document.querySelector('select');
        if (viewSelect) {
            viewSelect.addEventListener('change', (e) => {
                this.settings.defaultView = e.target.value;
                this.saveSettings();
            });
        }

        // Save Account Changes
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveAccountChanges();
            });
        }

        // Data Management Buttons
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importBtn = document.querySelector('.import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearData();
            });
        }

        // Delete Account Button
        const deleteAccountBtn = document.querySelector('.delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.deleteAccount();
            });
        }
    }

    loadSettings() {
        // If we have settings in localStorage, use them
        if (localStorage.getItem('settings')) {
            this.settings = JSON.parse(localStorage.getItem('settings'));
        }
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);
        
        // Set toggle switches
        const emailToggle = document.querySelector('.toggle-item:nth-child(1) input');
        const pushToggle = document.querySelector('.toggle-item:nth-child(2) input');
        const taskToggle = document.querySelector('.toggle-item:nth-child(3) input');
        
        if (emailToggle) emailToggle.checked = this.settings.emailNotifications;
        if (pushToggle) pushToggle.checked = this.settings.pushNotifications;
        if (taskToggle) taskToggle.checked = this.settings.taskReminders;
        
        // Set default view
        const viewSelect = document.querySelector('select');
        if (viewSelect) viewSelect.value = this.settings.defaultView;
        
        // Set theme option
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.settings.theme) {
                option.classList.add('active');
            }
        });
    }

    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--card-bg', '#1f2937');
            document.documentElement.style.setProperty('--text-primary', '#f9fafb');
            document.documentElement.style.setProperty('--text-secondary', '#d1d5db');
            document.documentElement.style.setProperty('--border-color', '#374151');
        } else {
            document.documentElement.style.setProperty('--card-bg', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#111827');
            document.documentElement.style.setProperty('--text-secondary', '#6b7280');
            document.documentElement.style.setProperty('--border-color', '#e5e7eb');
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            const usernameElement = document.getElementById('username');
            const usernameInput = document.getElementById('username-input');
            const emailElement = document.getElementById('user-email');
            const emailInput = document.getElementById('email');
            
            if (usernameElement) usernameElement.textContent = this.currentUser.fullname;
            if (usernameInput) usernameInput.value = this.currentUser.fullname;
            if (emailElement) emailElement.textContent = this.currentUser.email;
            if (emailInput) emailInput.value = this.currentUser.email;
        }
    }

    saveAccountChanges() {
        const username = document.getElementById('username-input').value;
        const email = document.getElementById('email').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!this.currentUser) {
            alert('You must be logged in to change account settings');
            return;
        }
        
        // Validate inputs
        if (!username || !email) {
            alert('Username and email are required');
            return;
        }
        
        // Check if passwords match
        if (newPassword && newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        // Update user info
        this.currentUser.fullname = username;
        this.currentUser.email = email;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Update UI
        this.updateUserInfo();
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        alert('Account settings updated successfully');
    }

    exportData() {
        if (!this.currentUser) {
            alert('You must be logged in to export data');
            return;
        }
        
        // Get tasks for current user
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const userTasks = tasks.filter(task => task.userId === this.currentUser.id);
        
        // Create export data
        const exportData = {
            user: {
                id: this.currentUser.id,
                fullname: this.currentUser.fullname,
                email: this.currentUser.email
            },
            settings: this.settings,
            tasks: userTasks
        };
        
        // Convert to JSON string
        const dataStr = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `todo_app_export_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importData() {
        if (!this.currentUser) {
            alert('You must be logged in to import data');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate imported data
                    if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
                        throw new Error('Invalid import file format');
                    }
                    
                    // Get current tasks
                    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                    
                    // Remove current user's tasks
                    const otherTasks = tasks.filter(task => task.userId !== this.currentUser.id);
                    
                    // Add imported tasks with current user ID
                    const importedTasks = importedData.tasks.map(task => ({
                        ...task,
                        userId: this.currentUser.id
                    }));
                    
                    // Combine tasks
                    const newTasks = [...otherTasks, ...importedTasks];
                    
                    // Save to localStorage
                    localStorage.setItem('tasks', JSON.stringify(newTasks));
                    
                    // Import settings if available
                    if (importedData.settings) {
                        this.settings = importedData.settings;
                        this.saveSettings();
                        this.applySettings();
                    }
                    
                    alert('Data imported successfully');
                    
                    // Reload page to reflect changes
                    window.location.reload();
                } catch (error) {
                    console.error('Import error:', error);
                    alert('Failed to import data: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearData() {
        if (!this.currentUser) {
            alert('You must be logged in to clear data');
            return;
        }
        
        const confirmClear = confirm('Are you sure you want to clear all your data? This action cannot be undone.');
        
        if (confirmClear) {
            // Get current tasks
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            
            // Remove current user's tasks
            const otherTasks = tasks.filter(task => task.userId !== this.currentUser.id);
            
            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(otherTasks));
            
            // Reset settings to default
            this.settings = {
                theme: 'light',
                notifications: true,
                darkMode: false,
                emailNotifications: true,
                pushNotifications: true,
                taskReminders: true,
                defaultView: 'list'
            };
            
            this.saveSettings();
            this.applySettings();
            
            alert('All data has been cleared');
            
            // Reload page to reflect changes
            window.location.reload();
        }
    }

    deleteAccount() {
        if (!this.currentUser) {
            alert('You must be logged in to delete your account');
            return;
        }
        
        const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        
        if (confirmDelete) {
            // Clear user data
            localStorage.removeItem('currentUser');
            
            // Clear user tasks
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const otherTasks = tasks.filter(task => task.userId !== this.currentUser.id);
            localStorage.setItem('tasks', JSON.stringify(otherTasks));
            
            // Reset settings
            localStorage.removeItem('settings');
            
            alert('Your account has been deleted');
            
            // Redirect to sign in page
            window.location.href = 'sign-in.html';
        }
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
    
    // Make it globally accessible
    window.settingsManager = settingsManager;
});