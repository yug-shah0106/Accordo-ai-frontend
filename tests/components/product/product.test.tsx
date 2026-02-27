import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from '../../helpers/utils';
import CreateProductForm from '../../../src/components/vendor/CreateProductForm';
import productSchema from '../../../src/schema/product';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock api
vi.mock('../../../src/api', () => ({
  authApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

describe('Product Schema Validation', () => {
  describe('GST Type validation', () => {
    it('should accept "GST" as a valid GST type', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept "Non-GST" as a valid GST type', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'Non-GST',
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject "Non-Gst" (wrong case)', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'Non-Gst', // Wrong case - should be "Non-GST"
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid GST type values', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'invalid',
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('GST Percentage validation', () => {
    it('should require GST percentage when GST type is GST', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        // Missing gstPercentage
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('gstPercentage');
      }
    });

    it('should not require GST percentage when GST type is Non-GST', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'Non-GST',
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept valid GST percentage values (0, 5, 12, 18, 28)', () => {
      const validPercentages = [0, 5, 12, 18, 28];

      for (const percentage of validPercentages) {
        const data = {
          productName: 'Test Product',
          category: 'Electronics',
          brandName: 'Test Brand',
          gstType: 'GST',
          gstPercentage: percentage,
          tds: 12345,
          type: 'Goods',
          UOM: 'units',
        };

        const result = productSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid GST percentage values', () => {
      const invalidPercentages = [1, 10, 15, 20, 30, 100];

      for (const percentage of invalidPercentages) {
        const data = {
          productName: 'Test Product',
          category: 'Electronics',
          brandName: 'Test Brand',
          gstType: 'GST',
          gstPercentage: percentage,
          tds: 12345,
          type: 'Goods',
          UOM: 'units',
        };

        const result = productSchema.safeParse(data);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Required fields validation', () => {
    it('should require product name', () => {
      const data = {
        // Missing productName
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require category', () => {
      const data = {
        productName: 'Test Product',
        // Missing category
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require brand name', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        // Missing brandName
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require tds (HSN Code)', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        // Missing tds
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require tds to be positive', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: -100,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Type validation', () => {
    it('should accept "Goods" as a valid type', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Goods',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept "Services" as a valid type', () => {
      const data = {
        productName: 'Test Service',
        category: 'Consulting',
        brandName: 'Service Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Services',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid type values', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'InvalidType',
        UOM: 'units',
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('UOM validation', () => {
    it('should accept valid UOM values', () => {
      const validUoms = ['kgs', 'liters', 'units'];

      for (const uom of validUoms) {
        const data = {
          productName: 'Test Product',
          category: 'Electronics',
          brandName: 'Test Brand',
          gstType: 'GST',
          gstPercentage: 18,
          tds: 12345,
          type: 'Goods',
          UOM: uom,
        };

        const result = productSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid UOM values', () => {
      const data = {
        productName: 'Test Product',
        category: 'Electronics',
        brandName: 'Test Brand',
        gstType: 'GST',
        gstPercentage: 18,
        tds: 12345,
        type: 'Goods',
        UOM: 'pieces', // Invalid - not in the allowed list
      };

      const result = productSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('CreateProductForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    renderWithProviders(<CreateProductForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('should render create button', () => {
    renderWithProviders(<CreateProductForm />);

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('should render close button', () => {
    renderWithProviders(<CreateProductForm />);

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should navigate back when close is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateProductForm />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
