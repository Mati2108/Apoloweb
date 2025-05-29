const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('✅ Stripe Payment succeeded:', paymentIntent.id);
                
                // Update order status
                await updateOrderPaymentStatus(
                    paymentIntent.metadata.orderId,
                    'paid',
                    paymentIntent.id,
                    'stripe'
                );
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('❌ Stripe Payment failed:', failedPayment.id);
                
                // Update order status
                await updateOrderPaymentStatus(
                    failedPayment.metadata.orderId,
                    'failed',
                    failedPayment.id,
                    'stripe'
                );
                break;

            case 'payment_intent.canceled':
                const canceledPayment = event.data.object;
                console.log('🚫 Stripe Payment canceled:', canceledPayment.id);
                
                // Update order status
                await updateOrderPaymentStatus(
                    canceledPayment.metadata.orderId,
                    'canceled',
                    canceledPayment.id,
                    'stripe'
                );
                break;

            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing Stripe webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// PayPal webhook handler
router.post('/paypal', express.json(), async (req, res) => {
    try {
        const event = req.body;
        
        console.log('PayPal webhook received:', event.event_type);

        switch (event.event_type) {
            case 'PAYMENT.SALE.COMPLETED':
                const saleId = event.resource.id;
                const paymentId = event.resource.parent_payment;
                
                console.log('✅ PayPal Payment completed:', paymentId);
                
                // You would need to map the PayPal payment ID to your order ID
                // This could be done by storing the mapping when creating the payment
                await updateOrderPaymentStatusByPaymentId(
                    paymentId,
                    'paid',
                    'paypal'
                );
                break;

            case 'PAYMENT.SALE.DENIED':
                const deniedPaymentId = event.resource.parent_payment;
                
                console.log('❌ PayPal Payment denied:', deniedPaymentId);
                
                await updateOrderPaymentStatusByPaymentId(
                    deniedPaymentId,
                    'failed',
                    'paypal'
                );
                break;

            default:
                console.log(`Unhandled PayPal event type: ${event.event_type}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing PayPal webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Mercado Pago webhook handler
router.post('/mercadopago', express.json(), async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log('Mercado Pago webhook received:', type);

        if (type === 'payment') {
            const paymentId = data.id;
            
            // Get payment details from Mercado Pago
            const { MercadoPagoConfig, Payment } = require('mercadopago');
            const client = new MercadoPagoConfig({
                accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
            });
            const payment = new Payment(client);
            
            const paymentData = await payment.get({ id: paymentId });
            
            console.log('Mercado Pago payment status:', paymentData.status);

            switch (paymentData.status) {
                case 'approved':
                    console.log('✅ Mercado Pago Payment approved:', paymentId);
                    
                    await updateOrderPaymentStatusByExternalRef(
                        paymentData.external_reference,
                        'paid',
                        paymentId,
                        'mercadopago'
                    );
                    break;

                case 'rejected':
                    console.log('❌ Mercado Pago Payment rejected:', paymentId);
                    
                    await updateOrderPaymentStatusByExternalRef(
                        paymentData.external_reference,
                        'failed',
                        paymentId,
                        'mercadopago'
                    );
                    break;

                case 'cancelled':
                    console.log('🚫 Mercado Pago Payment cancelled:', paymentId);
                    
                    await updateOrderPaymentStatusByExternalRef(
                        paymentData.external_reference,
                        'canceled',
                        paymentId,
                        'mercadopago'
                    );
                    break;

                default:
                    console.log(`Mercado Pago payment status: ${paymentData.status}`);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing Mercado Pago webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Helper functions to update order status
async function updateOrderPaymentStatus(orderId, paymentStatus, paymentId, provider) {
    try {
        // In a real application, this would update the database
        // For now, we'll make a request to our own orders API
        const response = await fetch(`http://localhost:${process.env.PORT || 3001}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentStatus,
                paymentId,
                paymentProvider: provider,
                status: paymentStatus === 'paid' ? 'processing' : 'pending'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update order: ${response.statusText}`);
        }

        console.log(`Order ${orderId} updated with payment status: ${paymentStatus}`);
    } catch (error) {
        console.error('Error updating order payment status:', error);
    }
}

async function updateOrderPaymentStatusByPaymentId(paymentId, paymentStatus, provider) {
    try {
        // This would require a lookup table or database query to find the order
        // For demo purposes, we'll log this
        console.log(`Would update order for payment ${paymentId} with status ${paymentStatus}`);
        
        // In production, you would:
        // 1. Query database to find order by payment ID
        // 2. Update the order status
    } catch (error) {
        console.error('Error updating order by payment ID:', error);
    }
}

async function updateOrderPaymentStatusByExternalRef(externalRef, paymentStatus, paymentId, provider) {
    try {
        // External reference is typically the order ID for Mercado Pago
        await updateOrderPaymentStatus(externalRef, paymentStatus, paymentId, provider);
    } catch (error) {
        console.error('Error updating order by external reference:', error);
    }
}

// Test webhook endpoint
router.post('/test', express.json(), (req, res) => {
    console.log('Test webhook received:', req.body);
    res.json({ 
        message: 'Test webhook received successfully',
        timestamp: new Date().toISOString(),
        body: req.body 
    });
});

module.exports = router; 