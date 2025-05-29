const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { orderManager } = require('../database');
const { sendLicenseKeyEmail, sendOrderConfirmationEmail } = require('../utils/emailService');
const { authenticateToken } = require('./auth');

// In-memory storage for demo (replace with database in production)
const orders = new Map();

// Create order (with user account integration)
router.post('/', async (req, res) => {
    try {
        const { 
            items, 
            total, 
            customerEmail, 
            customerName,
            paymentProvider, 
            paymentId,
            createAccount = false,
            password,
            firstName,
            lastName
        } = req.body;

        // Validation
        if (!items || !total || !customerEmail) {
            return res.status(400).json({ 
                error: 'Missing required fields: items, total, customerEmail' 
            });
        }

        const orderId = uuidv4();
        let user = null;

        // Check if user wants to create an account or if user already exists
        if (createAccount || await User.findByEmail(customerEmail)) {
            try {
                // Try to find existing user
                user = await User.findByEmail(customerEmail);
                
                // If user doesn't exist and they want to create account
                if (!user && createAccount) {
                    if (!password || !firstName || !lastName) {
                        return res.status(400).json({
                            error: 'To create an account, provide: password, firstName, lastName'
                        });
                    }

                    user = new User({
                        email: customerEmail,
                        password,
                        firstName,
                        lastName
                    });
                    await user.save();
                    console.log('✅ New user account created for:', customerEmail);
                }
            } catch (userError) {
                console.error('User creation error:', userError);
                // Continue with order even if user creation fails
            }
        }

        // Create order data
        const orderData = {
            orderId,
            items,
            total,
            customerEmail,
            customerName: customerName || (user ? `${user.firstName} ${user.lastName}` : ''),
            paymentProvider,
            paymentId,
            status: 'pending',
            userId: user ? user._id : null,
            createdAt: new Date()
        };

        // Save order
        const order = await orderManager.create(orderData);

        // Send order confirmation email
        if (user) {
            try {
                await sendOrderConfirmationEmail(user, {
                    orderId,
                    productName: items[0]?.name || 'KiFrames Media Organizer',
                    amount: total,
                    currency: 'USD',
                    status: 'pending'
                });
            } catch (emailError) {
                console.error('Failed to send order confirmation:', emailError);
            }
        }

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                orderId: order.orderId,
                total: order.total,
                status: order.status,
                items: order.items,
                userAccountCreated: !!user && createAccount
            }
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Complete order and generate license (called after successful payment)
router.post('/:orderId/complete', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentData } = req.body;

        // Find the order
        const order = await orderManager.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        await orderManager.updateStatus(orderId, 'completed');

        let licenseKey = null;
        let user = null;

        // If there's a user associated with this order, generate license
        if (order.userId) {
            user = await User.findById(order.userId);
        } else if (order.customerEmail) {
            // Try to find user by email
            user = await User.findByEmail(order.customerEmail);
        }

        if (user) {
            // Generate license for the user
            const license = user.addLicense({
                orderId: order.orderId,
                paymentId: order.paymentId || paymentData?.paymentId,
                paymentProvider: order.paymentProvider || paymentData?.provider,
                amount: order.total,
                currency: 'USD',
                productName: order.items[0]?.name || 'KiFrames Media Organizer'
            });

            await user.save();
            licenseKey = license.licenseKey;

            // Send license key email
            try {
                await sendLicenseKeyEmail(user, license, order);
                console.log('✅ License key email sent to:', user.email);
            } catch (emailError) {
                console.error('Failed to send license key email:', emailError);
            }
        } else {
            console.warn('⚠️  No user found for order:', orderId, '- License not generated');
        }

        res.json({
            message: 'Order completed successfully',
            order: {
                orderId: order.orderId,
                status: 'completed',
                total: order.total
            },
            license: licenseKey ? {
                licenseKey,
                message: 'License key has been sent to your email'
            } : null,
            userAccount: user ? {
                email: user.email,
                hasAccount: true
            } : {
                hasAccount: false,
                message: 'Create an account to manage your licenses'
            }
        });

    } catch (error) {
        console.error('Order completion error:', error);
        res.status(500).json({ error: 'Failed to complete order' });
    }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderManager.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// Get user's orders (requires authentication)
router.get('/user/orders', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all orders for this user
        const allOrders = await orderManager.getAll();
        const userOrders = allOrders.filter(order => 
            order.userId?.toString() === req.userId || 
            order.customerEmail === user.email
        );

        res.json({
            orders: userOrders,
            licenses: user.licenses
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to get user orders' });
    }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') 
            });
        }

        const order = await orderManager.updateStatus(orderId, status);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // If order is completed, generate license if not already done
        if (status === 'completed' && order.userId) {
            const user = await User.findById(order.userId);
            if (user) {
                const existingLicense = user.licenses.find(l => l.orderId === orderId);
                if (!existingLicense) {
                    const license = user.addLicense({
                        orderId: order.orderId,
                        paymentId: order.paymentId,
                        paymentProvider: order.paymentProvider,
                        amount: order.total,
                        currency: 'USD',
                        productName: order.items[0]?.name || 'KiFrames Media Organizer'
                    });
                    await user.save();
                    
                    // Send license key email
                    try {
                        await sendLicenseKeyEmail(user, license, order);
                    } catch (emailError) {
                        console.error('Failed to send license key email:', emailError);
                    }
                }
            }
        }

        res.json({
            message: 'Order status updated successfully',
            order: {
                orderId: order.orderId,
                status: order.status,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get all orders (admin endpoint - could add admin auth later)
router.get('/', async (req, res) => {
    try {
        const orders = await orderManager.getAll();
        res.json({ orders });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Delete order
router.delete('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Note: This is a simple implementation
        // In a real app, you might want to soft-delete or have more restrictions
        const order = await orderManager.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // For now, just update status to cancelled
        await orderManager.updateStatus(orderId, 'cancelled');

        res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router; 