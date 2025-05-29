// Scroll to products section function (reusable)
function scrollToProducts() {
    // Add fade effect to background shapes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        shape.style.transition = 'opacity 1s ease';
        shape.style.opacity = '0.1';
    });
    
    // Smooth scroll to servicios section
    const serviciosSection = document.getElementById('servicios');
    if (serviciosSection) {
        serviciosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Handle Get Started button click
function handleGetStarted(serviceId = null) {
    // Get service details if serviceId is provided
    let message = 'Hola! Me gustaría solicitar información sobre tus servicios.';
    
    if (serviceId && serviceData[serviceId]) {
        const service = serviceData[serviceId];
        message = `Hola! Me gustaría solicitar información sobre el servicio de ${service.title} (${service.subtitle}).`;
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp number (replace with your actual number)
    const whatsappNumber = '5491130032002';
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Add smooth entrance animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    const elements = [
        '.logo-container',
        '.hero-title',
        '.hero-subtitle',
        '.cta-button'
    ];
    
    elements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 200 + (index * 200));
        }
    });

    // Add click handler to logo for navigation to products section
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.style.cursor = 'pointer';
        logoContainer.addEventListener('click', function() {
            scrollToProducts();
        });
    }

    // Check if page was loaded with #products hash
    if (window.location.hash === '#products') {
        setTimeout(() => {
            scrollToProducts();
        }, 500); // Wait for page to fully load
    }
});

// Add parallax effect to background shapes on mouse move
document.addEventListener('mousemove', function(e) {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const button = document.querySelector('.cta-button');
        if (document.activeElement === button) {
            e.preventDefault();
            handleGetStarted();
        }
    }
});

// Add focus styles for accessibility
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.cta-button');
    
    button.addEventListener('focus', function() {
        this.style.outline = '2px solid #2dd4bf';
        this.style.outlineOffset = '4px';
    });
    
    button.addEventListener('blur', function() {
        this.style.outline = 'none';
    });
});

// Animate products on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe product cards
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    const sectionHeader = document.querySelector('.section-header');
    
    // Initial state for animation
    productCards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.3s ease';
        observer.observe(card);
    });
    
    if (sectionHeader) {
        sectionHeader.style.opacity = '0';
        sectionHeader.style.transform = 'translateY(30px)';
        sectionHeader.style.transition = 'all 0.8s ease';
        observer.observe(sectionHeader);
    }
});

// Product Detail Modal Functions
function openProductDetail(productId) {
    const modal = document.getElementById('productDetailModal');
    
    // Update modal content based on product ID
    updateModalContent(productId);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function updateModalContent(productId) {
    const products = {
        'kiframes-organizer': {
            title: 'KiFrames Media Organizer',
            subtitle: 'Smart video organization and tagging system',
            price: 25,
            description: 'KiFrames Media Organizer is an intelligent video management system that revolutionizes how you organize, sort, and tag your video library. Using advanced AI technology, it automatically analyzes your footage and creates a smart organizational system that saves you hours of manual work.',
            features: ['AI-Powered', 'Cloud Integration']
        },
        'kiframes-sample-manager': {
            title: 'KiFrames Sample Manager',
            subtitle: 'AI-powered audio sample organization',
            price: 29,
            description: 'KiFrames Sample Manager is the ultimate tool for music producers to organize their sample libraries. With intelligent BPM detection, key analysis, and automatic tagging, it transforms chaotic sample folders into a perfectly organized creative arsenal.',
            features: ['BPM Detection', 'Key Analysis', 'Auto-Tagging']
        }
    };
    
    const product = products[productId];
    if (!product) return;
    
    // Update modal elements
    const titleElement = document.querySelector('.detail-title');
    const subtitleElement = document.querySelector('.detail-subtitle');
    const priceElement = document.querySelector('.detail-price-current .price-amount');
    const descriptionElement = document.querySelector('.detail-description p');
    const addToCartBtn = document.querySelector('.add-to-cart-button');
    
    if (titleElement) titleElement.textContent = product.title;
    if (subtitleElement) subtitleElement.textContent = product.subtitle;
    if (priceElement) priceElement.textContent = product.price;
    if (descriptionElement) descriptionElement.textContent.value = product.description;
    if (addToCartBtn) addToCartBtn.textContent = `Add to Cart - $${product.price}`;
    
    // Store current product data for cart functionality
    window.currentProduct = {
        id: productId,
        name: product.title,
        price: product.price,
        description: product.subtitle,
        features: product.features
    };
}

function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('productDetailModal');
    if (e.target === modal) {
        closeProductDetail();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductDetail();
    }
});

// Handle product card and button clicks
document.addEventListener('click', function(e) {
    // Check if clicked on product card or its children (but not the button)
    const productCard = e.target.closest('.product-card');
    const mobileProductCard = e.target.closest('.mobile-product-card');
    const isButton = e.target.classList.contains('product-button');
    
    // Handle desktop product cards
    if (productCard && !isButton) {
        e.preventDefault();
        
        // Get product ID and open modal
        const productId = productCard.getAttribute('data-product-id');
        openProductDetail(productId);
    }
    
    // Handle mobile product cards
    if (mobileProductCard && !isButton) {
        e.preventDefault();
        
        // Get product ID and open modal
        const productId = mobileProductCard.getAttribute('data-product-id');
        openProductDetail(productId);
    }
    
    // Handle direct button clicks (keep existing functionality)
    if (isButton) {
        e.preventDefault();
        
        // Add click animation
        e.target.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            e.target.style.transform = '';
            
            // Get product ID and open modal
            const productCard = e.target.closest('.product-card') || e.target.closest('.mobile-product-card');
            const productId = productCard.getAttribute('data-product-id');
            openProductDetail(productId);
        }, 150);
    }
    
    // Handle modal action buttons
    if (e.target.classList.contains('add-to-cart-button')) {
        e.preventDefault();
        
        // Add click animation
        e.target.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            e.target.style.transform = '';
            
            // Use current product data from modal
            const productData = window.currentProduct || {
                id: 'kiframes-organizer',
                name: 'KiFrames Media Organizer',
                price: 25,
                description: 'Smart video organization and tagging system',
                features: ['AI-Powered', 'Cloud Integration']
            };
            
            // Use the cart system instead of redirecting
            if (typeof addToCart === 'function') {
                addToCart(productData);
                // Close modal after adding to cart
                setTimeout(() => {
                    closeProductDetail();
                }, 500);
            } else {
                // Fallback: save to localStorage and redirect
                let cartData = JSON.parse(localStorage.getItem('cartData')) || { items: [], taxRate: 0.10 };
                
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
                        features: productData.features
                    });
                }
                
                localStorage.setItem('cartData', JSON.stringify(cartData));
                
                // Redirect to cart page
                window.location.href = 'cart.html';
            }
        }, 150);
    }
    
    if (e.target.classList.contains('subscribe-button')) {
        e.preventDefault();
        alert('Subscription option selected! This would open subscription plans.');
    }
    
    // Handle extra buttons
    if (e.target.classList.contains('wishlist-btn')) {
        e.preventDefault();
        alert('Added to wishlist!');
    }
    
    if (e.target.classList.contains('demo-btn')) {
        e.preventDefault();
        alert('Demo would start here!');
    }
    
    if (e.target.classList.contains('guide-btn')) {
        e.preventDefault();
        alert('User guide would open here!');
    }
    
    if (e.target.classList.contains('upgrades-btn')) {
        e.preventDefault();
        alert('Upgrade options would be shown here!');
    }
});

// ========================================
// ANIMATED WORD FUNCTIONALITY
// ========================================
function initAnimatedWord() {
    // Obtener el elemento donde se mostrará la palabra
    const wordElement = document.getElementById('animated-word');
    if (!wordElement) return;

    // Lista de palabras que se mostrarán
    const words = ['marca', 'Google Maps', 'branding', 'PyME'];
    
    // Estado inicial
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        // Obtener la palabra actual
        const currentWord = words[wordIndex];

        // Actualizar el texto
        if (isDeleting) {
            // Borrando
            wordElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Escribiendo
            wordElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        // Controlar el flujo de la animación
        if (!isDeleting && charIndex === currentWord.length) {
            // Terminó de escribir, esperar antes de borrar
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Terminó de borrar, pasar a la siguiente palabra
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500;
        }

        // Programar el siguiente paso
        setTimeout(type, typingSpeed);
    }

    // Iniciar la animación
    type();
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que las animaciones iniciales terminen
    setTimeout(initAnimatedWord, 2000);
});

// ========================================
// TOP NAVIGATION BAR FUNCTIONALITY
// ========================================

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    updateActiveTab('home');
}

// Scroll to footer function
function scrollToFooter() {
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    updateActiveTab('contact');
}

// Update active tab
function updateActiveTab(activeTabName) {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        const href = tab.getAttribute('href');
        if (href === `#${activeTabName}`) {
            tab.classList.add('active');
        }
    });
}

// Handle navigation bar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.top-nav');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.98)';
        navbar.style.borderBottomColor = 'rgba(45, 212, 191, 0.2)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.borderBottomColor = 'rgba(45, 212, 191, 0.1)';
    }
    
    // Update active tab based on scroll position
    const sections = [
        { name: 'home', element: document.querySelector('.container') },
        { name: 'products', element: document.getElementById('products') },
        { name: 'contact', element: document.querySelector('.footer') }
    ];
    
    let currentSection = 'home';
    sections.forEach(section => {
        if (section.element) {
            const rect = section.element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.name;
            }
        }
    });
    
    updateActiveTab(currentSection);
});

// Add click handler to navigation logo
document.addEventListener('DOMContentLoaded', function() {
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', function() {
            scrollToTop();
        });
    }
});

// Override the existing scrollToProducts function to update nav
const originalScrollToProducts = scrollToProducts;
scrollToProducts = function() {
    originalScrollToProducts();
    updateActiveTab('products');
};

// ========================================
// MOBILE HAMBURGER MENU FUNCTIONALITY
// ========================================

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    const hamburger = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && hamburger) {
        mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    const hamburger = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && hamburger) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    const hamburger = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && hamburger && mobileMenu.classList.contains('active')) {
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// Close mobile menu on window resize if it gets too wide
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// Handle mobile menu links
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-tab');
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's a regular link (not onclick), close the menu after a short delay
            if (!this.hasAttribute('onclick')) {
                setTimeout(() => {
                    closeMobileMenu();
                }, 100);
            }
        });
    });
});

// ========================================
// SERVICE DETAIL MODAL FUNCTIONALITY
// ========================================
const serviceData = {
    'desarrollo-web': {
        title: '💻 Sitio Web Profesional',
        subtitle: 'Diseño moderno y funcional',
        price: 300,
        description: 'Creamos sitios web modernos, rápidos y optimizados para SEO que convierten visitantes en clientes reales. Nuestro enfoque combina diseño atractivo con funcionalidad avanzada para crear una experiencia web excepcional.',
        features: [
            'Diseño responsivo y adaptable a todos los dispositivos',
            'Optimización SEO para mejor posicionamiento',
            'Integración con redes sociales y herramientas de marketing',
            'Panel de administración intuitivo',
            'Soporte técnico y mantenimiento incluido',
            'Certificado SSL de seguridad'
        ],
        gallery: [
            '/assets/images/services/web-1.jpg',
            '/assets/images/services/web-2.jpg',
            '/assets/images/services/web-3.jpg'
        ],
        video: '/assets/videos/web-service.mp4'
    },
    'ai-agent': {
        title: '🤖 Secretario IA Personalizado',
        subtitle: 'Asistente virtual inteligente para tu negocio',
        price: 50,
        description: 'Implementamos un secretario virtual con IA que gestiona tu agenda, responde consultas y automatiza tareas administrativas. Tu asistente personal disponible 24/7 para optimizar la gestión de tu negocio.',
        features: [
            'Gestión automática de agenda y citas',
            'Respuesta inteligente a consultas frecuentes',
            'Automatización de tareas administrativas',
            'Integración con tus sistemas existentes',
            'Personalización según tus necesidades',
            'Soporte técnico y actualizaciones incluidas'
        ],
        gallery: [
            '/assets/images/services/ai-1.jpg',
            '/assets/images/services/ai-2.jpg',
            '/assets/images/services/ai-3.jpg'
        ],
        video: '/assets/videos/ai-service.mp4'
    },
    'google-maps': {
        title: '📍 Google Maps',
        subtitle: 'Optimización de presencia local',
        price: 50,
        description: 'Optimizamos tu perfil de Google My Business para que aparezcas primero en búsquedas locales. Incluye gestión de reseñas, fotos profesionales y contenido optimizado para maximizar tu visibilidad.',
        features: [
            'Optimización completa del perfil de Google My Business',
            'Gestión de reseñas y respuestas',
            'Fotos profesionales de tu negocio',
            'Contenido optimizado para búsquedas locales',
            'Monitoreo de posicionamiento',
            'Informes mensuales de rendimiento'
        ],
        gallery: [
            '/assets/images/services/maps-1.jpg',
            '/assets/images/services/maps-2.jpg',
            '/assets/images/services/maps-3.jpg'
        ],
        video: '/assets/videos/maps-service.mp4'
    },
    'branding': {
        title: '🎨 Branding de Marca',
        subtitle: 'Identidad visual profesional',
        price: 80,
        description: 'Desarrollamos tu identidad de marca completa: logo, paleta de colores, tipografía y guía de estilo. Creamos una imagen coherente y memorable que refleja los valores de tu negocio.',
        features: [
            'Diseño de logo profesional',
            'Paleta de colores personalizada',
            'Selección de tipografías',
            'Guía de estilo completa',
            'Aplicaciones en diferentes medios',
            'Archivos en múltiples formatos'
        ],
        gallery: [
            '/assets/images/services/branding-1.jpg',
            '/assets/images/services/branding-2.jpg',
            '/assets/images/services/branding-3.jpg'
        ],
        video: '/assets/videos/branding-service.mp4'
    }
};

let currentGalleryIndex = 0;

function openServiceDetail(serviceId) {
    const modal = document.getElementById('serviceDetailModal');
    const service = serviceData[serviceId];
    
    if (!service) return;
    
    // Store current service ID in modal
    modal.setAttribute('data-current-service', serviceId);
    
    // Rest of the existing code...
    document.querySelector('.service-modal-title').textContent = service.title;
    document.querySelector('.service-modal-subtitle').textContent = service.subtitle;
    document.querySelector('.service-full-description').textContent = service.description;
    document.querySelector('.service-price .price-amount').textContent = service.price;
    
    // Update features
    const featuresList = document.querySelector('.features-list');
    featuresList.innerHTML = service.features.map(feature => 
        `<li>${feature}</li>`
    ).join('');
    
    // Update gallery
    const mainImage = document.querySelector('.gallery-main-image');
    const thumbnails = document.querySelector('.gallery-thumbnails');
    
    mainImage.src = service.gallery[0];
    thumbnails.innerHTML = service.gallery.map((img, index) => 
        `<img src="${img}" alt="Thumbnail ${index + 1}" class="gallery-thumbnail ${index === 0 ? 'active' : ''}" onclick="changeGalleryImage(${index})">`
    ).join('');
    
    // Update video
    const video = document.querySelector('.service-video-player source');
    video.src = service.video;
    video.parentElement.load();
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceDetail() {
    const modal = document.getElementById('serviceDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeGalleryImage(index) {
    const mainImage = document.querySelector('.gallery-main-image');
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    
    mainImage.src = thumbnails[index].src;
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnails[index].classList.add('active');
    currentGalleryIndex = index;
}

function nextGalleryImage() {
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    const nextIndex = (currentGalleryIndex + 1) % thumbnails.length;
    changeGalleryImage(nextIndex);
}

function prevGalleryImage() {
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    const prevIndex = (currentGalleryIndex - 1 + thumbnails.length) % thumbnails.length;
    changeGalleryImage(prevIndex);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('serviceDetailModal');
    if (e.target === modal) {
        closeServiceDetail();
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeServiceDetail();
    }
});

// Add event listeners to service cards
document.addEventListener('DOMContentLoaded', function() {
    // Get all service cards
    const serviceCards = document.querySelectorAll('.product-card, .mobile-product-card');
    
    // Add click event listener to each card
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't open modal if clicking the button
            if (e.target.classList.contains('product-button')) {
                return;
            }
            
            // Get service ID and open modal
            const serviceId = card.getAttribute('data-product-id');
            openServiceDetail(serviceId);
        });
    });
});

// Add event listeners for all "Solicitar Cotización" buttons
document.addEventListener('DOMContentLoaded', function() {
    // Handle buttons in service cards
    const productButtons = document.querySelectorAll('.product-button');
    productButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceId = this.closest('.product-card, .mobile-product-card').getAttribute('data-product-id');
            handleGetStarted(serviceId);
        });
    });

    // Handle button in modal
    const modalButton = document.querySelector('.add-to-cart-button');
    if (modalButton) {
        modalButton.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById('serviceDetailModal');
            const serviceId = modal.getAttribute('data-current-service');
            handleGetStarted(serviceId);
            closeServiceDetail();
        });
    }
});

// Remove the old click handler that was conflicting
document.removeEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-button')) {
        // ... old code ...
    }
}); 