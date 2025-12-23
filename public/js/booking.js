document.addEventListener('DOMContentLoaded', () => {
    const serviceSelect = document.getElementById('serviceSelect');
    const dateInput = document.getElementById('dateInput');
    const timeSelect = document.getElementById('timeSelect');
    const form = document.getElementById('bookingForm');
    
    // Base URL for backend on Port 3000
    const API_BASE_URL = 'http://localhost:3000/api';

    /**
     * 1. Load Services from Backend
     */
    async function loadServices() {
        try {
            // Using credentials: include helps maintain a clean session context
            const res = await fetch(`${API_BASE_URL}/services`, { credentials: 'include' });
            const services = await res.json();
            
            serviceSelect.innerHTML = '<option value="">Select a Service</option>';
            
            if (services && services.length > 0) {
                services.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.name;
                    option.textContent = `${s.name} ($${s.price})`;
                    serviceSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Service Loading Error:", err);
            serviceSelect.innerHTML = '<option>Error loading services</option>';
        }
    }

    /**
     * 2. Handle Date Selection and Check Availability
     */
    dateInput.addEventListener('change', async () => {
        const selectedDate = dateInput.value;
        if (!selectedDate) return;

        timeSelect.disabled = true;
        timeSelect.innerHTML = '<option>Checking availability...</option>';

        try {
            const res = await fetch(`${API_BASE_URL}/appointments?date=${selectedDate}`, { credentials: 'include' });
            const bookedSlots = await res.json();

            // Defined salon hours
            const allSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
            timeSelect.innerHTML = '<option value="">Choose a Time</option>';
            
            allSlots.forEach(slot => {
                const isBooked = bookedSlots.includes(slot);
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = isBooked ? `${slot} (Booked)` : slot;
                option.disabled = isBooked; // Prevent clicking booked slots
                timeSelect.appendChild(option);
            });

            timeSelect.disabled = false;
        } catch (err) {
            console.error("Time Fetch Error:", err);
            timeSelect.innerHTML = '<option>Error loading times</option>';
        }
    });

    /**
     * 3. Handle Form Submission
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service: serviceSelect.value,
            date: dateInput.value,
            time: timeSelect.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                alert("Booking Successful! Check your email for confirmation.");
                form.reset();
                timeSelect.disabled = true;
                timeSelect.innerHTML = '<option value="">Select Date First</option>';
            } else {
                const errorData = await response.json();
                alert("Booking Failed: " + errorData.message);
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Connection error. Check if Node.js is running.");
        }
    });

    loadServices();
});