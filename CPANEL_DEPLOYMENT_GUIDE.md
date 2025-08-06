# TravelPro cPanel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Build the Application**
```bash
npm run build
```
This creates a `dist` folder with the production build.

### 2. **Upload to cPanel**

#### Option A: Using cPanel File Manager
1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to your domain's public_html folder**
4. **Upload all files from the `dist` folder** to public_html

#### Option B: Using FTP/SFTP
1. **Use an FTP client** (FileZilla, WinSCP, etc.)
2. **Connect to your server**
3. **Upload all files from the `dist` folder** to public_html

### 3. **Configure .htaccess for React Router**

Create a `.htaccess` file in your public_html folder with this content:

```apache
RewriteEngine On
RewriteBase /

# Handle React Router - redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### 4. **Test Your Deployment**

Visit your domain to test:
- `https://yourdomain.com/` (Dashboard)
- `https://yourdomain.com/Sales`
- `https://yourdomain.com/Invoicing`
- `https://yourdomain.com/TestMode`

## 🔧 Configuration Options

### **Production Mode (Real base44)**
The application is now configured for production with real base44 authentication:
- `DEV_MODE = false` in `src/api/base44Client.js`
- Real authentication required
- No mock data

### **Development Mode (For Testing)**
If you need to test without base44 authentication:
1. Change `DEV_MODE = true` in `src/api/base44Client.js`
2. Rebuild: `npm run build`
3. Re-upload the dist folder

## 📁 File Structure After Deployment

```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-Ca87sXRt.js
    └── index-Dnaf8JlV.css
```

## 🐛 Troubleshooting

### **Blank Page Issues**
1. **Check .htaccess file** - Make sure it's properly configured
2. **Check file permissions** - Set to 644 for files, 755 for folders
3. **Check browser console** - Look for JavaScript errors
4. **Check server logs** - Look for PHP/Apache errors

### **404 Errors on Navigation**
- Ensure `.htaccess` file is present and configured correctly
- Check that `mod_rewrite` is enabled on your server

### **Authentication Issues**
- Verify your base44 app ID is correct
- Check that your domain is whitelisted in base44
- Ensure HTTPS is properly configured

## 🔒 Security Considerations

### **HTTPS Setup**
1. **Enable SSL certificate** in cPanel
2. **Force HTTPS redirect** in .htaccess:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### **Environment Variables**
For production, consider setting environment variables:
- `VITE_BASE44_APP_ID` - Your base44 app ID
- `VITE_API_URL` - Your API endpoint

## 📊 Performance Optimization

### **Enable Compression**
Add to .htaccess:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### **Browser Caching**
The .htaccess file already includes caching for static assets.

## 🔄 Updates and Maintenance

### **Updating the Application**
1. **Make changes** to your local code
2. **Rebuild**: `npm run build`
3. **Upload new dist folder** to replace old files
4. **Clear browser cache** if needed

### **Backup Strategy**
- **Backup your dist folder** before updates
- **Keep a copy** of your .htaccess file
- **Document any custom configurations**

## 📞 Support

If you encounter issues:
1. **Check browser console** for JavaScript errors
2. **Check server error logs** in cPanel
3. **Verify file permissions** and .htaccess configuration
4. **Test with different browsers** to isolate issues

## ✅ Deployment Checklist

- [ ] Build completed successfully (`npm run build`)
- [ ] All files uploaded to public_html
- [ ] .htaccess file created and configured
- [ ] SSL certificate enabled (recommended)
- [ ] File permissions set correctly
- [ ] Application accessible via domain
- [ ] Navigation working (no 404 errors)
- [ ] Authentication working (if using base44)
- [ ] All features tested and working 