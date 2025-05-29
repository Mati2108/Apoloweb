const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve CSS files with proper MIME type
app.use('/css', express.static(path.join(__dirname, '../frontend/css'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve JS files with proper MIME type
app.use('/js', express.static(path.join(__dirname, '../frontend/js'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Serve pages
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));

// Serve assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Additional static file routes for better compatibility
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: 'development',
        message: 'Simple server running - payment features disabled'
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
        styles_exists: fs.existsSync(path.join(__dirname, '../frontend/css/styles.css')),
        script_exists: fs.existsSync(path.join(__dirname, '../frontend/js/script.js')),
        css_path: path.join(__dirname, '../frontend/css/styles.css'),
        js_path: path.join(__dirname, '../frontend/js/script.js')
    };
    res.json(testResults);
});

// Debug route to serve CSS directly
app.get('/debug/css', (req, res) => {
    const cssPath = path.join(__dirname, '../frontend/css/styles.css');
    console.log('Debug CSS path:', cssPath);
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(cssPath);
});

// Serve root index (redirect page) or frontend index
app.get('/', (req, res) => {
    const fs = require('fs');
    const rootIndexPath = path.join(__dirname, '../index.html');
    const frontendIndexPath = path.join(__dirname, '../frontend/pages/index.html');
    
    // Check if root index.html exists, serve it first (for redirect)
    if (fs.existsSync(rootIndexPath)) {
        console.log('Serving root index.html (redirect page)');
        res.sendFile(rootIndexPath);
    } else {
        console.log('Serving frontend index.html directly');
        res.sendFile(frontendIndexPath);
    }
});

// Direct route to frontend index (for redirect)
app.get('/frontend/pages/index.html', (req, res) => {
    console.log('Serving frontend index.html via direct route');
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

// Catch-all handler: send back frontend's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 KiFrames simple server running on port ${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '../frontend')}`);
    console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`⚠️  Payment features are disabled in this simple server`);
});

module.exports = app; 