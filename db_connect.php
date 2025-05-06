<?php
// Database connection parameters
$host = "localhost";
$username = "root"; // Default phpMyAdmin username
$password = ""; // Default phpMyAdmin password (often empty)
$database = "todo_app"; // Your database name

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set
$conn->set_charset("utf8mb4");

// Function to handle API requests
function handleRequest() {
    global $conn;
    
    // Get request method
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Get request path
    $path = isset($_GET['action']) ? $_GET['action'] : '';
    
    // Handle different API endpoints
    switch ($path) {
        case 'get_tasks':
            getTasks($conn);
            break;
        case 'add_task':
            addTask($conn);
            break;
        case 'update_task':
            updateTask($conn);
            break;
        case 'delete_task':
            deleteTask($conn);
            break;
        case 'get_users':
            getUsers($conn);
            break;
        case 'add_user':
            addUser($conn);
            break;
        case 'login':
            loginUser($conn);
            break;
        case 'update_user':
            updateUser($conn);
            break;
        case 'delete_user':
            deleteUser($conn);
            break;
        case 'get_settings':
            getSettings($conn);
            break;
        case 'save_settings':
            saveSettings($conn);
            break;
        case 'clear_user_data':
            clearUserData($conn);
            break;
        case 'get_dashboard_stats':
            getDashboardStats($conn);
            break;
        default:
            sendResponse(404, ['error' => 'Endpoint not found']);
    }
}

// Function to get all tasks for a user
function getTasks($conn) {
    if (!isset($_GET['userId'])) {
        sendResponse(400, ['error' => 'User ID is required']);
        return;
    }
    
    $userId = $_GET['userId'];
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE userId = ?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    
    sendResponse(200, $tasks);
}

// Function to add a new task
function addTask($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['userId']) || !isset($data['title']) || !isset($data['date'])) {
        sendResponse(400, ['error' => 'Missing required fields']);
        return;
    }
    
    $stmt = $conn->prepare("INSERT INTO tasks (id, userId, title, date, time, priority, description, completed, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $completed = $data['completed'] ? '1' : '0';
    $stmt->bind_param("sssssssss", 
        $data['id'],
        $data['userId'],
        $data['title'],
        $data['date'],
        $data['time'],
        $data['priority'],
        $data['description'],
        $completed,
        $data['createdAt']
    );
    
    if ($stmt->execute()) {
        sendResponse(201, ['message' => 'Task added successfully', 'id' => $data['id']]);
    } else {
        sendResponse(500, ['error' => 'Failed to add task: ' . $conn->error]);
    }
}

// Function to update a task
function updateTask($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        sendResponse(400, ['error' => 'Task ID is required']);
        return;
    }
    
    $stmt = $conn->prepare("UPDATE tasks SET title = ?, date = ?, time = ?, priority = ?, description = ?, completed = ? WHERE id = ?");
    $completed = $data['completed'] ? '1' : '0';
    $stmt->bind_param("sssssss", 
        $data['title'],
        $data['date'],
        $data['time'],
        $data['priority'],
        $data['description'],
        $completed,
        $data['id']
    );
    
    if ($stmt->execute()) {
        sendResponse(200, ['message' => 'Task updated successfully']);
    } else {
        sendResponse(500, ['error' => 'Failed to update task: ' . $conn->error]);
    }
}

// Function to delete a task
function deleteTask($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        sendResponse(400, ['error' => 'Task ID is required']);
        return;
    }
    
    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->bind_param("s", $data['id']);
    
    if ($stmt->execute()) {
        sendResponse(200, ['message' => 'Task deleted successfully']);
    } else {
        sendResponse(500, ['error' => 'Failed to delete task: ' . $conn->error]);
    }
}

// Function to get all users
function getUsers($conn) {
    $result = $conn->query("SELECT id, fullname, email, createdAt FROM users");
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    sendResponse(200, $users);
}

// Function to add a new user
function addUser($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['fullname']) || !isset($data['email']) || !isset($data['password'])) {
        sendResponse(400, ['error' => 'Missing required fields']);
        return;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse(409, ['error' => 'Email already registered']);
        return;
    }
    
    // Hash the password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("INSERT INTO users (id, fullname, email, password, createdAt) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", 
        $data['id'],
        $data['fullname'],
        $data['email'],
        $hashedPassword,
        $data['createdAt']
    );
    
    if ($stmt->execute()) {
        // Create default settings for the user
        $defaultSettings = [
            'userId' => $data['id'],
            'theme' => 'light',
            'notifications' => true,
            'darkMode' => false,
            'emailNotifications' => true,
            'pushNotifications' => true,
            'taskReminders' => true,
            'defaultView' => 'list'
        ];
        
        $settingsStmt = $conn->prepare("INSERT INTO settings (userId, theme, notifications, darkMode, emailNotifications, pushNotifications, taskReminders, defaultView) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $notifications = $defaultSettings['notifications'] ? '1' : '0';
        $darkMode = $defaultSettings['darkMode'] ? '1' : '0';
        $emailNotifications = $defaultSettings['emailNotifications'] ? '1' : '0';
        $pushNotifications = $defaultSettings['pushNotifications'] ? '1' : '0';
        $taskReminders = $defaultSettings['taskReminders'] ? '1' : '0';
        
        $settingsStmt->bind_param("ssssssss", 
            $defaultSettings['userId'],
            $defaultSettings['theme'],
            $notifications,
            $darkMode,
            $emailNotifications,
            $pushNotifications,
            $taskReminders,
            $defaultSettings['defaultView']
        );
        
        $settingsStmt->execute();
        
        sendResponse(201, [
            'message' => 'User registered successfully',
            'user' => [
                'id' => $data['id'],
                'fullname' => $data['fullname'],
                'email' => $data['email'],
                'createdAt' => $data['createdAt']
            ]
        ]);
    } else {
        sendResponse(500, ['error' => 'Failed to register user: ' . $conn->error]);
    }
}

// Function to login a user
function loginUser($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        sendResponse(400, ['error' => 'Email and password are required']);
        return;
    }
    
    $stmt = $conn->prepare("SELECT id, fullname, email, password, createdAt FROM users WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse(401, ['error' => 'Invalid email or password']);
        return;
    }
    
    $user = $result->fetch_assoc();
    
    if (password_verify($data['password'], $user['password'])) {
        // Remove password from response
        unset($user['password']);
        sendResponse(200, ['message' => 'Login successful', 'user' => $user]);
    } else {
        sendResponse(401, ['error' => 'Invalid email or password']);
    }
}

// Function to update user information
function updateUser($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        sendResponse(400, ['error' => 'User ID is required']);
        return;
    }
    
    // If changing password, verify current password
    if (isset($data['newPassword']) && !empty($data['newPassword'])) {
        if (!isset($data['currentPassword']) || empty($data['currentPassword'])) {
            sendResponse(400, ['error' => 'Current password is required']);
            return;
        }
        
        // Get current user
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param("s", $data['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendResponse(404, ['error' => 'User not found']);
            return;
        }
        
        $user = $result->fetch_assoc();
        
        // Verify current password
        if (!password_verify($data['currentPassword'], $user['password'])) {
            sendResponse(401, ['error' => 'Current password is incorrect']);
            return;
        }
        
        // Update password
        $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param("ss", $hashedPassword, $data['id']);
        
        if (!$stmt->execute()) {
            sendResponse(500, ['error' => 'Failed to update password: ' . $conn->error]);
            return;
        }
    }
    
    // Get updated user info
    $stmt = $conn->prepare("SELECT id, fullname, email, createdAt FROM users WHERE id = ?");
    $stmt->bind_param("s", $data['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse(404, ['error' => 'User not found']);
        return;
    }
    
    $user = $result->fetch_assoc();
    
    sendResponse(200, ['message' => 'User updated successfully', 'user' => $user]);
}

// Function to delete a user
function deleteUser($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['userId'])) {
        sendResponse(400, ['error' => 'User ID is required']);
        return;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Delete user's tasks
        $stmt = $conn->prepare("DELETE FROM tasks WHERE userId = ?");
        $stmt->bind_param("s", $data['userId']);
        $stmt->execute();
        
        // Delete user's settings
        $stmt = $conn->prepare("DELETE FROM settings WHERE userId = ?");
        $stmt->bind_param("s", $data['userId']);
        $stmt->execute();
        
        // Delete user
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("s", $data['userId']);
        $stmt->execute();
        
        // Commit transaction
        $conn->commit();
        
        sendResponse(200, ['message' => 'User deleted successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        sendResponse(500, ['error' => 'Failed to delete user: ' . $e->getMessage()]);
    }
}

// Function to get user settings
function getSettings($conn) {
    if (!isset($_GET['userId'])) {
        sendResponse(400, ['error' => 'User ID is required']);
        return;
    }
    
    $userId = $_GET['userId'];
    $stmt = $conn->prepare("SELECT * FROM settings WHERE userId = ?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Create default settings if not found
        $defaultSettings = [
            'userId' => $userId,
            'theme' => 'light',
            'notifications' => true,
            'darkMode' => false,
            'emailNotifications' => true,
            'pushNotifications' => true,
            'taskReminders' => true,
            'defaultView' => 'list'
        ];
        
        $settingsStmt = $conn->prepare("INSERT INTO settings (userId, theme, notifications, darkMode, emailNotifications, pushNotifications, taskReminders, defaultView) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $notifications = $defaultSettings['notifications'] ? '1' : '0';
        $darkMode = $defaultSettings['darkMode'] ? '1' : '0';
        $emailNotifications = $defaultSettings['emailNotifications'] ? '1' : '0';
        $pushNotifications = $defaultSettings['pushNotifications'] ? '1' : '0';
        $taskReminders = $defaultSettings['taskReminders'] ? '1' : '0';
        
        // Fix: Add all parameters to bind_param
        $settingsStmt->bind_param("ssssssss", 
            $defaultSettings['userId'],
            $defaultSettings['theme'],
            $notifications,
            $darkMode,
            $emailNotifications,
            $pushNotifications,
            $taskReminders,
            $defaultSettings['defaultView']
        );
        
        $settingsStmt->execute();
        
        // Fix: Return the default settings instead of the empty result
        sendResponse(200, ['message' => 'Default user settings created', 'settings' => $defaultSettings]);
    } else {
        $settings = $result->fetch_assoc();
        // Convert boolean strings to actual booleans for the frontend
        $settings['notifications'] = $settings['notifications'] == '1';
        $settings['darkMode'] = $settings['darkMode'] == '1';
        $settings['emailNotifications'] = $settings['emailNotifications'] == '1';
        $settings['pushNotifications'] = $settings['pushNotifications'] == '1';
        $settings['taskReminders'] = $settings['taskReminders'] == '1';
        
        sendResponse(200, ['message' => 'User settings retrieved successfully', 'settings' => $settings]);
    }
}

// Function to save user settings
function saveSettings($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['userId']) || !isset($data['theme']) || !isset($data['notifications']) || !isset($data['darkMode']) || !isset($data['emailNotifications']) || !isset($data['pushNotifications']) || !isset($data['taskReminders']) || !isset($data['defaultView'])) {
        sendResponse(400, ['error' => 'Missing required fields']);
        return;
    }
    
    $stmt = $conn->prepare("UPDATE settings SET theme = ?, notifications = ?, darkMode = ?, emailNotifications = ?, pushNotifications = ?, taskReminders = ?, defaultView = ? WHERE userId = ?");
    $notifications = $data['notifications'] ? '1' : '0';
    $darkMode = $data['darkMode'] ? '1' : '0';
    $emailNotifications = $data['emailNotifications'] ? '1' : '0';
    $pushNotifications = $data['pushNotifications'] ? '1' : '0';
    $taskReminders = $data['taskReminders'] ? '1' : '0';
    
    // Fix: Add all parameters to bind_param
    $stmt->bind_param("ssssssss", 
        $data['theme'],
        $notifications,
        $darkMode,
        $emailNotifications,
        $pushNotifications,
        $taskReminders,
        $data['defaultView'],
        $data['userId']
    );
    
    if ($stmt->execute()) {
        sendResponse(200, ['message' => 'User settings saved successfully']);
    } else {
        sendResponse(500, ['error' => 'Failed to save settings: ' . $conn->error]);
    }
}

// Function to clear user data
function clearUserData($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['userId'])) {
        sendResponse(400, ['error' => 'User ID is required']);
        return;
    }
    
    $stmt = $conn->prepare("DELETE FROM tasks WHERE userId = ?");
    $stmt->bind_param("s", $data['userId']);
    
    if ($stmt->execute()) {
        sendResponse(200, ['message' => 'User data cleared successfully']);
    } else {
        sendResponse(500, ['error' => 'Failed to clear user data: ' . $conn->error]);
    }
}

// Function to send JSON response
function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Add this new function to get dashboard statistics
function getDashboardStats($conn) {
    if (!isset($_GET['userId'])) {
        sendResponse(400, ['error' => 'User ID is required']);
        return;
    }
    
    $userId = $_GET['userId'];
    
    // Get total tasks count
    $totalStmt = $conn->prepare("SELECT COUNT(*) as total FROM tasks WHERE userId = ?");
    $totalStmt->bind_param("s", $userId);
    $totalStmt->execute();
    $totalResult = $totalStmt->get_result();
    $totalRow = $totalResult->fetch_assoc();
    $total = $totalRow['total'];
    
    // Get completed tasks count
    $completedStmt = $conn->prepare("SELECT COUNT(*) as completed FROM tasks WHERE userId = ? AND completed = 1");
    $completedStmt->bind_param("s", $userId);
    $completedStmt->execute();
    $completedResult = $completedStmt->get_result();
    $completedRow = $completedResult->fetch_assoc();
    $completed = $completedRow['completed'];
    
    // Get pending tasks (not completed)
    $pendingStmt = $conn->prepare("SELECT COUNT(*) as pending FROM tasks WHERE userId = ? AND completed = 0");
    $pendingStmt->bind_param("s", $userId);
    $pendingStmt->execute();
    $pendingResult = $pendingStmt->get_result();
    $pendingRow = $pendingResult->fetch_assoc();
    $pending = $pendingRow['pending'];
    
    // Get in progress tasks (due today and not completed)
    $today = date('Y-m-d');
    $inProgressStmt = $conn->prepare("SELECT COUNT(*) as inProgress FROM tasks WHERE userId = ? AND date = ? AND completed = 0");
    $inProgressStmt->bind_param("ss", $userId, $today);
    $inProgressStmt->execute();
    $inProgressResult = $inProgressStmt->get_result();
    $inProgressRow = $inProgressResult->fetch_assoc();
    $inProgress = $inProgressRow['inProgress'];
    
    // Get high priority tasks
    $highPriorityStmt = $conn->prepare("SELECT COUNT(*) as highPriority FROM tasks WHERE userId = ? AND priority = 'high' AND completed = 0");
    $highPriorityStmt->bind_param("s", $userId);
    $highPriorityStmt->execute();
    $highPriorityResult = $highPriorityStmt->get_result();
    $highPriorityRow = $highPriorityResult->fetch_assoc();
    $highPriority = $highPriorityRow['highPriority'];
    
    // Get upcoming tasks (due in the future)
    $upcomingStmt = $conn->prepare("SELECT COUNT(*) as upcoming FROM tasks WHERE userId = ? AND date > ? AND completed = 0");
    $upcomingStmt->bind_param("ss", $userId, $today);
    $upcomingStmt->execute();
    $upcomingResult = $upcomingStmt->get_result();
    $upcomingRow = $upcomingResult->fetch_assoc();
    $upcoming = $upcomingRow['upcoming'];
    
    // Get overdue tasks (past due date and not completed)
    $overdueStmt = $conn->prepare("SELECT COUNT(*) as overdue FROM tasks WHERE userId = ? AND date < ? AND completed = 0");
    $overdueStmt->bind_param("ss", $userId, $today);
    $overdueStmt->execute();
    $overdueResult = $overdueStmt->get_result();
    $overdueRow = $overdueResult->fetch_assoc();
    $overdue = $overdueRow['overdue'];
    
    $stats = [
        'total' => $total,
        'completed' => $completed,
        'pending' => $pending,
        'inProgress' => $inProgress,
        'highPriority' => $highPriority,
        'upcoming' => $upcoming,
        'overdue' => $overdue
    ];
    
    sendResponse(200, $stats);
}

// Handle the request
handleRequest();
?>