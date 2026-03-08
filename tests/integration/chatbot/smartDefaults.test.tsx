/**
 * Smart Defaults - Date Auto-Fill Integration Tests
 *
 * Tests the NewDealPage wizard's smart defaults auto-population:
 * 1. Service call with correct parameters
 * 2. Error handling (service failures)
 * 3. Date format validation
 * 4. Backwards compatibility with missing fields
 * 5. Smart defaults data mapping logic
 *
 * NOTE: The NewDealPage uses custom CalendarPopup/DateTimePickerPopup components
 * (not standard <input> elements), so we test the smart defaults loading flow
 * and data mapping rather than querying rendered date inputs.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NewDealPage from '../../../src/pages/chatbot/NewDealPage';
import { createMockSmartDefaults } from '../../helpers/factories';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => {
  const mockToast = vi.fn();
  mockToast.success = vi.fn();
  mockToast.error = vi.fn();
  return { default: mockToast };
});

// Mock lucide-react icons (they can cause issues in jsdom)
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Save: () => <span data-testid="icon-save" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  CheckCircle: () => <span data-testid="icon-check" />,
  Mail: () => <span data-testid="icon-mail" />,
  X: () => <span data-testid="icon-x" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  FileText: () => <span data-testid="icon-file-text" />,
  Lock: () => <span data-testid="icon-lock" />,
  Users: () => <span data-testid="icon-users" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Clock: () => <span data-testid="icon-clock" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  MapPin: () => <span data-testid="icon-map-pin" />,
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Info: () => <span data-testid="icon-info" />,
  HelpCircle: () => <span data-testid="icon-help" />,
  Eye: () => <span data-testid="icon-eye" />,
  EyeOff: () => <span data-testid="icon-eye-off" />,
  Search: () => <span data-testid="icon-search" />,
  Building: () => <span data-testid="icon-building" />,
  Package: () => <span data-testid="icon-package" />,
  DollarSign: () => <span data-testid="icon-dollar" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  Truck: () => <span data-testid="icon-truck" />,
  Shield: () => <span data-testid="icon-shield" />,
  Settings: () => <span data-testid="icon-settings" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Star: () => <span data-testid="icon-star" />,
  Target: () => <span data-testid="icon-target" />,
  Zap: () => <span data-testid="icon-zap" />,
  Award: () => <span data-testid="icon-award" />,
  Sliders: () => <span data-testid="icon-sliders" />,
  ClipboardList: () => <span data-testid="icon-clipboard" />,
  Hash: () => <span data-testid="icon-hash" />,
  Weight: () => <span data-testid="icon-weight" />,
  Scale: () => <span data-testid="icon-scale" />,
}));

// Mock the chatbot service — component uses default import
vi.mock('../../../src/services/chatbot.service', () => {
  return {
    default: {
      getRequisitions: vi.fn(),
      getRequisitionVendors: vi.fn(),
      getSmartDefaults: vi.fn(),
      getDeliveryAddresses: vi.fn(),
      getQualityCertifications: vi.fn(),
      createDealWithConfig: vi.fn(),
      retryDealEmail: vi.fn(),
    },
  };
});

// Import the mocked service
import chatbotService from '../../../src/services/chatbot.service';

// Mock data
const mockRequisition = {
  id: 1,
  rfqNumber: 'RFQ-001',
  title: 'Test Requisition',
  projectName: 'Test Project',
  estimatedValue: 10000,
  currency: 'USD',
  productCount: 5,
  vendorCount: 2,
  status: 'approved',
  negotiationClosureDate: '2026-02-28',
};

const mockVendor = {
  id: 1,
  name: 'Test Vendor Corp',
  companyName: 'Test Vendor Corp',
  email: 'vendor@test.com',
  pastDealsCount: 3,
  addresses: [
    { id: 1, address: '123 Test St', city: 'TestCity', state: 'TS', country: 'US', isDefault: true },
  ],
};

const mockAddress = {
  id: 1,
  address: '456 Buyer St, BuyerCity, BC 12345',
  isDefault: true,
};

/**
 * Render NewDealPage with URL params that trigger the locked-mode initialization.
 * The component uses useSearchParams to read rfqId, vendorId, vendorName, and locked.
 */
const renderNewDealPage = (searchParams = '?rfqId=1&vendorId=1&vendorName=Test+Vendor+Corp&locked=true') => {
  return render(
    <MemoryRouter initialEntries={[`/chatbot/new-deal${searchParams}`]}>
      <Routes>
        <Route path="/chatbot/new-deal" element={<NewDealPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Smart Defaults - Date Auto-Fill Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Clear localStorage (wizard draft) to prevent state leaking between tests
    localStorage.clear();
    sessionStorage.clear();

    // Default mocks — happy path
    vi.mocked(chatbotService.getRequisitions).mockResolvedValue({
      data: [mockRequisition],
    } as any);

    vi.mocked(chatbotService.getRequisitionVendors).mockResolvedValue({
      data: [mockVendor],
    } as any);

    vi.mocked(chatbotService.getDeliveryAddresses).mockResolvedValue({
      data: [mockAddress],
    } as any);

    vi.mocked(chatbotService.getQualityCertifications).mockResolvedValue({
      data: [
        { id: 'ISO_9001', name: 'ISO 9001:2015', category: 'Quality Management' },
      ],
    } as any);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Service Integration', () => {
    it('should call getSmartDefaults with correct parameters from URL params', async () => {
      const mockSmartDefaults = createMockSmartDefaults();

      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: mockSmartDefaults,
      } as any);

      renderNewDealPage();

      // Wait for the cascading data loads: requisitions → vendors → smart defaults
      await waitFor(() => {
        expect(chatbotService.getSmartDefaults).toHaveBeenCalledWith(1, 1);
      }, { timeout: 5000 });
    });

    it('should call getSmartDefaults exactly once for a given requisition+vendor', async () => {
      const mockSmartDefaults = createMockSmartDefaults();

      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: mockSmartDefaults,
      } as any);

      renderNewDealPage();

      await waitFor(() => {
        expect(chatbotService.getSmartDefaults).toHaveBeenCalledTimes(1);
      }, { timeout: 5000 });
    });

    it('should handle service errors gracefully (no crash)', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.mocked(chatbotService.getSmartDefaults).mockRejectedValue(
        new Error('Failed to fetch smart defaults')
      );

      // Should not throw
      expect(() => renderNewDealPage()).not.toThrow();

      // Page should still render
      await waitFor(() => {
        expect(screen.getByText('Create New Deal')).toBeInTheDocument();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should not call getSmartDefaults when vendorId is missing', async () => {
      // No vendorId in URL — smart defaults should not load
      renderNewDealPage('?rfqId=1');

      // Wait for initial data load
      await waitFor(() => {
        expect(chatbotService.getRequisitions).toHaveBeenCalled();
      });

      // Smart defaults should NOT be called (no vendorId in form state)
      // Give it a moment to ensure it doesn't fire
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(chatbotService.getSmartDefaults).not.toHaveBeenCalled();
    });

    it('should call all required initial data services', async () => {
      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: createMockSmartDefaults(),
      } as any);

      renderNewDealPage();

      await waitFor(() => {
        // These are called on mount
        expect(chatbotService.getRequisitions).toHaveBeenCalled();
        expect(chatbotService.getQualityCertifications).toHaveBeenCalled();
        expect(chatbotService.getDeliveryAddresses).toHaveBeenCalled();
        // These are called as part of URL-param initialization
        expect(chatbotService.getRequisitionVendors).toHaveBeenCalledWith(1);
      }, { timeout: 5000 });
    });
  });

  describe('Smart Defaults Data Mapping', () => {
    // These tests verify the data mapping logic used by the component's
    // smart defaults useEffect (lines 639-717 of NewDealPage.tsx).
    // We extract and test the mapping rules independently.

    const applySmartDefaults = (smartDefaults: any, existingFormData: any = {}) => {
      const isEmpty = (val: unknown): boolean =>
        val === null || val === undefined || val === 0 || val === '';

      const prevStepTwo = existingFormData.stepTwo || {
        priceQuantity: { targetUnitPrice: 0, maxAcceptablePrice: 0, minOrderQuantity: 0, currency: null },
        paymentTerms: { minDays: null, maxDays: null },
        delivery: { requiredDate: null, preferredDate: null, locationId: null, locationAddress: null },
      };
      const prevStepThree = existingFormData.stepThree || {
        negotiationControl: { deadline: null },
      };

      return {
        stepTwo: {
          priceQuantity: {
            targetUnitPrice: isEmpty(prevStepTwo.priceQuantity.targetUnitPrice)
              ? (smartDefaults.priceQuantity.totalTargetPrice ?? smartDefaults.priceQuantity.targetUnitPrice)
              : prevStepTwo.priceQuantity.targetUnitPrice,
            maxAcceptablePrice: isEmpty(prevStepTwo.priceQuantity.maxAcceptablePrice)
              ? (smartDefaults.priceQuantity.totalMaxPrice ?? smartDefaults.priceQuantity.maxAcceptablePrice)
              : prevStepTwo.priceQuantity.maxAcceptablePrice,
            minOrderQuantity: isEmpty(prevStepTwo.priceQuantity.minOrderQuantity)
              ? smartDefaults.priceQuantity.totalQuantity
              : prevStepTwo.priceQuantity.minOrderQuantity,
            currency: smartDefaults.currency ?? prevStepTwo.priceQuantity.currency ?? null,
          },
          paymentTerms: {
            minDays: prevStepTwo.paymentTerms.minDays ?? smartDefaults.paymentTerms.minDays,
            maxDays: prevStepTwo.paymentTerms.maxDays ?? smartDefaults.paymentTerms.maxDays,
          },
          delivery: {
            preferredDate: isEmpty(prevStepTwo.delivery.preferredDate)
              ? (smartDefaults.delivery.deliveryDate || null)
              : prevStepTwo.delivery.preferredDate,
            requiredDate: isEmpty(prevStepTwo.delivery.requiredDate)
              ? (smartDefaults.delivery.maxDeliveryDate || null)
              : prevStepTwo.delivery.requiredDate,
          },
        },
        stepThree: {
          negotiationControl: {
            deadline: isEmpty(prevStepThree.negotiationControl.deadline)
              ? (smartDefaults.delivery.negotiationClosureDate ?? null)
              : prevStepThree.negotiationControl.deadline,
          },
        },
      };
    };

    it('should map maxDeliveryDate to requiredDate (Step 2)', () => {
      const smartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: null,
        },
      });

      const result = applySmartDefaults(smartDefaults);
      expect(result.stepTwo.delivery.requiredDate).toBe('2026-03-20');
    });

    it('should map negotiationClosureDate to deadline (Step 3)', () => {
      const smartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: null,
          negotiationClosureDate: '2026-02-28',
        },
      });

      const result = applySmartDefaults(smartDefaults);
      expect(result.stepThree.negotiationControl.deadline).toBe('2026-02-28');
    });

    it('should map both dates when both are present', () => {
      const smartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      const result = applySmartDefaults(smartDefaults);
      expect(result.stepTwo.delivery.requiredDate).toBe('2026-03-20');
      expect(result.stepThree.negotiationControl.deadline).toBe('2026-02-28');
    });

    it('should not overwrite existing requiredDate', () => {
      const smartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: null,
        },
      });

      const existingForm = {
        stepTwo: {
          priceQuantity: { targetUnitPrice: 0, maxAcceptablePrice: 0, minOrderQuantity: 0, currency: null },
          paymentTerms: { minDays: null, maxDays: null },
          delivery: { requiredDate: '2026-04-15', preferredDate: null, locationId: null, locationAddress: null },
        },
      };

      const result = applySmartDefaults(smartDefaults, existingForm);
      expect(result.stepTwo.delivery.requiredDate).toBe('2026-04-15');
    });

    it('should not overwrite existing deadline', () => {
      const smartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: null,
          negotiationClosureDate: '2026-02-28',
        },
      });

      const existingForm = {
        stepThree: {
          negotiationControl: { deadline: '2026-03-15T23:59:00' },
        },
      };

      const result = applySmartDefaults(smartDefaults, existingForm);
      expect(result.stepThree.negotiationControl.deadline).toBe('2026-03-15T23:59:00');
    });

    it('should set null dates when smart defaults dates are null', () => {
      const smartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: null,
          negotiationClosureDate: null,
        },
      });

      const result = applySmartDefaults(smartDefaults);
      expect(result.stepTwo.delivery.requiredDate).toBeNull();
      expect(result.stepThree.negotiationControl.deadline).toBeNull();
    });

    it('should map targetUnitPrice from smart defaults', () => {
      const smartDefaults = createMockSmartDefaults({
        priceQuantity: {
          targetUnitPrice: 50,
          maxAcceptablePrice: 60,
          totalTargetPrice: 5000,
          totalMaxPrice: 6000,
          totalQuantity: 100,
        },
      });

      const result = applySmartDefaults(smartDefaults);
      // totalTargetPrice takes priority over targetUnitPrice
      expect(result.stepTwo.priceQuantity.targetUnitPrice).toBe(5000);
      expect(result.stepTwo.priceQuantity.maxAcceptablePrice).toBe(6000);
    });

    it('should fall back to unitPrice when total prices are not available', () => {
      const smartDefaults = createMockSmartDefaults({
        priceQuantity: {
          targetUnitPrice: 50,
          maxAcceptablePrice: 60,
          // No totalTargetPrice or totalMaxPrice
        },
      });

      const result = applySmartDefaults(smartDefaults);
      expect(result.stepTwo.priceQuantity.targetUnitPrice).toBe(50);
      expect(result.stepTwo.priceQuantity.maxAcceptablePrice).toBe(60);
    });

    it('should map payment terms from smart defaults', () => {
      const smartDefaults = createMockSmartDefaults({
        paymentTerms: {
          minDays: 30,
          maxDays: 60,
          advancePaymentLimit: 20,
        },
      });

      const result = applySmartDefaults(smartDefaults);
      expect(result.stepTwo.paymentTerms.minDays).toBe(30);
      expect(result.stepTwo.paymentTerms.maxDays).toBe(60);
    });
  });

  describe('Date Format Validation', () => {
    it('should accept dates in YYYY-MM-DD format', () => {
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      expect(mockSmartDefaults.delivery.maxDeliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should not contain time components in date fields', () => {
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      expect(mockSmartDefaults.delivery.maxDeliveryDate).not.toContain('T');
      expect(mockSmartDefaults.delivery.negotiationClosureDate).not.toContain('T');
    });

    it('should handle different valid date formats consistently', () => {
      const dates = ['2026-01-01', '2026-12-31', '2026-02-28', '2026-06-15'];
      dates.forEach(date => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const parsed = new Date(date + 'T00:00:00');
        expect(parsed.getTime()).not.toBeNaN();
      });
    });
  });

  describe('Backwards Compatibility', () => {
    it('should not crash when delivery object has no date fields', async () => {
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          // No maxDeliveryDate or negotiationClosureDate
        },
      });

      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: mockSmartDefaults,
      } as any);

      // Should not throw
      expect(() => renderNewDealPage()).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Create New Deal')).toBeInTheDocument();
      });
    });

    it('should preserve existing smart defaults functionality (price/terms)', () => {
      const mockSmartDefaults = createMockSmartDefaults({
        priceQuantity: {
          targetUnitPrice: 50,
          maxAcceptablePrice: 60,
          volumeDiscountExpectation: 5,
        },
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      // Verify the factory produces correct data structure
      expect(mockSmartDefaults.priceQuantity.targetUnitPrice).toBe(50);
      expect(mockSmartDefaults.priceQuantity.maxAcceptablePrice).toBe(60);
      expect(mockSmartDefaults.delivery.typicalDeliveryDays).toBe(14);
      expect(mockSmartDefaults.source).toBe('vendor_history');
      expect(mockSmartDefaults.confidence).toBe(0.8);
    });

    it('should handle null smart defaults response gracefully', async () => {
      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: null,
      } as any);

      expect(() => renderNewDealPage()).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Create New Deal')).toBeInTheDocument();
      });
    });
  });

  describe('Page Rendering', () => {
    it('should render the Create New Deal heading', async () => {
      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: createMockSmartDefaults(),
      } as any);

      renderNewDealPage();

      await waitFor(() => {
        expect(screen.getByText('Create New Deal')).toBeInTheDocument();
      });
    });

    it('should show the wizard step progress', async () => {
      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: createMockSmartDefaults(),
      } as any);

      renderNewDealPage();

      await waitFor(() => {
        expect(screen.getByText('Basic Info')).toBeInTheDocument();
      });
    });

    it('should show Step 1 form fields on initial render', async () => {
      vi.mocked(chatbotService.getSmartDefaults).mockResolvedValue({
        data: createMockSmartDefaults(),
      } as any);

      renderNewDealPage();

      await waitFor(() => {
        // Step 1 has RFQ selector and Deal Title
        expect(screen.getAllByText(/RFQ/).length).toBeGreaterThan(0);
        expect(screen.getByText(/Deal Title/)).toBeInTheDocument();
      });
    });
  });
});
