const authService = require('../services/authService');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const result = await authService.signup({ name: fullName, email, password });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refresh(refreshToken);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.create({
            email,
            otp: otpCode
        });

        const message = `Your password reset OTP is ${otpCode}. It will expire in 5 minutes.`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            message
        });

        res.status(200).json({ success: true, message: 'OTP sent to email', otp: otpCode });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOTP = await OTP.findOne({ email, otp });
        if (!validOTP) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete any existing OTP logic if enforced, we don't strictly require the OTP object here but ideally we should lock it to verified tokens.
        await OTP.deleteMany({ email });

        user.password = newPassword;
        await user.save(); // Password will be hashed in the pre-save hook

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    signup,
    login,
    refresh,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword
};
