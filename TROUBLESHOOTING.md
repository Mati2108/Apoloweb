# KiFrames Troubleshooting Guide

## 🚨 "Everything is gone when I go live"

This usually happens when the server can't find the files due to path issues after reorganizing the project structure.

### Quick Fix Steps:

1. **Make sure you're in the right directory:**
   ```bash
   # You should be in the KiFrames root directory
   # You should see these folders: frontend/, backend/, assets/, docs/
   dir  # (Windows) or ls (Mac/Linux)
   ```

2. **Start the server using the batch file:**
   ```bash
   # Double-click start-dev.bat or run:
   start-dev.bat
   ```

3. **Check if the server is working:**
   - Open browser and go to: `http://localhost:3000`
   - Check health endpoint: `http://localhost:3000/api/health`
   - Check file test: `http://localhost:3000/api/test-files`

### Common Issues and Solutions:

#### Issue 1: "Cannot find module" errors
**Solution:** Install dependencies
```bash
cd backend
npm install
```

#### Issue 2: CSS/JS files not loading (blank page)
**Symptoms:** Page loads but no styling, JavaScript not working
**Solution:** Files are now served from absolute paths
- CSS files: `/css/styles.css` instead of `../css/styles.css`
- JS files: `/js/script.js` instead of `../js/script.js`

#### Issue 3: 404 errors for static files
**Solution:** Check if files exist in correct locations:
```
frontend/
├── css/
│   ├── styles.css
│   ├── about.css
│   ├── cart.css
│   └── checkout.css
├── js/
│   ├── script.js
│   ├── about.js
│   ├── cart.js
│   └── checkout.js
└── pages/
    ├── index.html
    ├── about.html
    ├── cart.html
    ├── checkout.html
    └── payment-success.html
```

#### Issue 4: Server won't start
**Check these:**
1. Are you in the KiFrames root directory?
2. Does `backend/server.js` exist?
3. Does `backend/package.json` exist?
4. Run: `cd backend && npm install`

#### Issue 5: Port already in use
**Error:** `EADDRINUSE: address already in use :::3000`
**Solution:**
1. Kill existing process: `taskkill /f /im node.exe` (Windows)
2. Or use different port: Change `PORT=3001` in `backend/config/.env`

### Diagnostic Commands:

1. **Check file structure:**
   ```bash
   tree /f  # Windows
   # or
   find . -type f -name "*.html" -o -name "*.css" -o -name "*.js"  # Mac/Linux
   ```

2. **Test server endpoints:**
   - Health check: `curl http://localhost:3000/api/health`
   - File test: `curl http://localhost:3000/api/test-files`

3. **Check if files are accessible:**
   - CSS: `http://localhost:3000/css/styles.css`
   - JS: `http://localhost:3000/js/script.js`
   - Pages: `http://localhost:3000/pages/index.html`

### Manual Server Start (if batch file fails):

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start server
npm start
```

### Browser Console Errors:

If you see errors in browser console (F12):
- **404 errors for CSS/JS:** Files not found - check paths
- **CORS errors:** Server not running or wrong port
- **JavaScript errors:** Check if JS files are loading

### Still Having Issues?

1. **Reset to working state:**
   ```bash
   # Stop server (Ctrl+C)
   cd backend
   rm -rf node_modules  # Delete node_modules
   npm install          # Reinstall dependencies
   npm start           # Start server
   ```

2. **Check browser network tab (F12 → Network):**
   - Look for failed requests (red entries)
   - Check if CSS/JS files are loading with 200 status

3. **Verify file paths in HTML:**
   - All CSS links should start with `/css/`
   - All JS scripts should start with `/js/`
   - All page links should be just the filename (e.g., `about.html`)

### Success Indicators:

✅ Server starts without errors
✅ `http://localhost:3000` shows the homepage with styling
✅ Navigation works between pages
✅ Browser console shows no 404 errors
✅ `/api/health` returns JSON with status "OK"
✅ `/api/test-files` shows all files as `true`

### Emergency Backup Plan:

If nothing works, you can temporarily move all files back to the root:
```bash
# Move files back to root (temporary fix)
move frontend\pages\*.html .
move frontend\css\*.css .
move frontend\js\*.js .
```

Then update HTML files to use original paths (`styles.css` instead of `/css/styles.css`). 