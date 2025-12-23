const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // You may need: npm install bcryptjs
const User = require('../models/User');

// SIGNUP ROUTE
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username taken" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        
        await newUser.save();
        res.status(201).json({ message: "Admin created!" });
    } catch (err) {
        res.status(500).json({ message: "Error creating user" });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (user && await bcrypt.compare(password, user.password)) {
            // Set the session data
            req.session.userId = user._id;
            
            // Save session before responding
            req.session.save((err) => {
                if (err) return res.status(500).json({ message: "Session error" });
                res.json({ message: "Logged in" });
            });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// LOGOUT ROUTE
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out" });
});

module.exports = router;