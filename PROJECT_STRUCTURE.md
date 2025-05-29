# KiFrames Project Structure

This document outlines the organized folder structure of the KiFrames project, making it easier to navigate, maintain, and scale.

## 📁 Project Overview

```
KiFrames/
├── 📁 frontend/           # Frontend application files
│   ├── 📁 css/           # Stylesheets
│   ├── 📁 js/            # JavaScript files
│   └── 📁 pages/         # HTML pages
├── 📁 backend/           # Backend server files
│   ├── 📁 routes/        # API route handlers
│   └── 📁 config/        # Configuration files
├── 📁 assets/            # Static assets
│   ├── 📁 images/        # Image files
│   └── 📁 icons/         # Icon files
├── 📁 docs/              # Documentation
└── PROJECT_STRUCTURE.md  # This file
```

## 🎨 Frontend Structure

### `/frontend/pages/`
Contains all HTML pages of the application:
- `index.html` - Main landing page with hero section and products
- `about.html` - Company information and team details
- `cart.html` - Shopping cart interface
- `checkout.html` - Payment and checkout process
- `payment-success.html` - Order confirmation page

### `/frontend/css/`
Contains all stylesheet files:
- `styles.css` - Main stylesheet with global styles, hero section, products, footer
- `about.css` - Specific styles for the About page
- `cart.css` - Shopping cart page styles
- `checkout.css` - Checkout process styles

### `/frontend/js/`
Contains all JavaScript files:
- `script.js` - Main JavaScript for homepage functionality
- `about.js` - About page animations and interactions
- `cart.js` - Shopping cart functionality
- `checkout.js` - Payment processing and checkout logic

## 🔧 Backend Structure

### `/backend/`
Main backend directory containing:
- `server.js` - Express server setup and configuration
- `package.json` - Node.js dependencies and scripts

### `/backend/routes/`
API route handlers:
- `payments.js` - Payment processing endpoints (Stripe, PayPal, Mercado Pago)
- `orders.js` - Order management CRUD operations
- `webhooks.js` - Payment gateway webhook handlers

### `/backend/config/`
Configuration files:
- `env.example` - Environment variables template

## 🎯 Assets Structure

### `/assets/images/`
Image files for the application:
- Product images
- Hero section backgrounds
- Team member photos
- Marketing materials

### `/assets/icons/`
Icon files:
- Logo variations
- UI icons
- Social media icons

## 📚 Documentation

### `/docs/`
Project documentation:
- `README.md` - Main project documentation
- API documentation
- Setup guides
- Deployment instructions

## 🚀 Getting Started

### Development Setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp config/env.example config/.env
   # Configure your environment variables
   npm start
   ```

2. **Frontend Development:**
   - The backend serves static files from the `frontend/` directory
   - Access the application at `http://localhost:3000`

### File Path References

Due to the organized structure, file paths in HTML files use relative paths:

**CSS References:**
```html
<link rel="stylesheet" href="../css/styles.css">
<link rel="stylesheet" href="../css/about.css">
```

**JavaScript References:**
```html
<script src="../js/script.js"></script>
<script src="../js/about.js"></script>
```

**Navigation Links:**
```html
<a href="index.html">Home</a>
<a href="about.html">About</a>
<a href="cart.html">Cart</a>
```

## 🔄 Server Configuration

The Express server (`backend/server.js`) is configured to:
- Serve static files from the `frontend/` directory
- Handle API routes under `/api/` prefix
- Serve HTML pages at clean URLs:
  - `/` → `frontend/pages/index.html`
  - `/about` → `frontend/pages/about.html`
  - `/cart` → `frontend/pages/cart.html`
  - `/checkout` → `frontend/pages/checkout.html`
  - `/payment-success` → `frontend/pages/payment-success.html`

## 📦 Dependencies

### Backend Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables
- `stripe` - Stripe payment processing
- `paypal-rest-sdk` - PayPal integration
- `mercadopago` - Mercado Pago integration

### Frontend Dependencies
- No build process required
- Uses vanilla JavaScript and CSS
- External libraries loaded via CDN:
  - Stripe.js
  - PayPal SDK
  - Mercado Pago SDK

## 🛠 Maintenance

### Adding New Pages
1. Create HTML file in `frontend/pages/`
2. Add corresponding CSS in `frontend/css/`
3. Add JavaScript in `frontend/js/`
4. Update server routes in `backend/server.js`
5. Update navigation in existing pages

### Adding New API Endpoints
1. Create route file in `backend/routes/`
2. Import and use in `backend/server.js`
3. Update frontend JavaScript to call new endpoints

### Asset Management
- Add images to `assets/images/`
- Add icons to `assets/icons/`
- Reference using relative paths from frontend files

## 🔐 Security Considerations

- Environment variables stored in `backend/config/.env`
- API keys and secrets not committed to repository
- Rate limiting applied to API endpoints
- CORS configured for security
- Helmet middleware for additional security headers

## 📈 Scalability

This structure supports:
- Easy addition of new pages and features
- Separation of concerns between frontend and backend
- Modular API development
- Asset organization and management
- Documentation and maintenance

## 🚀 Deployment

### Production Deployment
1. Set up environment variables
2. Install backend dependencies
3. Configure reverse proxy (nginx) to serve static files
4. Set up SSL certificates
5. Configure payment gateway webhooks
6. Set up monitoring and logging

### Development vs Production
- Development: Backend serves static files
- Production: Use nginx or CDN for static file serving
- Environment-specific configuration via `.env` files 