const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const salonApi = require('./routes/api');
const adminAuth = require('./routes/auth');

const app = express();

// 1. CORS CONFIGURATION
// This allows your Live Server (5500) to talk to your Node Server (3000)
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 2. SESSION CONFIGURATION (Only defined once)
app.use(session({
    secret: 'salon_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 3600000, // 1 hour
        sameSite: 'lax', 
        secure: false    
    }
}));

// 3. ROUTES
app.use('/api', salonApi);
app.use('/auth', adminAuth);

// 4. MONGODB CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/salonBookingDB')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});