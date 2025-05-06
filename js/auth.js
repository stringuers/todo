// Auth functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('sign')) {
        window.location.href = 'index.html';
    }

    // Handle sign up form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Create new user data
            const newUser = {
                id: Date.now().toString(),
                fullname,
                email,
                password, // Will be hashed on the server
                createdAt: new Date().toISOString()
            };

            // Send to server
            fetch('db_connect.php?action=add_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                
                // Store user in localStorage (without password)
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Error registering user:', error);
                
                // Fallback to localStorage if server is unavailable
                const users = JSON.parse(localStorage.getItem('users')) || [];
                
                // Check if email already exists
                if (users.some(user => user.email === email)) {
                    alert('Email already registered!');
                    return;
                }
                
                // Add new user to users array
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                // Set current user
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            });
        });
    }

    // Handle sign in form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;

            // Send login request to server
            fetch('db_connect.php?action=login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                
                // Set current user
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // If remember me is checked, store user email
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Error logging in:', error);
                
                // Fallback to localStorage if server is unavailable
                const users = JSON.parse(localStorage.getItem('users')) || [];
                
                // Find user with matching email and password
                const user = users.find(user => user.email === email && user.password === password);
                
                if (user) {
                    // Set current user
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // If remember me is checked, store user email
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    
                    // Redirect to dashboard
                    window.location.href = 'index.html';
                } else {
                    alert('Invalid email or password!');
                }
            });
        });

        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('remember').checked = true;
        }
    }

    // Handle logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'sign-in.html';
        });
    }
});

function initAuthForms() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }
}

function handleSignIn(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';
    
    // Validate form
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Send login request
    fetch('php/auth/login.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                showError(data.message || 'Invalid email or password');
            }
        })
        .catch(error => {
            console.error('Error during sign in:', error);
            // For demo, redirect anyway
            window.location.href = 'index.html';
        });
}

function handleSignUp(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const fullname = formData.get('fullname');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    const terms = formData.get('terms') === 'on';
    
    // Validate form
    if (!fullname || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (!terms) {
        showError('You must agree to the terms and conditions');
        return;
    }
    
    // Send registration request
    fetch('php/auth/register.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to sign in page
                window.location.href = 'sign-in.html';
            } else {
                showError(data.message || 'Registration failed');
            }
        })
        .catch(error => {
            console.error('Error during sign up:', error);
            // For demo, redirect anyway
            window.location.href = 'sign-in.html';
        });
}

function showError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.querySelector('.auth-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'auth-error';
        errorElement.style.color = 'red';
        errorElement.style.marginBottom = '16px';
        errorElement.style.textAlign = 'center';
        
        // Insert after h1
        const h1 = document.querySelector('h1');
        h1.parentNode.insertBefore(errorElement, h1.nextSibling);
    }
    
    errorElement.textContent = message;
}