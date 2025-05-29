const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const router = express.Router();

// JWT Secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'kiframes_default_secret_change_in_production';

// Generate JWT token
function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.userId = decoded.userId;
        next();
    });
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ 
                error: 'All fields are required: email, password, firstName, lastName' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            firstName,
            lastName
        });

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        try {
            await sendEmail({
                to: email,
                subject: 'Welcome to KiFrames - Verify Your Email',
                template: 'welcome',
                data: {
                    firstName,
                    verificationToken,
                    verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
                }
            });
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail registration if email fails
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
                licenses: user.licenses
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
                licenses: user.getActiveLicenses()
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                licenses: user.licenses
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Get user licenses
router.get('/licenses', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            licenses: user.licenses,
            activeLicenses: user.getActiveLicenses()
        });

    } catch (error) {
        console.error('Licenses error:', error);
        res.status(500).json({ error: 'Failed to get licenses' });
    }
});

// Validate license key
router.post('/validate-license', async (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ error: 'License key is required' });
        }

        const user = await User.findByLicenseKey(licenseKey);
        if (!user) {
            return res.status(404).json({ 
                valid: false, 
                error: 'License key not found' 
            });
        }

        const validation = user.validateLicense(licenseKey);
        
        if (validation.valid) {
            res.json({
                valid: true,
                license: validation.license,
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        } else {
            res.status(400).json({
                valid: false,
                error: validation.reason
            });
        }

    } catch (error) {
        console.error('License validation error:', error);
        res.status(500).json({ error: 'Failed to validate license' });
    }
});

// Activate license (for app activation)
router.post('/activate-license', async (req, res) => {
    try {
        const { licenseKey, deviceInfo } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ error: 'License key is required' });
        }

        const user = await User.findByLicenseKey(licenseKey);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'License key not found' 
            });
        }

        const activation = user.activateLicense(licenseKey, deviceInfo);
        
        if (activation.success) {
            await user.save();
            res.json({
                success: true,
                message: 'License activated successfully',
                license: activation.license,
                activationsRemaining: activation.activationsRemaining
            });
        } else {
            res.status(400).json({
                success: false,
                error: activation.reason
            });
        }

    } catch (error) {
        console.error('License activation error:', error);
        res.status(500).json({ error: 'Failed to activate license' });
    }
});

// Verify email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send password reset email
        try {
            await sendEmail({
                to: email,
                subject: 'KiFrames - Password Reset Request',
                template: 'password-reset',
                data: {
                    firstName: user.firstName,
                    resetToken,
                    resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
                }
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        res.json({ message: 'If the email exists, a reset link has been sent' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to process password reset' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

module.exports = { router, authenticateToken }; 