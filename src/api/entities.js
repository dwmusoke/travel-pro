import { base44 } from './base44Client';
import { DEV_MODE } from './base44Client';

// Mock data for development mode
const mockUser = {
  id: 'mock-user-1',
  email: 'test@travelpro.com',
  name: 'Test User',
  full_name: 'Test User',
  app_role: 'agency_admin',
  agency_id: 'mock-agency-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockAgency = {
  id: 'mock-agency-1',
  name: 'Test Travel Agency',
  iata_number: '12345678',
  address: '123 Test Street, Test City, TC 12345',
  phone: '+1-555-0123',
  email: 'info@testagency.com',
  website: 'https://testagency.com',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock entities for development mode
const createMockEntity = (entityName, mockData) => {
  if (!DEV_MODE) {
    return base44.entities[entityName];
  }
  
  return {
    create: async (data) => {
      console.log(`[DEV MODE] Creating ${entityName}:`, data);
      return { id: `mock-${entityName.toLowerCase()}-${Date.now()}`, ...data, created_at: new Date().toISOString() };
    },
    update: async (id, data) => {
      console.log(`[DEV MODE] Updating ${entityName} ${id}:`, data);
      return { id, ...data, updated_at: new Date().toISOString() };
    },
    delete: async (id) => {
      console.log(`[DEV MODE] Deleting ${entityName} ${id}`);
      return { success: true };
    },
    list: async (filters = {}) => {
      console.log(`[DEV MODE] Listing ${entityName} with filters:`, filters);
      return { data: [mockData], total: 1 };
    },
    get: async (id) => {
      console.log(`[DEV MODE] Getting ${entityName} ${id}`);
      return mockData;
    }
  };
};

// Mock auth for development mode
const createMockAuth = () => {
  if (!DEV_MODE) {
    return base44.auth;
  }
  
  return {
    me: async () => {
      console.log('[DEV MODE] Getting current user');
      return mockUser;
    },
    loginWithRedirect: async (redirectUrl) => {
      console.log('[DEV MODE] Login redirect to:', redirectUrl);
      // Simulate successful login
      localStorage.setItem('dev_mode_user', JSON.stringify(mockUser));
      window.location.href = redirectUrl;
    },
    logout: async () => {
      console.log('[DEV MODE] Logging out');
      localStorage.removeItem('dev_mode_user');
    }
  };
};

export const Agency = createMockEntity('Agency', mockAgency);
export const GDSTicket = createMockEntity('GDSTicket', { id: 'mock-ticket-1', pnr: 'ABC123', status: 'confirmed' });
export const Invoice = createMockEntity('Invoice', { id: 'mock-invoice-1', amount: 1500, status: 'pending' });
export const Client = createMockEntity('Client', { id: 'mock-client-1', name: 'John Doe', email: 'john@example.com' });
export const Workflow = createMockEntity('Workflow', { id: 'mock-workflow-1', name: 'Test Workflow', status: 'active' });
export const GoogleDriveIntegration = createMockEntity('GoogleDriveIntegration', { id: 'mock-gdrive-1', status: 'connected' });
export const SyncedFile = createMockEntity('SyncedFile', { id: 'mock-file-1', filename: 'test.pdf', status: 'synced' });
export const Lead = createMockEntity('Lead', { id: 'mock-lead-1', name: 'Jane Smith', status: 'new' });
export const Booking = createMockEntity('Booking', { id: 'mock-booking-1', client_name: 'Test Client', amount: 2000 });
export const Estimate = createMockEntity('Estimate', { id: 'mock-estimate-1', client_name: 'Test Client', amount: 1800 });
export const RecurringBilling = createMockEntity('RecurringBilling', { id: 'mock-billing-1', frequency: 'monthly', amount: 500 });
export const Payment = createMockEntity('Payment', { id: 'mock-payment-1', amount: 1000, method: 'credit_card' });
export const BSPReport = createMockEntity('BSPReport', { id: 'mock-bsp-1', period: '2024-01', status: 'processed' });
export const BSPReconciliation = createMockEntity('BSPReconciliation', { id: 'mock-recon-1', status: 'completed' });
export const Transaction = createMockEntity('Transaction', { id: 'mock-transaction-1', type: 'credit', amount: 1500 });
export const Bill = createMockEntity('Bill', { id: 'mock-bill-1', vendor: 'Test Vendor', amount: 800 });
export const Vendor = createMockEntity('Vendor', { id: 'mock-vendor-1', name: 'Test Vendor', contact: 'vendor@test.com' });
export const ServiceRule = createMockEntity('ServiceRule', { id: 'mock-rule-1', name: 'Test Rule', status: 'active' });
export const RuleApplication = createMockEntity('RuleApplication', { id: 'mock-application-1', rule_id: 'mock-rule-1' });
export const PlatformSettings = createMockEntity('PlatformSettings', { id: 'mock-settings-1', theme: 'light' });
export const TravelService = createMockEntity('TravelService', { id: 'mock-service-1', name: 'Flight Booking', price: 100 });

// Auth SDK
export const User = createMockAuth();