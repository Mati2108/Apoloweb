// SEO Configuration for KiFrames
module.exports = {
    // Default meta tags
    defaultMeta: {
        title: 'KiFrames - AI-Powered Media Organization Software',
        description: 'Organize your video footage and audio samples with AI-powered tagging, smart sorting, and intelligent search. Save hours with KiFrames Media Manager.',
        keywords: 'video organizer, media management software, AI video tagging, sample manager, audio organization',
        author: 'KiFrames',
        robots: 'index, follow',
        language: 'en'
    },
    
    // Page-specific meta tags
    pages: {
        '/': {
            title: 'KiFrames - AI-Powered Media Organization Software | Video & Audio Management',
            description: 'Organize your video footage and audio samples with AI-powered tagging, smart sorting, and intelligent search. Save hours with KiFrames Media Manager. Try free today!',
            keywords: 'video organizer, media management software, AI video tagging, sample manager, audio organization, video editing tools'
        },
        '/about': {
            title: 'About KiFrames - Our Story & Mission | AI Video Editing Revolution',
            description: 'Learn about KiFrames\' mission to revolutionize video editing with AI. Meet our team, discover our values, and see how we\'re making content creation accessible to everyone.',
            keywords: 'about kiframes, video editing company, AI technology, content creation tools'
        },
        '/products/media-manager': {
            title: 'KiFrames Media Manager - Smart Video Organization Software',
            description: 'Intelligent video management system with AI-powered tagging, automatic organization, and advanced search. Manage thousands of videos effortlessly.',
            keywords: 'video manager, media organizer, video tagging software, footage organization'
        },
        '/products/sample-manager': {
            title: 'KiFrames Sample Manager - AI Audio Sample Organization',
            description: 'Organize your audio samples with AI-powered BPM detection, key analysis, and automatic tagging. Perfect for music producers and sound designers.',
            keywords: 'sample manager, audio organizer, BPM detection, sample library software'
        },
        '/dashboard': {
            title: 'Dashboard - KiFrames Account Management',
            description: 'Manage your KiFrames licenses, view purchase history, and access your account settings.',
            robots: 'noindex, nofollow' // Don't index user dashboard
        },
        '/checkout': {
            title: 'Checkout - Complete Your KiFrames Purchase',
            description: 'Secure checkout for KiFrames products. Multiple payment options available.',
            robots: 'noindex, nofollow' // Don't index checkout pages
        }
    },
    
    // Open Graph defaults
    openGraph: {
        type: 'website',
        site_name: 'KiFrames',
        locale: 'en_US',
        image: 'https://kiframes.com/assets/images/og-image.jpg',
        imageWidth: 1200,
        imageHeight: 630
    },
    
    // Twitter Card defaults
    twitter: {
        card: 'summary_large_image',
        site: '@kiframes',
        creator: '@kiframes'
    },
    
    // Structured data templates
    structuredData: {
        organization: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'KiFrames',
            url: 'https://kiframes.com',
            logo: 'https://kiframes.com/assets/images/logo.png',
            sameAs: [
                'https://twitter.com/kiframes',
                'https://youtube.com/kiframes',
                'https://discord.gg/kiframes'
            ],
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-123-4567',
                contactType: 'customer support',
                email: 'support@kiframes.com',
                availableLanguage: ['English']
            }
        },
        
        softwareApplication: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'KiFrames',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: ['Windows', 'macOS'],
            offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD'
            },
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '324'
            }
        }
    },
    
    // Sitemap configuration
    sitemap: {
        hostname: 'https://kiframes.com',
        cacheTime: 600000, // 10 minutes
        urls: [
            { url: '/', changefreq: 'weekly', priority: 1.0 },
            { url: '/about', changefreq: 'monthly', priority: 0.8 },
            { url: '/products/media-manager', changefreq: 'weekly', priority: 0.9 },
            { url: '/products/sample-manager', changefreq: 'weekly', priority: 0.9 },
            { url: '/help', changefreq: 'monthly', priority: 0.6 },
            { url: '/documentation', changefreq: 'weekly', priority: 0.7 },
            { url: '/tutorials', changefreq: 'weekly', priority: 0.7 },
            { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
            { url: '/terms', changefreq: 'yearly', priority: 0.3 },
            { url: '/contact', changefreq: 'monthly', priority: 0.5 }
        ]
    },
    
    // Redirect rules for SEO
    redirects: [
        { from: '/products', to: '/#products', status: 301 },
        { from: '/index.html', to: '/', status: 301 },
        { from: '/home', to: '/', status: 301 }
    ],
    
    // Headers for SEO and security
    headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com"
    }
}; 