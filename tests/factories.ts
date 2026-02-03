/**
 * Mock data factories for frontend tests
 */

export const createMockVendor = (overrides: any = {}) => ({
  id: 1,
  name: 'Test Vendor',
  email: 'vendor@test.com',
  phone: '1234567890',
  companyName: 'Test Company',
  status: 'active',
  ...overrides,
});

export const createMockRequisition = (overrides: any = {}) => ({
  id: 1,
  rfqId: 'RFQ001',
  subject: 'Test Requisition',
  projectId: 1,
  deliveryDate: '2026-03-15',
  maxDeliveryDate: '2026-03-20',
  negotiationClosureDate: '2026-02-28',
  typeOfCurrency: 'USD',
  totalPrice: 1000,
  status: 'Created',
  ...overrides,
});

export const createMockProduct = (overrides: any = {}) => ({
  id: '1',
  name: 'Test Product',
  quantity: 100,
  unitPrice: 50,
  category: 'Electronics',
  description: 'Test product description',
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'user@test.com',
  phone: '9876543210',
  userType: 'admin',
  ...overrides,
});

export const createMockProject = (overrides: any = {}) => ({
  id: 1,
  projectName: 'Test Project',
  status: 'active',
  ...overrides,
});

export const createMockSmartDefaults = (overrides: any = {}) => ({
  priceQuantity: {
    targetUnitPrice: 50,
    maxAcceptablePrice: 60,
    volumeDiscountExpectation: 5,
  },
  paymentTerms: {
    minDays: 30,
    maxDays: 60,
    advancePaymentLimit: 20,
  },
  delivery: {
    typicalDeliveryDays: 14,
    maxDeliveryDate: '2026-03-20',
    negotiationClosureDate: '2026-02-28',
  },
  source: 'vendor_history' as const,
  confidence: 0.8,
  ...overrides,
});
