# TravelPro Test Mode

This document explains how to test the TravelPro system without requiring base44 authentication.

## 🚀 Quick Start

### 1. Enable Development Mode

Open `src/api/base44Client.js` and set:
```javascript
const DEV_MODE = true; // Change to false for production
```

### 2. Access Test Mode

Navigate to: `http://localhost:5173/TestMode`

## 🔧 How It Works

### Development Mode Features

When `DEV_MODE = true`:

- ✅ **No Authentication Required**: Bypasses base44 login
- ✅ **Mock Data**: All API calls return realistic test data
- ✅ **Console Logging**: All operations are logged to browser console
- ✅ **Full Functionality**: All features work with mock data
- ✅ **Visual Indicator**: Yellow banner shows "Development Mode Active"

### Mock Data Structure

The system provides realistic mock data for:

- **User**: Test user with agency_admin role
- **Agency**: Test travel agency with IATA number
- **Clients**: Sample client records
- **Bookings**: Sample booking data
- **Invoices**: Sample invoice records
- **All Other Entities**: Complete mock data for all system entities

## 🧪 Testing Different Modules

### 1. Dashboard
- Navigate to `/Dashboard`
- View mock statistics and charts
- Test navigation and layout

### 2. Sales Module
- Navigate to `/Sales`
- Test booking creation, editing, deletion
- Test lead management
- Test estimate creation

### 3. Invoicing Module
- Navigate to `/Invoicing`
- Test invoice creation and editing
- Test payment recording
- Test email functionality

### 4. GDS Management
- Navigate to `/GDSManagement`
- Test Google Drive integration
- Test file processing
- Test PNR parsing

### 5. Client CRM
- Navigate to `/ClientCRM`
- Test client management
- Test communication features
- Test client profiles

### 6. Financial Management
- Navigate to `/FinancialManagement`
- Test transaction tracking
- Test expense management
- Test financial reports

### 7. Service Rules
- Navigate to `/ServiceRules`
- Test rule creation and management
- Test rule applications
- Test audit trails

## 📊 Test Results

### Console Logging

All operations are logged to the browser console with the format:
```
[DEV MODE] Creating Client: {name: "Test Client", email: "test@example.com"}
[DEV MODE] Updating Booking mock-booking-1: {amount: 2000}
[DEV MODE] Deleting Invoice mock-invoice-1
```

### Test Mode Page

The `/TestMode` page provides:
- ✅ Current user and agency information
- ✅ Test controls for different operations
- ✅ Real-time test results
- ✅ Quick navigation to different modules

## 🔄 Switching Between Modes

### Development Mode (Testing)
```javascript
// src/api/base44Client.js
const DEV_MODE = true;
```

### Production Mode (Real base44)
```javascript
// src/api/base44Client.js
const DEV_MODE = false;
```

## 🎯 Testing Scenarios

### 1. New User Onboarding
1. Navigate to `/Home`
2. Click "Get Started for Free"
3. Test agency setup process
4. Verify user creation and agency assignment

### 2. Sales Workflow
1. Navigate to `/Sales`
2. Create a new lead
3. Convert lead to booking
4. Create estimate
5. Generate invoice
6. Record payment

### 3. GDS Integration
1. Navigate to `/GDSManagement`
2. Test Google Drive setup
3. Upload test files
4. Process PNR data
5. Verify ticket creation

### 4. Financial Operations
1. Navigate to `/FinancialManagement`
2. Create transactions
3. Record expenses
4. Generate reports
5. Test reconciliation

## 🐛 Troubleshooting

### Common Issues

1. **Page Not Loading**
   - Check if DEV_MODE is set to true
   - Clear browser cache
   - Check browser console for errors

2. **Mock Data Not Appearing**
   - Refresh the page
   - Check console for [DEV MODE] logs
   - Verify entity imports in `src/api/entities.js`

3. **Navigation Issues**
   - Check routing configuration in `src/pages/index.jsx`
   - Verify `createPageUrl` function in `src/utils/index.ts`

### Debug Mode

Enable additional logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 📝 Notes

- **Data Persistence**: Mock data is not persisted between sessions
- **Real API Calls**: No actual base44 API calls are made in dev mode
- **Performance**: Faster loading due to no network requests
- **Security**: No sensitive data is exposed in mock mode

## 🚀 Production Deployment

Before deploying to production:

1. Set `DEV_MODE = false` in `src/api/base44Client.js`
2. Remove or comment out the TestMode route
3. Ensure proper base44 authentication is configured
4. Test with real base44 credentials

## 📞 Support

For issues with test mode:
1. Check browser console for error messages
2. Verify DEV_MODE setting
3. Review mock data structure in `src/api/entities.js`
4. Test individual components for specific issues 