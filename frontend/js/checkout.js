// Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Global variables
let stripe = null;
let paypalButtons = null;
let mercadoPago = null;
let paymentConfig = null;
let currentOrder = null;

// Initialize payment gateways
async function initializePaymentGateways() {
    try {
        // Get payment configuration from backend
        const response = await fetch(`${API_BASE_URL}/payments/config`);
        paymentConfig = await response.json();

        // Initialize Stripe
        if (paymentConfig.stripe.available) {
            stripe = Stripe(paymentConfig.stripe.publishableKey);
            console.log('✅ Stripe initialized');
        }

        // Initialize Mercado Pago
        if (paymentConfig.mercadopago.available) {
            mercadoPago = new MercadoPago(paymentConfig.mercadopago.publicKey);
            console.log('✅ Mercado Pago initialized');
        }

        // Update PayPal script src with actual client ID
        if (paymentConfig.paypal.available) {
            updatePayPalScript();
            console.log('✅ PayPal configuration updated');
        }

        // Show/hide payment methods based on availability
        updatePaymentMethodsUI();

    } catch (error) {
        console.error('Error initializing payment gateways:', error);
        showError('Error loading payment methods. Please refresh the page.');
    }
}

// Update PayPal script with actual client ID
function updatePayPalScript() {
    const paypalScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (paypalScript && paymentConfig.paypal.clientId !== 'YOUR_PAYPAL_CLIENT_ID') {
        const newSrc = paypalScript.src.replace('YOUR_PAYPAL_CLIENT_ID', paymentConfig.paypal.clientId);
        paypalScript.src = newSrc;
    }
}

// Update UI based on available payment methods
function updatePaymentMethodsUI() {
    const creditCardOption = document.querySelector('input[value="credit-card"]');
    const paypalOption = document.querySelector('input[value="paypal"]');
    const mercadopagoOption = document.querySelector('input[value="mercadopago"]');

    if (!paymentConfig.stripe.available && creditCardOption) {
        creditCardOption.closest('.payment-option').style.display = 'none';
    }

    if (!paymentConfig.paypal.available && paypalOption) {
        paypalOption.closest('.payment-option').style.display = 'none';
    }

    if (!paymentConfig.mercadopago.available && mercadopagoOption) {
        mercadopagoOption.closest('.payment-option').style.display = 'none';
    }
}

// Load cart data and display order summary
function loadCartData() {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || { items: [], taxRate: 0.10 };
    
    if (cartData.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    displayOrderSummary(cartData);
    return cartData;
}

// Display order summary
function displayOrderSummary(cartData) {
    const orderItemsContainer = document.querySelector('.order-items');
    const subtotalElement = document.querySelector('.subtotal-amount');
    const taxElement = document.querySelector('.tax-amount');
    const totalElement = document.querySelector('.total-amount');

    // Clear existing items
    orderItemsContainer.innerHTML = '';

    let subtotal = 0;

    // Add each item
    cartData.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="item-price">$${itemTotal.toFixed(2)}</div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });

    // Calculate totals
    const tax = subtotal * cartData.taxRate;
    const total = subtotal + tax;

    // Update display
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;

    // Store totals for payment processing
    window.orderTotals = { subtotal, tax, total };
}

// Create order in backend
async function createOrder(cartData, customerInfo, paymentMethod) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cartData.items,
                customerInfo: customerInfo,
                paymentMethod: paymentMethod,
                totalAmount: window.orderTotals.total,
                currency: 'USD'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create order: ${response.statusText}`);
        }

        const result = await response.json();
        currentOrder = result.order;
        return result;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Process Stripe payment
async function processStripePayment(customerInfo, cartData) {
    try {
        showLoading('Processing payment...');

        // Create order first
        const orderResult = await createOrder(cartData, customerInfo, 'stripe');

        // Create payment intent
        const response = await fetch(`${API_BASE_URL}/payments/stripe/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: window.orderTotals.total,
                currency: 'usd',
                metadata: {
                    orderId: orderResult.orderId,
                    customerEmail: customerInfo.email
                }
            })
        });

        const { clientSecret } = await response.json();

        // Get card element
        const cardElement = document.getElementById('card-element');
        
        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                    email: customerInfo.email,
                    address: {
                        line1: customerInfo.address,
                        city: customerInfo.city,
                        state: customerInfo.state,
                        postal_code: customerInfo.zipCode,
                        country: customerInfo.country || 'US'
                    }
                }
            }
        });

        hideLoading();

        if (error) {
            throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
            handlePaymentSuccess(orderResult.orderId, 'stripe');
        }

    } catch (error) {
        hideLoading();
        showError(`Payment failed: ${error.message}`);
    }
}

// Process PayPal payment
async function processPayPalPayment(customerInfo, cartData) {
    try {
        showLoading('Redirecting to PayPal...');

        // Create order first
        const orderResult = await createOrder(cartData, customerInfo, 'paypal');

        // Create PayPal payment
        const response = await fetch(`${API_BASE_URL}/payments/paypal/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: window.orderTotals.total,
                currency: 'USD',
                description: `KiFrames Order #${orderResult.orderId}`
            })
        });

        const { paymentId, approvalUrl } = await response.json();

        if (approvalUrl) {
            // Store order ID for when user returns
            localStorage.setItem('pendingOrderId', orderResult.orderId);
            localStorage.setItem('pendingPaymentId', paymentId);
            
            // Redirect to PayPal
            window.location.href = approvalUrl;
        } else {
            throw new Error('Failed to get PayPal approval URL');
        }

    } catch (error) {
        hideLoading();
        showError(`PayPal payment failed: ${error.message}`);
    }
}

// Process Mercado Pago payment
async function processMercadoPagoPayment(customerInfo, cartData) {
    try {
        showLoading('Processing Mercado Pago payment...');

        // Create order first
        const orderResult = await createOrder(cartData, customerInfo, 'mercadopago');

        // Create Mercado Pago payment
        const response = await fetch(`${API_BASE_URL}/payments/mercadopago/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: window.orderTotals.total,
                email: customerInfo.email,
                description: `KiFrames Order #${orderResult.orderId}`
            })
        });

        const result = await response.json();

        hideLoading();

        if (result.qrCode) {
            // Show QR code for PIX payment
            showMercadoPagoQR(result, orderResult.orderId);
        } else {
            throw new Error('Failed to create Mercado Pago payment');
        }

    } catch (error) {
        hideLoading();
        showError(`Mercado Pago payment failed: ${error.message}`);
    }
}

// Show Mercado Pago QR code
function showMercadoPagoQR(paymentData, orderId) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Scan QR Code to Pay</h3>
            <div class="qr-container">
                <img src="data:image/png;base64,${paymentData.qrCodeBase64}" alt="QR Code" />
            </div>
            <p>Use your banking app to scan this QR code and complete the payment.</p>
            <div class="modal-actions">
                <button onclick="checkMercadoPagoStatus('${paymentData.paymentId}', '${orderId}')" class="btn-primary">
                    Check Payment Status
                </button>
                <button onclick="closeMercadoPagoModal()" class="btn-secondary">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Check Mercado Pago payment status
async function checkMercadoPagoStatus(paymentId, orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/mercadopago/status/${paymentId}`);
        const result = await response.json();

        if (result.status === 'approved') {
            closeMercadoPagoModal();
            handlePaymentSuccess(orderId, 'mercadopago');
        } else if (result.status === 'rejected') {
            closeMercadoPagoModal();
            showError('Payment was rejected. Please try again.');
        } else {
            showInfo('Payment is still pending. Please complete the payment and check again.');
        }
    } catch (error) {
        showError('Error checking payment status. Please try again.');
    }
}

// Close Mercado Pago modal
function closeMercadoPagoModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

// Handle successful payment
function handlePaymentSuccess(orderId, provider) {
    // Clear cart
    localStorage.removeItem('cartData');
    localStorage.removeItem('pendingOrderId');
    localStorage.removeItem('pendingPaymentId');

    // Store success info
    localStorage.setItem('successOrderId', orderId);
    localStorage.setItem('successProvider', provider);

    // Redirect to success page
    window.location.href = 'payment-success.html';
}

// Form validation
function validateForm() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    const errors = [];

    // Required fields
    const requiredFields = [
        'firstName', 'lastName', 'email', 'address', 
        'city', 'state', 'zipCode', 'paymentMethod'
    ];

    requiredFields.forEach(field => {
        if (!formData.get(field)) {
            errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
    });

    // Email validation
    const email = formData.get('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }

    return { isValid: errors.length === 0, errors };
}

// Get form data
function getFormData() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country') || 'US',
        paymentMethod: formData.get('paymentMethod')
    };
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
        showError(validation.errors.join(', '));
        return;
    }

    const customerInfo = getFormData();
    const cartData = JSON.parse(localStorage.getItem('cartData'));

    try {
        switch (customerInfo.paymentMethod) {
            case 'credit-card':
                await processStripePayment(customerInfo, cartData);
                break;
            case 'paypal':
                await processPayPalPayment(customerInfo, cartData);
                break;
            case 'mercadopago':
                await processMercadoPagoPayment(customerInfo, cartData);
                break;
            default:
                throw new Error('Please select a payment method');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Setup Stripe Elements
function setupStripeElements() {
    if (!stripe) return;

    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'transparent',
                '::placeholder': {
                    color: '#888888',
                },
            },
        },
    });

    cardElement.mount('#card-element');

    cardElement.on('change', ({ error }) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// Utility functions
function showLoading(message = 'Processing...') {
    const loader = document.createElement('div');
    loader.id = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.remove();
    }
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function showInfo(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-info';
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Handle payment method selection
function handlePaymentMethodChange() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const creditCardDetails = document.getElementById('credit-card-details');
    
    if (selectedMethod && selectedMethod.value === 'credit-card') {
        creditCardDetails.style.display = 'block';
        setupStripeElements();
    } else {
        creditCardDetails.style.display = 'none';
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Load cart data
    const cartData = loadCartData();
    if (!cartData) return;

    // Initialize payment gateways
    await initializePaymentGateways();

    // Setup form submission
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', handleFormSubmit);

    // Setup payment method change handlers
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });

    // Add click handler to logo for navigation to home page
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            window.location.href = 'index.html#products';
        });
    }

    // Handle PayPal return (if coming back from PayPal)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');
    
    if (paymentId && payerId) {
        handlePayPalReturn(paymentId, payerId);
    }
});

// Handle PayPal return
async function handlePayPalReturn(paymentId, payerId) {
    try {
        showLoading('Completing PayPal payment...');

        const response = await fetch(`${API_BASE_URL}/payments/paypal/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentId: paymentId,
                payerId: payerId
            })
        });

        const result = await response.json();

        if (result.status === 'approved') {
            const orderId = localStorage.getItem('pendingOrderId');
            handlePaymentSuccess(orderId, 'paypal');
        } else {
            throw new Error('PayPal payment was not approved');
        }

    } catch (error) {
        hideLoading();
        showError(`PayPal payment failed: ${error.message}`);
    }
} 