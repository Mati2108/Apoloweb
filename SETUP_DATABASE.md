# 💾 KiFrames Database Setup Guide

## Current Status
Your KiFrames application is currently using **in-memory storage**, which means:
- ✅ No database setup required
- ❌ All data is lost when the server restarts
- ✅ Perfect for testing and development

## How to Check Your Database Status

Run this command to check your current database setup:
```bash
node check-database.js
```

## Database Options

### 1. 📦 In-Memory Storage (Current)
**What it is:** Data is stored in your server's memory while it's running.

**Pros:**
- No setup required
- Fast performance
- Great for development and testing

**Cons:**
- Data disappears when server restarts
- Limited by available RAM
- Not suitable for production

**When to use:** Development, testing, demos

---

### 2. 🍃 MongoDB (Recommended for Production)

**What it is:** A popular NoSQL database that stores data permanently.

#### Installation Options:

**Option A: Download and Install**
1. Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Run the installer and follow the setup wizard
4. MongoDB will install as a Windows service

**Option B: Using Package Managers**
```bash
# Using Chocolatey
choco install mongodb

# Using Winget
winget install MongoDB.Server
```

#### Setup Steps:
1. **Install MongoDB** (using one of the options above)

2. **Start MongoDB Service:**
   ```bash
   net start MongoDB
   ```

3. **Update your .env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/kiframes
   ```

4. **Restart your KiFrames server:**
   ```bash
   cd backend
   npm start
   ```

#### Verify MongoDB is Working:
```bash
# Check if MongoDB is running
sc query MongoDB

# Test connection
mongo --eval "db.runCommand({connectionStatus: 1})"
```

---

### 3. 🗄️ SQLite (Simple File Database)
**What it is:** A lightweight database that stores data in a single file.

**Status:** Not implemented yet, but can be added if needed.

**Pros:**
- No server required
- Single file storage
- Good for small to medium applications

**Cons:**
- Limited concurrent access
- Not as scalable as MongoDB

---

## Quick Setup Commands

### For Development (Current Setup):
```bash
# Just start the server - no database needed
cd backend
npm start
```

### For Production with MongoDB:
```bash
# 1. Install MongoDB (choose one):
choco install mongodb
# OR
winget install MongoDB.Server

# 2. Start MongoDB
net start MongoDB

# 3. Add to your .env file:
echo "MONGODB_URI=mongodb://localhost:27017/kiframes" >> backend/config/.env

# 4. Start KiFrames
cd backend
npm start
```

## Troubleshooting

### MongoDB Won't Start
```bash
# Check if MongoDB service exists
sc query MongoDB

# If not installed, install it first
# If installed but not running:
net start MongoDB

# If that fails, try manual start:
mongod --dbpath C:\data\db
```

### Can't Connect to MongoDB
1. Make sure MongoDB service is running
2. Check if port 27017 is available: `netstat -an | findstr :27017`
3. Verify your .env file has the correct MONGODB_URI

### Server Shows "Using in-memory storage"
This means:
- MongoDB is not connected (which is fine for development)
- Your data will be temporary
- To use persistent storage, set up MongoDB as described above

## What Data is Stored?

Your KiFrames application stores:
- **Orders:** Customer purchase information
- **Payments:** Payment transaction details
- **User sessions:** Temporary user data

### With In-Memory Storage:
- Data exists only while server is running
- Perfect for testing payment flows
- No permanent records

### With MongoDB:
- All data is permanently stored
- Order history is maintained
- Payment records are kept for accounting
- Better for production use

## Recommendations

**For Development/Testing:**
- Keep using in-memory storage
- It's perfect for testing payment integrations
- No setup required

**For Production:**
- Install and use MongoDB
- Set up regular backups
- Monitor database performance

**For Small Projects:**
- In-memory storage is fine if you don't need to keep records
- MongoDB if you want to track orders and payments

## Need Help?

Run the database checker anytime:
```bash
node check-database.js
```

This will show you:
- Current database status
- What's installed
- What's running
- Configuration issues 