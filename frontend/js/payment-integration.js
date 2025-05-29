// KiFrames Payment Integration - Argentina Focused
class PaymentManager {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.config = null;
        this.argentinePaymentMethods = null;
        this.init();
    }

    async init() {
        try {
            // Get payment configuration from backend
            const response = await fetch(`${this.apiBase}/payments/config`);
            this.config = await response.json();
            
            // Get Argentina-specific payment methods
            const argResponse = await fetch(`${this.apiBase}/payments/argentina/payment-methods`);
            this.argentinePaymentMethods = await argResponse.json();
            
            console.log('Payment configuration loaded:', this.config);
            console.log('Argentina payment methods:', this.argentinePaymentMethods);
        } catch (error) {
            console.error('Failed to load payment configuration:', error);
        }
    }

    // PayPal Payment (works in Argentina)
    async createPayPalPayment(amount, currency = 'USD') {
        try {
            const response = await fetch(`${this.apiBase}/payments/paypal/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    amount: parseFloat(amount),
                    currency: currency,
                    description: 'KiFrames Media Organizer Purchase'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('PayPal payment creation failed:', error);
            throw error;
        }
    }

    // Enhanced Mercado Pago Payment with Argentina-specific methods
    async createMercadoPagoPayment(amount, email, paymentMethod = 'multiple') {
        try {
            const response = await fetch(`${this.apiBase}/payments/mercadopago/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    amount: parseFloat(amount),
                    email: email,
                    paymentMethod: paymentMethod,
                    description: 'KiFrames Media Organizer'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Mercado Pago payment creation failed:', error);
            throw error;
        }
    }

    // Create Order
    async createOrder(orderData) {
        try {
            const response = await fetch(`${this.apiBase}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Order creation failed:', error);
            throw error;
        }
    }

    // Get Payment Status
    async getPaymentStatus(provider, paymentId) {
        try {
            const response = await fetch(`${this.apiBase}/payments/status/${provider}/${paymentId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get payment status:', error);
            throw error;
        }
    }

    // Utility function to format currency for Argentina
    formatCurrency(amount, currency = 'ARS') {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Show available payment methods for Argentina
    displayArgentinePaymentMethods(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.argentinePaymentMethods) return;

        const html = `
            <div class="payment-methods-argentina">
                <h3>🇦🇷 Métodos de Pago Disponibles en Argentina</h3>
                
                <div class="payment-method-group">
                    <h4>✅ Mercado Pago (Recomendado)</h4>
                    <p>${this.argentinePaymentMethods.mercadoPago.description}</p>
                    
                    <div class="payment-options">
                        ${this.argentinePaymentMethods.mercadoPago.methods.map(method => `
                            <div class="payment-option ${method.recommended ? 'recommended' : ''}" 
                                 data-method="${method.id}">
                                <strong>${method.name}</strong>
                                <p>${method.description}</p>
                                ${method.recommended ? '<span class="badge">Recomendado</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="payment-method-group">
                    <h4>💳 PayPal</h4>
                    <p>${this.argentinePaymentMethods.paypal.description}</p>
                    <p><small>${this.argentinePaymentMethods.paypal.note}</small></p>
                </div>

                <div class="alternatives">
                    <h4>🔄 Alternativas Adicionales</h4>
                    <p>Si necesitas otros procesadores de pago argentinos:</p>
                    ${this.argentinePaymentMethods.alternatives.map(alt => `
                        <div class="alternative">
                            <strong>${alt.name}</strong> - ${alt.description}
                            <br><small>Características: ${alt.features.join(', ')}</small>
                            <br><a href="${alt.website}" target="_blank">${alt.website}</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Show payment success message
    showPaymentSuccess(paymentData) {
        const message = `
            <div class="payment-success">
                <h3>✅ ¡Pago Exitoso!</h3>
                <p>Gracias por tu compra de KiFrames Media Organizer</p>
                <p>ID de Pago: ${paymentData.paymentId || paymentData.id}</p>
                <p>Monto: ${this.formatCurrency(paymentData.amount || 0)}</p>
            </div>
        `;
        
        const container = document.getElementById('payment-messages') || document.body;
        container.innerHTML = message;
    }

    // Show payment error message
    showPaymentError(error) {
        const message = `
            <div class="payment-error">
                <h3>❌ Error en el Pago</h3>
                <p>Hubo un problema procesando tu pago.</p>
                <p>Error: ${error.message}</p>
                <p>Por favor intenta nuevamente o contacta soporte.</p>
            </div>
        `;
        
        const container = document.getElementById('payment-messages') || document.body;
        container.innerHTML = message;
    }
}

// Initialize payment manager when page loads
let paymentManager;
document.addEventListener('DOMContentLoaded', () => {
    paymentManager = new PaymentManager();
});

// Argentina-focused payment functions
async function processPayPalPayment(amount) {
    try {
        const paymentData = await paymentManager.createPayPalPayment(amount);
        
        if (paymentData.approvalUrl) {
            // Redirect to PayPal for approval
            window.location.href = paymentData.approvalUrl;
        }
        
        console.log('PayPal payment created:', paymentData);
    } catch (error) {
        paymentManager.showPaymentError(error);
    }
}

async function processMercadoPagoPayment(amount, email, paymentMethod = 'multiple') {
    try {
        const paymentData = await paymentManager.createMercadoPagoPayment(amount, email, paymentMethod);
        
        // If it's a preference (multiple payment methods), redirect to Mercado Pago
        if (paymentData.initPoint) {
            window.location.href = paymentData.initPoint;
            return;
        }
        
        // For direct payments, show success or specific instructions
        if (paymentData.ticketUrl) {
            window.open(paymentData.ticketUrl, '_blank');
        }
        
        paymentManager.showPaymentSuccess({
            paymentId: paymentData.paymentId,
            amount: amount
        });
        
        console.log('Mercado Pago payment created:', paymentData);
    } catch (error) {
        paymentManager.showPaymentError(error);
    }
}

// Quick payment buttons for common Argentina scenarios
function createQuickPaymentButtons(containerId, amount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
        <div class="quick-payment-buttons">
            <h3>💳 Pago Rápido - ${paymentManager ? paymentManager.formatCurrency(amount) : `$${amount}`}</h3>
            
            <button class="btn-mercadopago" onclick="processMercadoPagoQuick(${amount})">
                💙 Pagar con Mercado Pago
            </button>
            
            <button class="btn-paypal" onclick="processPayPalPayment(${amount})">
                💳 Pagar con PayPal
            </button>
            
            <div class="payment-info">
                <p>✅ Mercado Pago: Tarjetas, transferencias, Rapipago, Pago Fácil</p>
                <p>🌍 PayPal: Ideal para pagos internacionales</p>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

async function processMercadoPagoQuick(amount) {
    const email = prompt('Ingresa tu email para Mercado Pago:');
    if (email) {
        await processMercadoPagoPayment(amount, email, 'multiple');
    }
} 