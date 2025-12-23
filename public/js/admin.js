const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_BASE_URL = 'http://localhost:3000/auth';

/**
 * 1. Fetch and Display Appointments
 * Runs only on the Admin Dashboard
 */
async function fetchAppointments() {
    try {
        console.log("Fetching appointments...");
        
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            credentials: 'include' // 🔑 Essential for session-based auth
        });

        if (response.status === 401) {
            console.warn("Unauthorized access. Redirecting to login...");
            window.location.href = 'login.html';
            return;
        }

        const appointments = await response.json();
        const tableBody = document.querySelector('#appointmentsTable tbody');
        const noData = document.getElementById('noDataMessage');

        if (!tableBody) {
            console.error("Table body not found! Ensure <tbody id='appointmentsBody'> exists.");
            return;
        }

        tableBody.innerHTML = ''; // Clear existing rows

        if (!appointments || appointments.length === 0) {
            if (noData) noData.style.display = 'block';
            return;
        }

        if (noData) noData.style.display = 'none';

        // Sort appointments by date (nearest first)
        appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

        appointments.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.date}</td>
                <td>${app.time}</td>
                <td><strong>${app.name}</strong></td>
                <td><span class="service-tag">${app.service}</span></td>
                <td>
                    <div style="font-size: 0.85rem;">
                        ${app.email}<br>
                        <span style="color: var(--text-muted)">${app.phone}</span>
                    </div>
                </td>
                <td>
                    <button class="btn-danger" onclick="deleteAppointment('${app._id}')">Cancel</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

/**
 * 2. Delete/Cancel Appointment
 */
async function deleteAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Appointment cancelled successfully.');
                fetchAppointments(); // Refresh the table
            } else {
                alert('Failed to delete. Access denied.');
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    }
}

/**
 * 3. Logout Function
 */
async function logout() {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/logout`, { credentials: 'include' });
        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error("Logout error:", err);
    }
}

/**
 * 4. Page Initialization & Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Check for Dashboard Table
    const appointmentsTable = document.getElementById('appointmentsTable');
    if (appointmentsTable) {
        fetchAppointments();
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    }

    // Check for Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('user').value;
            const password = document.getElementById('pass').value;

            try {
                const response = await fetch(`${AUTH_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });

                if (response.ok) {
                    window.location.href = 'admin.html';
                } else {
                    alert('Invalid username or password');
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Server error. Please try again later.');
            }
        });
    }

    // Check for Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUser').value;
            const password = document.getElementById('regPass').value;

            try {
                const response = await fetch(`${AUTH_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    alert('Admin account created successfully! Please login.');
                    window.location.href = 'login.html';
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Registration failed.');
                }
            } catch (err) {
                console.error('Signup error:', err);
            }
        });
    }
});