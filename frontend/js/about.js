// About Page Microanimations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations
    initializePageAnimations();
    
    // Setup scroll-triggered animations
    setupScrollAnimations();
    
    // Setup enhanced interactions
    setupEnhancedInteractions();
    
    // Setup photo container effects
    setupPhotoEffects();
    
    // Setup scroll progress and navigation
    setupScrollProgress();
    
    // Setup performance optimizations
    setupPerformanceOptimizations();
});

// Initialize page load animations
function initializePageAnimations() {
    // Add loading state
    document.body.classList.add('page-loading');
    
    // Remove loading state after initial animations
    setTimeout(() => {
        document.body.classList.remove('page-loading');
        document.body.classList.add('page-loaded');
    }, 1000);
    
    // Stagger text animations for story content
    const storyTexts = document.querySelectorAll('.story-text');
    storyTexts.forEach((text, index) => {
        text.style.animationDelay = `${0.8 + (index * 0.2)}s`;
    });
}

// Setup scroll-triggered animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Add special effects for certain elements
                if (entry.target.classList.contains('photo-container')) {
                    setTimeout(() => {
                        entry.target.style.transform = 'rotate(2deg) scale(1.02)';
                        setTimeout(() => {
                            entry.target.style.transform = 'rotate(2deg) scale(1)';
                        }, 300);
                    }, 500);
                }
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const scrollElements = document.querySelectorAll('.story-content, .welcome-layout, .photo-container, .cta-actions');
    scrollElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Setup enhanced interactions
function setupEnhancedInteractions() {
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        let isPressed = false;
        
        button.addEventListener('mouseenter', function(e) {
            if (!isPressed) {
                this.style.transform = 'translateY(-3px) scale(1.02)';
                this.style.filter = 'brightness(1.1)';
            }
        });
        
        button.addEventListener('mouseleave', function(e) {
            if (!isPressed) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.filter = 'brightness(1)';
            }
        });
        
        button.addEventListener('mousedown', function(e) {
            isPressed = true;
            this.style.transform = 'translateY(-1px) scale(0.98)';
            this.style.filter = 'brightness(0.9)';
        });
        
        button.addEventListener('mouseup', function(e) {
            isPressed = false;
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.filter = 'brightness(1.1)';
        });
        
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    });

    // Welcome title interaction
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        welcomeTitle.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(45, 212, 191, 0.5)';
        });
        
        welcomeTitle.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    }
}

// Setup photo container special effects
function setupPhotoEffects() {
    const photoContainer = document.querySelector('.photo-container');
    if (!photoContainer) return;
    
    let floatAnimation;
    let isHovering = false;
    
    // Gentle floating animation
    function startFloating() {
        if (isHovering) return;
        
        let direction = 1;
        let position = 0;
        
        floatAnimation = setInterval(() => {
            if (isHovering) return;
            
            position += direction * 0.3;
            if (Math.abs(position) > 2) {
                direction *= -1;
            }
            
            photoContainer.style.transform = `translateY(${position}px)`;
        }, 50);
    }
    
    function stopFloating() {
        if (floatAnimation) {
            clearInterval(floatAnimation);
        }
    }
    
    // Enhanced hover effects
    photoContainer.addEventListener('mouseenter', function() {
        isHovering = true;
        stopFloating();
        
        this.style.transform = 'scale(1.08) translateY(-5px)';
        this.style.filter = 'drop-shadow(0 20px 40px rgba(45, 212, 191, 0.3)) brightness(1.05)';
        this.style.zIndex = '10';
        
        // Add subtle glow to the photo
        const photo = this.querySelector('.creator-photo');
        if (photo) {
            photo.style.filter = 'brightness(1.1) contrast(1.05) saturate(1.1)';
        }
    });
    
    photoContainer.addEventListener('mouseleave', function() {
        isHovering = false;
        
        this.style.transform = 'scale(1) translateY(0px)';
        this.style.filter = 'none';
        this.style.zIndex = '1';
        
        const photo = this.querySelector('.creator-photo');
        if (photo) {
            photo.style.filter = 'none';
        }
        
        setTimeout(startFloating, 500);
    });
    
    // Start initial floating
    setTimeout(startFloating, 2000);
}

// Setup scroll progress indicator
function setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 2px;
        background: linear-gradient(90deg, #2dd4bf, #14b8a6);
        z-index: 9999;
        transition: width 0.1s ease;
        opacity: 0;
        transition: width 0.1s ease, opacity 0.3s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    let ticking = false;
    
    function updateProgress() {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = Math.min(scrolled, 100) + '%';
        
        // Show/hide progress bar
        if (window.scrollY > 100) {
            progressBar.style.opacity = '1';
        } else {
            progressBar.style.opacity = '0';
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    });
}

// Create ripple effect
function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Setup performance optimizations
function setupPerformanceOptimizations() {
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', function() {
        const animations = document.querySelectorAll('[style*="animation"]');
        animations.forEach(el => {
            if (document.hidden) {
                el.style.animationPlayState = 'paused';
            } else {
                el.style.animationPlayState = 'running';
            }
        });
    });
    
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
        document.documentElement.style.setProperty('--transition-duration', '0.01s');
    }
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            // Add any scroll-based optimizations here
        }, 16); // ~60fps
    });
}

// Add CSS for enhanced animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .page-loading * {
        animation-play-state: paused !important;
    }
    
    .page-loaded * {
        animation-play-state: running !important;
    }
    
    .scroll-animate {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .scroll-animate.in-view {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Smooth hardware acceleration */
    .photo-container,
    .btn-primary,
    .btn-secondary,
    .story-text {
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
    }
    
    /* Improved focus styles for accessibility */
    .btn-primary:focus,
    .btn-secondary:focus {
        outline: 2px solid #2dd4bf;
        outline-offset: 2px;
    }
`;

document.head.appendChild(enhancedStyles); 