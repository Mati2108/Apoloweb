// Cart functionality
let cartData = {
    items: [],
    taxRate: 0.10 // 10% tax
};

// Get total cart count
function getCartCount() {
    return cartData.items.reduce((total, item) => total + item.quantity, 0);
}

// Update cart count in navigation bar
function updateCartCount() {
    const cartCount = getCartCount();
    
    // Update all cart count elements on the page
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cartTabElements = document.querySelectorAll('.nav-tab[href="cart.html"], .mobile-nav-tab[href="cart.html"]');
    
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
        element.style.display = cartCount > 0 ? 'flex' : 'none';
    });
    
    // Update cart tab text to include count
    cartTabElements.forEach(tab => {
        const textElement = tab.querySelector('.tab-text');
        if (textElement) {
            textElement.textContent = cartCount > 0 ? `Cart (${cartCount})` : 'Cart';
        }
    });
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cartData.items.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        updateCartDisplay();
        updateSummary();
        updateCartCount();
        saveCartData();
    }
}

// Remove item from cart
function removeItem(productId) {
    // Add confirmation
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        cartData.items = cartData.items.filter(item => item.id !== productId);
        updateCartDisplay();
        updateSummary();
        updateCartCount();
        saveCartData();
        
        // Show empty cart if no items
        if (cartData.items.length === 0) {
            showEmptyCart();
        }
    }
}

// Save cart data to localStorage
function saveCartData() {
    localStorage.setItem('cartData', JSON.stringify(cartData));
}

// Update cart display
function updateCartDisplay() {
    cartData.items.forEach(item => {
        const quantityElement = document.querySelector(`[data-product-id="${item.id}"] .quantity-value`);
        const priceElement = document.querySelector(`[data-product-id="${item.id}"] .price-amount`);
        
        if (quantityElement) {
            quantityElement.textContent = item.quantity;
        }
        
        if (priceElement) {
            priceElement.textContent = `$${item.price * item.quantity}`;
        }
    });
}

// Update summary
function updateSummary() {
    const subtotal = cartData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * cartData.taxRate;
    const total = subtotal + tax;
    
    // Update summary elements
    const subtotalElement = document.querySelector('.subtotal-amount');
    const taxElement = document.querySelector('.tax-amount');
    const totalElement = document.querySelector('.total-amount');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Show empty cart
function showEmptyCart() {
    const cartContent = document.querySelector('.cart-content');
    const emptyCart = document.querySelector('.empty-cart');
    const cartHeaderSection = document.querySelector('.cart-header-section');
    
    if (cartContent && emptyCart) {
        // Hide the entire cart content grid
        cartContent.style.display = 'none';
        
        // Hide the cart header section (Shopping Cart title)
        if (cartHeaderSection) {
            cartHeaderSection.style.display = 'none';
        }
        
        // Show empty cart message (now centered on screen)
        emptyCart.style.display = 'flex';
    }
}

// Show cart with items
function showCartWithItems() {
    const cartContent = document.querySelector('.cart-content');
    const emptyCart = document.querySelector('.empty-cart');
    const cartHeaderSection = document.querySelector('.cart-header-section');
    
    if (cartContent && emptyCart) {
        // Show the cart content grid
        cartContent.style.display = 'grid';
        
        // Show the cart header section
        if (cartHeaderSection) {
            cartHeaderSection.style.display = 'block';
        }
        
        // Hide empty cart message
        emptyCart.style.display = 'none';
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cartData.items.length === 0) {
        alert('Your cart is empty. Please add some items before checkout.');
        return;
    }
    
    // Store cart data in localStorage for checkout page
    localStorage.setItem('checkoutData', JSON.stringify(cartData));
    
    // Navigate to checkout
    window.location.href = 'checkout.html';
}

// Enhanced add to cart function
function addToCart(productData) {
    const existingItem = cartData.items.find(item => item.id === productData.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartData.items.push({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            quantity: 1,
            description: productData.description,
            features: productData.features || []
        });
    }
    
    // Show cart with items if it was empty
    if (cartData.items.length > 0) {
        showCartWithItems();
        updateCartDisplay();
        updateSummary();
    }
    
    // Update cart count in navigation
    updateCartCount();
    
    // Save to localStorage
    saveCartData();
    
    // Show success message
    showAddToCartSuccess(productData.name);
    
    return true; // Return success
}

// Enhanced success notification
function showAddToCartSuccess(productName) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="notification-text">
                <span class="notification-title">${productName} added!</span>
                <span class="notification-subtitle">Cart: ${getCartCount()} items</span>
            </div>
            <a href="cart.html" class="notification-cart-link">View Cart</a>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
        color: #0a0a0a;
        padding: 16px 20px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(45, 212, 191, 0.3);
        min-width: 280px;
        max-width: 350px;
    `;
    
    // Style the content
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const icon = notification.querySelector('.notification-icon');
    icon.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(10, 10, 10, 0.2);
        border-radius: 50%;
        flex-shrink: 0;
    `;
    
    const textDiv = notification.querySelector('.notification-text');
    textDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        flex: 1;
    `;
    
    const title = notification.querySelector('.notification-title');
    title.style.cssText = `
        font-weight: 600;
        font-size: 14px;
        line-height: 1.2;
    `;
    
    const subtitle = notification.querySelector('.notification-subtitle');
    subtitle.style.cssText = `
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
    `;
    
    const cartLink = notification.querySelector('.notification-cart-link');
    cartLink.style.cssText = `
        background: rgba(10, 10, 10, 0.2);
        padding: 6px 12px;
        border-radius: 6px;
        text-decoration: none;
        color: inherit;
        font-size: 12px;
        font-weight: 600;
        transition: background 0.2s ease;
        white-space: nowrap;
    `;
    
    cartLink.addEventListener('mouseenter', () => {
        cartLink.style.background = 'rgba(10, 10, 10, 0.3)';
    });
    
    cartLink.addEventListener('mouseleave', () => {
        cartLink.style.background = 'rgba(10, 10, 10, 0.2)';
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Load cart data from localStorage if available
function loadCartData() {
    const savedCart = localStorage.getItem('cartData');
    if (savedCart) {
        cartData = JSON.parse(savedCart);
        if (cartData.items.length === 0) {
            showEmptyCart();
        } else {
            showCartWithItems();
            updateCartDisplay();
            updateSummary();
        }
    } else {
        // No saved cart data, show empty cart
        cartData.items = [];
        showEmptyCart();
    }
    
    // Always update cart count on load
    updateCartCount();
}

// Add smooth animations on load
document.addEventListener('DOMContentLoaded', function() {
    // Animate cart items
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Animate summary card
    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard) {
        summaryCard.style.opacity = '0';
        summaryCard.style.transform = 'translateY(20px)';
        summaryCard.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            summaryCard.style.opacity = '1';
            summaryCard.style.transform = 'translateY(0)';
        }, 300);
    }

    // Add click handler to logo for navigation to home page
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            window.location.href = 'index.html#products';
        });
    }
    
    // Initialize cart
    loadCartData();
});

// Global function to get cart count (accessible from other scripts)
window.getCartCount = getCartCount;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;

// Initialize cart on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCartData);
} else {
    loadCartData();
} 