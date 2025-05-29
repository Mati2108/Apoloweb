const nodemailer = require('nodemailer');

// Email templates
const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to KiFrames - Verify Your Email',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to KiFrames, ${data.firstName}!</h2>
                <p>Thank you for joining KiFrames. Please verify your email address to complete your registration.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.verificationUrl}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${data.verificationUrl}</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    If you didn't create an account with KiFrames, please ignore this email.
                </p>
            </div>
        `
    }),

    licenseKey: (data) => ({
        subject: 'Your KiFrames License Key - Purchase Confirmed',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">🎉 Purchase Confirmed!</h2>
                <p>Hi ${data.firstName},</p>
                <p>Thank you for purchasing <strong>${data.productName}</strong>! Your payment has been processed successfully.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Your License Key:</h3>
                    <div style="background-color: #fff; padding: 15px; border: 2px dashed #007bff; border-radius: 5px; text-align: center;">
                        <code style="font-size: 18px; font-weight: bold; color: #007bff; letter-spacing: 2px;">
                            ${data.licenseKey}
                        </code>
                    </div>
                    <p style="margin-bottom: 0; color: #666; font-size: 14px;">
                        <strong>Important:</strong> Save this license key in a safe place. You'll need it to activate your software.
                    </p>
                </div>

                <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #0066cc; margin-top: 0;">📋 Purchase Details:</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li><strong>Product:</strong> ${data.productName}</li>
                        <li><strong>Order ID:</strong> ${data.orderId}</li>
                        <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
                        <li><strong>Payment Method:</strong> ${data.paymentProvider}</li>
                        <li><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</li>
                        <li><strong>Activations Allowed:</strong> ${data.maxActivations || 3} devices</li>
                    </ul>
                </div>

                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #856404; margin-top: 0;">🚀 How to Activate:</h4>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li>Download and install KiFrames Media Organizer</li>
                        <li>Launch the application</li>
                        <li>Enter your license key when prompted</li>
                        <li>Enjoy organizing your media files!</li>
                    </ol>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                        View in Dashboard
                    </a>
                    <a href="${process.env.FRONTEND_URL}/download" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Download Software
                    </a>
                </div>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    Need help? Contact our support team at support@kiframes.com<br>
                    This license key is tied to your account: ${data.email}
                </p>
            </div>
        `
    }),

    passwordReset: (data) => ({
        subject: 'KiFrames - Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hi ${data.firstName},</p>
                <p>We received a request to reset your password for your KiFrames account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.resetUrl}" 
                       style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>This link will expire in 10 minutes for security reasons.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    If the button doesn't work, copy and paste this link: ${data.resetUrl}
                </p>
            </div>
        `
    }),

    orderConfirmation: (data) => ({
        subject: 'Order Confirmation - KiFrames Purchase',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">Order Confirmation</h2>
                <p>Hi ${data.firstName},</p>
                <p>We've received your order and are processing your payment.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li><strong>Order ID:</strong> ${data.orderId}</li>
                        <li><strong>Product:</strong> ${data.productName}</li>
                        <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
                        <li><strong>Payment Status:</strong> ${data.paymentStatus}</li>
                    </ul>
                </div>

                <p>You'll receive your license key via email once the payment is confirmed.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    Questions? Contact us at support@kiframes.com
                </p>
            </div>
        `
    })
};

// Create email transporter
function createTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email configuration missing. Emails will be logged instead of sent.');
        return null;
    }

    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Send email function
async function sendEmail({ to, subject, template, data, html }) {
    try {
        const transporter = createTransporter();
        
        // If no transporter (missing config), just log the email
        if (!transporter) {
            console.log('📧 Email would be sent to:', to);
            console.log('📧 Subject:', subject);
            if (template && emailTemplates[template]) {
                const templateData = emailTemplates[template](data);
                console.log('📧 Content:', templateData.html.substring(0, 200) + '...');
            }
            return { success: true, message: 'Email logged (no SMTP configured)' };
        }

        let emailContent;
        
        if (template && emailTemplates[template]) {
            emailContent = emailTemplates[template](data);
            subject = emailContent.subject;
            html = emailContent.html;
        }

        const mailOptions = {
            from: `"KiFrames" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        
        return { 
            success: true, 
            messageId: info.messageId,
            message: 'Email sent successfully' 
        };

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { 
            success: false, 
            error: error.message,
            message: 'Failed to send email' 
        };
    }
}

// Send license key email
async function sendLicenseKeyEmail(user, license, orderData) {
    return sendEmail({
        to: user.email,
        template: 'licenseKey',
        data: {
            firstName: user.firstName,
            email: user.email,
            licenseKey: license.licenseKey,
            productName: license.productName,
            orderId: license.orderId,
            amount: license.amount,
            currency: license.currency,
            paymentProvider: license.paymentProvider,
            maxActivations: license.maxActivations
        }
    });
}

// Send order confirmation email
async function sendOrderConfirmationEmail(user, orderData) {
    return sendEmail({
        to: user.email,
        template: 'orderConfirmation',
        data: {
            firstName: user.firstName,
            orderId: orderData.orderId,
            productName: orderData.productName || 'KiFrames Media Organizer',
            amount: orderData.amount,
            currency: orderData.currency || 'USD',
            paymentStatus: orderData.status || 'Processing'
        }
    });
}

module.exports = {
    sendEmail,
    sendLicenseKeyEmail,
    sendOrderConfirmationEmail,
    emailTemplates
}; 