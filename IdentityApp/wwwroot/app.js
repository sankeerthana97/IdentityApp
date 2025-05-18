// app.js
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadTasks();
});

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const logoutBtn = document.getElementById('logoutBtn');
const authSection = document.getElementById('authSection');
const taskSection = document.getElementById('taskSection');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (taskForm) {
    taskForm.addEventListener('submit', handleAddTask);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const authType = document.querySelector('input[name="authType"]:checked').value;

    try {
        if (authType === 'cookie') {
            const response = await fetch('/api/auth/cookie-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/index.html';
            } else {
                showError('Invalid login credentials');
            }
        } else {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwt', data.token);
                window.location.href = '/index.html';
            } else {
                showError('Invalid login credentials');
            }
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login.html';
        } else {
            const errorData = await response.json();
            showError(errorData.errors[0].description);
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
    }
}

async function handleLogout() {
    try {
        // Clear JWT
        localStorage.removeItem('jwt');

        // Clear cookie session
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        window.location.href = '/login.html';
    } catch (error) {
        showError('Logout failed');
    }
}

// Task Functions
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            credentials: 'include'
        });

        if (response.ok) {
            const tasks = await response.json();
            renderTasks(tasks);
        }
    } catch (error) {
        showError('Failed to load tasks');
    }
}

async function handleAddTask(e) {
    e.preventDefault();
    const description = document.getElementById('taskDescription').value;

    try {
        const token = localStorage.getItem('jwt');
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(description)
        });

        if (response.ok) {
            document.getElementById('taskDescription').value = '';
            loadTasks();
        } else {
            showError('Failed to add task. Admin privileges required.');
        }
    } catch (error) {
        showError('Failed to add task');
    }
}

// UI Functions
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <p>${task.description}</p>
            <small>${new Date(task.createdAt).toLocaleString()}</small>
        `;
        taskList.appendChild(taskItem);
    });
}

function checkAuthStatus() {
    const jwt = localStorage.getItem('jwt');
    const isLoggedIn = jwt || document.cookie.includes('.AspNetCore.Cookies');

    if (window.location.pathname.endsWith('index.html')) {
        if (!isLoggedIn) {
            window.location.href = '/login.html';
        } else {
            authSection.style.display = 'none';
            taskSection.style.display = 'block';
        }
    } else if (window.location.pathname.endsWith('login.html') && isLoggedIn) {
        window.location.href = '/index.html';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// Admin Check (Example - you'd need to implement proper role checking)
function checkAdminStatus() {
    // In real implementation, you'd decode JWT or make an API call
    const token = localStorage.getItem('jwt');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles.includes('Admin');
    }
    return false;
}