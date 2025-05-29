#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 KiFrames Database Checker');
console.log('============================\n');

// Check if MongoDB is installed
function checkMongoDB() {
    return new Promise((resolve) => {
        exec('mongod --version', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ MongoDB is NOT installed');
                console.log('   To install MongoDB:');
                console.log('   1. Download from: https://www.mongodb.com/try/download/community');
                console.log('   2. Or use chocolatey: choco install mongodb');
                console.log('   3. Or use winget: winget install MongoDB.Server\n');
                resolve(false);
            } else {
                console.log('✅ MongoDB is installed');
                console.log(`   Version: ${stdout.trim()}\n`);
                resolve(true);
            }
        });
    });
}

// Check if MongoDB service is running
function checkMongoDBService() {
    return new Promise((resolve) => {
        exec('sc query MongoDB', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ MongoDB service is NOT running');
                console.log('   To start MongoDB:');
                console.log('   1. Run: net start MongoDB');
                console.log('   2. Or manually: mongod --dbpath C:\\data\\db\n');
                resolve(false);
            } else {
                if (stdout.includes('RUNNING')) {
                    console.log('✅ MongoDB service is RUNNING\n');
                    resolve(true);
                } else {
                    console.log('⚠️  MongoDB service is installed but NOT running');
                    console.log('   To start: net start MongoDB\n');
                    resolve(false);
                }
            }
        });
    });
}

// Check MongoDB connection
function checkMongoDBConnection() {
    return new Promise((resolve) => {
        exec('mongo --eval "db.runCommand({connectionStatus: 1})"', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Cannot connect to MongoDB');
                console.log('   Make sure MongoDB is running on localhost:27017\n');
                resolve(false);
            } else {
                console.log('✅ MongoDB connection successful\n');
                resolve(true);
            }
        });
    });
}

// Check environment configuration
function checkEnvironmentConfig() {
    console.log('📋 Environment Configuration Check:');
    console.log('===================================');
    
    const envPath = path.join(__dirname, 'backend', 'config', '.env');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found');
        console.log(`   Expected location: ${envPath}\n`);
        return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env file found');
    
    // Check for database configuration
    if (envContent.includes('MONGODB_URI')) {
        console.log('✅ MongoDB URI configured in .env');
    } else {
        console.log('⚠️  MongoDB URI not configured in .env');
        console.log('   Add: MONGODB_URI=mongodb://localhost:27017/kiframes');
    }
    
    // Check payment configurations
    const paymentConfigs = [
        { key: 'STRIPE_SECRET_KEY', name: 'Stripe' },
        { key: 'PAYPAL_CLIENT_ID', name: 'PayPal' },
        { key: 'MERCADOPAGO_ACCESS_TOKEN', name: 'Mercado Pago' }
    ];
    
    console.log('\n💳 Payment Provider Configuration:');
    paymentConfigs.forEach(config => {
        if (envContent.includes(config.key) && !envContent.includes(`${config.key}=`)) {
            console.log(`✅ ${config.name} configured`);
        } else {
            console.log(`⚠️  ${config.name} not configured (optional)`);
        }
    });
    
    console.log('');
    return true;
}

// Check what database options are available
function showDatabaseOptions() {
    console.log('💾 Database Options for KiFrames:');
    console.log('=================================');
    console.log('1. 📦 In-Memory Storage (Current Default)');
    console.log('   ✅ No setup required');
    console.log('   ❌ Data lost when server restarts');
    console.log('   ✅ Good for testing and development\n');
    
    console.log('2. 🍃 MongoDB (Recommended)');
    console.log('   ✅ Persistent data storage');
    console.log('   ✅ Scalable and flexible');
    console.log('   ✅ Great for production');
    console.log('   ❌ Requires installation and setup\n');
    
    console.log('3. 🗄️  SQLite (Alternative)');
    console.log('   ✅ File-based database');
    console.log('   ✅ No server required');
    console.log('   ✅ Good for small to medium apps');
    console.log('   ❌ Not implemented yet (can be added)\n');
}

// Main function
async function main() {
    // Check environment configuration
    checkEnvironmentConfig();
    
    // Show database options
    showDatabaseOptions();
    
    // Check MongoDB
    console.log('🔍 MongoDB Status Check:');
    console.log('========================');
    
    const mongoInstalled = await checkMongoDB();
    
    if (mongoInstalled) {
        const mongoRunning = await checkMongoDBService();
        
        if (mongoRunning) {
            await checkMongoDBConnection();
        }
    }
    
    // Show current status
    console.log('📊 Current KiFrames Database Status:');
    console.log('====================================');
    
    if (mongoInstalled) {
        console.log('✅ Your KiFrames app can use MongoDB for persistent storage');
        console.log('   Just make sure MongoDB is running and update your .env file');
    } else {
        console.log('⚠️  Your KiFrames app is using in-memory storage');
        console.log('   Data will be lost when the server restarts');
        console.log('   Consider installing MongoDB for persistent storage');
    }
    
    console.log('\n🚀 To start your KiFrames server:');
    console.log('   cd backend && npm start');
    console.log('   or');
    console.log('   Double-click start-kiframes.bat\n');
    
    console.log('🌐 Once running, visit: http://localhost:3000');
}

// Run the checker
main().catch(console.error); 