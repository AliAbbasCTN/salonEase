const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

// 1. Configure Email Transporter (Use your real credentials here)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-salon-email@gmail.com', 
        pass: 'your-app-password-here' 
    }
});

// 2. Auth Middleware
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    res.status(401).json({ message: "Unauthorized: Please login" });
};

// --- ROUTES ---

// GET all services
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET appointments (Time-slot logic for booking OR Admin Dashboard)
router.get('/appointments', async (req, res) => {
    try {
        const { date } = req.query;
        
        // Public request: Get booked times for a specific date
        if (date) {
            const booked = await Appointment.find({ date }).select('time -_id');
            return res.json(booked.map(b => b.time));
        }
        
        // Private request: Admin dashboard (Requires Login)
        if (req.session && req.session.userId) {
            const all = await Appointment.find().sort({ date: 1, time: 1 });
            return res.json(all);
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new appointment + Email Confirmation
router.post('/appointments', async (req, res) => {
    try {
        const newApp = new Appointment(req.body);
        const savedApp = await newApp.save();

        // Email logic
        const mailOptions = {
            from: '"Modern Salon" <your-salon-email@gmail.com>',
            to: savedApp.email,
            subject: 'Booking Confirmed!',
            html: `<h3>Confirmed!</h3><p>Hi ${savedApp.name}, your appointment for ${savedApp.service} on ${savedApp.date} at ${savedApp.time} is set!</p>`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) console.log('Email error:', error);
            else console.log('Confirmation email sent.');
        });

        res.status(201).json(savedApp);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE appointment (Admin Only)
router.delete('/appointments/:id', isAdmin, async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;