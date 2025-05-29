const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const { connectDatabase } = require('./database');
require('dotenv').config({ path: './config/.env' });
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
connectDatabase();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve CSS files
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));

// Serve JS files  
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));

// Serve pages
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));

// Serve assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API Routes (with error handling)
try {
    app.use('/api/payments', require('./routes/payments'));
    app.use('/api/orders', require('./routes/orders'));
    app.use('/api/webhooks', require('./routes/webhooks'));
    app.use('/api/auth', require('./routes/auth').router);
    console.log('✅ Payment routes loaded successfully');
    console.log('✅ Authentication routes loaded successfully');
} catch (error) {
    console.warn('⚠️  Payment routes failed to load:', error.message);
    console.warn('⚠️  Server will run without payment functionality');
    
    // Fallback routes
    app.get('/api/payments/*', (req, res) => {
        res.status(503).json({ error: 'Payment service temporarily unavailable' });
    });
    app.get('/api/orders/*', (req, res) => {
        res.status(503).json({ error: 'Order service temporarily unavailable' });
    });
    app.get('/api/webhooks/*', (req, res) => {
        res.status(503).json({ error: 'Webhook service temporarily unavailable' });
    });
    app.get('/api/auth/*', (req, res) => {
        res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        frontend_path: path.join(__dirname, '../frontend'),
        static_files: {
            css: path.join(__dirname, '../frontend/css'),
            js: path.join(__dirname, '../frontend/js'),
            pages: path.join(__dirname, '../frontend/pages')
        }
    });
});

// Test endpoint to check if files are accessible
app.get('/api/test-files', (req, res) => {
    const fs = require('fs');
    const testResults = {
        frontend_exists: fs.existsSync(path.join(__dirname, '../frontend')),
        css_exists: fs.existsSync(path.join(__dirname, '../frontend/css')),
        js_exists: fs.existsSync(path.join(__dirname, '../frontend/js')),
        pages_exists: fs.existsSync(path.join(__dirname, '../frontend/pages')),
        index_exists: fs.existsSync(path.join(__dirname, '../frontend/pages/index.html')),
        styles_exists: fs.existsSync(path.join(__dirname, '../frontend/css/styles.css'))
    };
    res.json(testResults);
});

// Serve frontend pages
app.get('/', (req, res) => {
    console.log('Serving index.html from:', path.join(__dirname, '../frontend/pages/index.html'));
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/about.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/checkout.html'));
});

app.get('/payment-success', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/payment-success.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

// SEO Redirects
app.get('/index.html', (req, res) => {
    res.redirect(301, '/');
});

app.get('/home', (req, res) => {
    res.redirect(301, '/');
});

app.get('/products', (req, res) => {
    res.redirect(301, '/#products');
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, '../robots.txt'));
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, '../sitemap.xml'));
});

// Add compression for better performance (SEO factor)
app.use(compression());

// Set security and SEO headers
app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Cache control for static assets
    if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
    
    next();
});

// Catch-all handler: send back frontend's index.html file for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 KiFrames server running on port ${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '../frontend')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 