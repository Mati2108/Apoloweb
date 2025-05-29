const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date,
    // License information
    licenses: [{
        licenseKey: {
            type: String,
            required: true,
            unique: true
        },
        productName: {
            type: String,
            default: 'KiFrames Media Organizer'
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        },
        orderId: String,
        paymentId: String,
        paymentProvider: String,
        amount: Number,
        currency: String,
        status: {
            type: String,
            enum: ['active', 'expired', 'revoked'],
            default: 'active'
        },
        expiresAt: Date, // For subscription-based licenses
        activatedAt: Date,
        activationCount: {
            type: Number,
            default: 0
        },
        maxActivations: {
            type: Number,
            default: 3 // Allow 3 device activations
        }
    }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate license key
userSchema.methods.generateLicenseKey = function() {
    const prefix = 'KF'; // KiFrames prefix
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    const checksum = crypto.createHash('md5')
        .update(this.email + timestamp + random)
        .digest('hex')
        .substring(0, 4)
        .toUpperCase();
    
    return `${prefix}-${timestamp}-${random}-${checksum}`;
};

// Add license to user
userSchema.methods.addLicense = function(orderData) {
    const licenseKey = this.generateLicenseKey();
    
    const license = {
        licenseKey,
        productName: orderData.productName || 'KiFrames Media Organizer',
        orderId: orderData.orderId,
        paymentId: orderData.paymentId,
        paymentProvider: orderData.paymentProvider,
        amount: orderData.amount,
        currency: orderData.currency || 'USD',
        status: 'active'
    };
    
    this.licenses.push(license);
    return license;
};

// Get active licenses
userSchema.methods.getActiveLicenses = function() {
    return this.licenses.filter(license => license.status === 'active');
};

// Validate license key
userSchema.methods.validateLicense = function(licenseKey) {
    const license = this.licenses.find(l => l.licenseKey === licenseKey);
    
    if (!license) return { valid: false, reason: 'License not found' };
    if (license.status !== 'active') return { valid: false, reason: 'License inactive' };
    if (license.expiresAt && license.expiresAt < new Date()) {
        return { valid: false, reason: 'License expired' };
    }
    
    return { valid: true, license };
};

// Activate license (for device activation)
userSchema.methods.activateLicense = function(licenseKey, deviceInfo = {}) {
    const license = this.licenses.find(l => l.licenseKey === licenseKey);
    
    if (!license) return { success: false, reason: 'License not found' };
    if (license.status !== 'active') return { success: false, reason: 'License inactive' };
    if (license.activationCount >= license.maxActivations) {
        return { success: false, reason: 'Maximum activations reached' };
    }
    
    license.activationCount += 1;
    if (!license.activatedAt) {
        license.activatedAt = new Date();
    }
    
    return { success: true, license, activationsRemaining: license.maxActivations - license.activationCount };
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
    this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    return this.emailVerificationToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    this.passwordResetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return this.passwordResetToken;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by license key
userSchema.statics.findByLicenseKey = function(licenseKey) {
    return this.findOne({ 'licenses.licenseKey': licenseKey });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 