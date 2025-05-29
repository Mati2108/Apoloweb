const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure PayPal
paypal.configure({
    mode: process.env.PAYPAL_MODE || 'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Configure Mercado Pago (with error handling)
let mercadoPagoClient = null;
let mercadoPagoPayment = null;
let mercadoPagoPreference = null;

try {
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
        const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
        mercadoPagoClient = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        });
        mercadoPagoPayment = new Payment(mercadoPagoClient);
        mercadoPagoPreference = new Preference(mercadoPagoClient);
        console.log('✅ Mercado Pago configured successfully');
    } else {
        console.log('⚠️  Mercado Pago not configured (no access token)');
    }
} catch (error) {
    console.log('⚠️  Mercado Pago configuration failed:', error.message);
}

// Get payment methods configuration
router.get('/config', (req, res) => {
    try {
        res.json({
            stripe: {
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
                available: !!process.env.STRIPE_SECRET_KEY
            },
            paypal: {
                clientId: process.env.PAYPAL_CLIENT_ID,
                available: !!process.env.PAYPAL_CLIENT_ID
            },
            mercadopago: {
                publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
                available: !!process.env.MERCADOPAGO_ACCESS_TOKEN
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get payment configuration' });
    }
});

// Create Stripe Payment Intent
router.post('/stripe/create-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                orderId: uuidv4(),
                ...metadata
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent',
            message: error.message 
        });
    }
});

// Confirm Stripe Payment
router.post('/stripe/confirm', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.json({
            status: paymentIntent.status,
            paymentIntent: paymentIntent
        });
    } catch (error) {
        console.error('Stripe confirmation error:', error);
        res.status(500).json({ 
            error: 'Failed to confirm payment',
            message: error.message 
        });
    }
});

// Create PayPal Payment
router.post('/paypal/create', async (req, res) => {
    try {
        const { amount, currency = 'USD', description = 'KiFrames Purchase' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal'
            },
            redirect_urls: {
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
            },
            transactions: [{
                item_list: {
                    items: [{
                        name: 'KiFrames Media Organizer',
                        sku: 'kiframes-organizer',
                        price: amount.toFixed(2),
                        currency: currency,
                        quantity: 1
                    }]
                },
                amount: {
                    currency: currency,
                    total: amount.toFixed(2)
                },
                description: description
            }]
        };

        paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                console.error('PayPal payment creation error:', error);
                return res.status(500).json({ 
                    error: 'Failed to create PayPal payment',
                    message: error.message 
                });
            }

            const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
            
            res.json({
                paymentId: payment.id,
                approvalUrl: approvalUrl ? approvalUrl.href : null
            });
        });
    } catch (error) {
        console.error('PayPal payment error:', error);
        res.status(500).json({ 
            error: 'Failed to create PayPal payment',
            message: error.message 
        });
    }
});

// Execute PayPal Payment
router.post('/paypal/execute', async (req, res) => {
    try {
        const { paymentId, payerId } = req.body;

        const execute_payment_json = {
            payer_id: payerId
        };

        paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
            if (error) {
                console.error('PayPal execution error:', error);
                return res.status(500).json({ 
                    error: 'Failed to execute PayPal payment',
                    message: error.message 
                });
            }

            res.json({
                status: payment.state,
                payment: payment
            });
        });
    } catch (error) {
        console.error('PayPal execution error:', error);
        res.status(500).json({ 
            error: 'Failed to execute PayPal payment',
            message: error.message 
        });
    }
});

// Create Mercado Pago Payment with multiple payment methods
router.post('/mercadopago/create', async (req, res) => {
    try {
        if (!mercadoPagoPayment) {
            return res.status(503).json({ error: 'Mercado Pago service not available' });
        }

        const { amount, email, paymentMethod = 'pix', description = 'KiFrames Media Organizer' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Email is required for Mercado Pago' });
        }

        // Different payment method configurations for Argentina
        const paymentMethodConfigs = {
            // Credit/Debit Cards
            'visa': { payment_method_id: 'visa' },
            'master': { payment_method_id: 'master' },
            'amex': { payment_method_id: 'amex' },
            
            // Bank transfers and Argentina-specific methods
            'account_money': { payment_method_id: 'account_money' }, // Mercado Pago account
            'debin': { payment_method_id: 'debin' }, // Bank debit
            'cbu': { payment_method_id: 'cbu' }, // Bank transfer
            
            // Cash payments popular in Argentina
            'rapipago': { payment_method_id: 'rapipago' },
            'pagofacil': { payment_method_id: 'pagofacil' },
            'bapropagos': { payment_method_id: 'bapropagos' },
            
            // Default (lets user choose)
            'multiple': {}
        };

        const config = paymentMethodConfigs[paymentMethod] || {};

        const body = {
            transaction_amount: parseFloat(amount),
            description: description,
            payer: {
                email: email,
            },
            notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
            external_reference: uuidv4(),
            installments: 1,
            ...config
        };

        // If no specific payment method, create a preference for multiple options
        if (paymentMethod === 'multiple' || !config.payment_method_id) {
            if (!mercadoPagoPreference) {
                return res.status(503).json({ error: 'Mercado Pago preference service not available' });
            }

            const preference = {
                items: [{
                    title: description,
                    unit_price: parseFloat(amount),
                    quantity: 1,
                }],
                payer: {
                    email: email
                },
                payment_methods: {
                    excluded_payment_methods: [],
                    excluded_payment_types: [],
                    installments: 12 // Allow up to 12 installments
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/payment/success`,
                    failure: `${process.env.FRONTEND_URL}/payment/failure`,
                    pending: `${process.env.FRONTEND_URL}/payment/pending`
                },
                auto_return: 'approved',
                external_reference: uuidv4(),
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
            };

            // Create preference instead of direct payment
            const response = await mercadoPagoPreference.create({ body: preference });

            return res.json({
                preferenceId: response.id,
                initPoint: response.init_point,
                sandboxInitPoint: response.sandbox_init_point,
                paymentMethods: 'multiple'
            });
        }

        // Create direct payment for specific method
        const response = await mercadoPagoPayment.create({ body });

        res.json({
            paymentId: response.id,
            status: response.status,
            qrCode: response.point_of_interaction?.transaction_data?.qr_code,
            qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
            ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url,
            paymentMethod: paymentMethod
        });
    } catch (error) {
        console.error('Mercado Pago payment error:', error);
        res.status(500).json({ 
            error: 'Failed to create Mercado Pago payment',
            message: error.message 
        });
    }
});

// Get Mercado Pago Payment Status
router.get('/mercadopago/status/:paymentId', async (req, res) => {
    try {
        if (!mercadoPagoPayment) {
            return res.status(503).json({ error: 'Mercado Pago service not available' });
        }

        const { paymentId } = req.params;

        const response = await mercadoPagoPayment.get({ id: paymentId });

        res.json({
            status: response.status,
            statusDetail: response.status_detail,
            payment: response
        });
    } catch (error) {
        console.error('Mercado Pago status error:', error);
        res.status(500).json({ 
            error: 'Failed to get payment status',
            message: error.message 
        });
    }
});

// Generic payment status endpoint
router.get('/status/:provider/:paymentId', async (req, res) => {
    try {
        const { provider, paymentId } = req.params;

        switch (provider.toLowerCase()) {
            case 'stripe':
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
                res.json({
                    status: paymentIntent.status,
                    provider: 'stripe',
                    payment: paymentIntent
                });
                break;

            case 'mercadopago':
                if (!mercadoPagoPayment) {
                    return res.status(503).json({ error: 'Mercado Pago service not available' });
                }
                const mpResponse = await mercadoPagoPayment.get({ id: paymentId });
                res.json({
                    status: mpResponse.status,
                    provider: 'mercadopago',
                    payment: mpResponse
                });
                break;

            default:
                res.status(400).json({ error: 'Unsupported payment provider' });
        }
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ 
            error: 'Failed to get payment status',
            message: error.message 
        });
    }
});

// Get available payment methods for Argentina
router.get('/argentina/payment-methods', (req, res) => {
    try {
        const argentinePaymentMethods = {
            mercadoPago: {
                name: 'Mercado Pago',
                description: 'Most popular payment method in Argentina',
                available: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
                methods: [
                    {
                        id: 'multiple',
                        name: 'All Payment Methods',
                        description: 'Credit cards, bank transfers, cash payments, etc.',
                        recommended: true
                    },
                    {
                        id: 'account_money',
                        name: 'Mercado Pago Account',
                        description: 'Pay with your Mercado Pago balance'
                    },
                    {
                        id: 'visa',
                        name: 'Visa Credit/Debit',
                        description: 'Visa cards with installments available'
                    },
                    {
                        id: 'master',
                        name: 'Mastercard',
                        description: 'Mastercard with installments available'
                    },
                    {
                        id: 'rapipago',
                        name: 'Rapipago',
                        description: 'Cash payment at Rapipago locations'
                    },
                    {
                        id: 'pagofacil',
                        name: 'Pago Fácil',
                        description: 'Cash payment at Pago Fácil locations'
                    }
                ]
            },
            paypal: {
                name: 'PayPal',
                description: 'International payments',
                available: !!process.env.PAYPAL_CLIENT_ID,
                note: 'Good for international customers'
            },
            // Alternative processors that work in Argentina
            alternatives: [
                {
                    name: 'MobbEx',
                    description: 'Argentine payment processor',
                    website: 'https://mobbex.com',
                    features: ['Credit cards', 'Bank transfers', 'QR payments']
                },
                {
                    name: 'Prisma Medios de Pago',
                    description: 'Payment processor owned by Visa',
                    website: 'https://www.prismamediosdepago.com',
                    features: ['Credit cards', 'Installments', 'Digital wallets']
                },
                {
                    name: 'Aumentar',
                    description: 'Digital payment platform',
                    website: 'https://aumentar.com',
                    features: ['QR payments', 'Mobile payments', 'POS integration']
                }
            ]
        };

        res.json(argentinePaymentMethods);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get payment methods' });
    }
});

module.exports = router; 