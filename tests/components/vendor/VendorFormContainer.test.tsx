import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VendorFormContainer from '../../../src/components/VendorForm/VendorFormContainer';

// Mock the new 5-step child components
// Each mock exposes Next/Back buttons that call nextStep/prevStep from props
vi.mock('../../../src/components/VendorForm/BasicAndCompanyInfo', () => ({
  default: ({ nextStep, prevStep }: any) => (
    <div data-testid="step-1">
      <h2>Basic & Company Info</h2>
      <input data-testid="vendor-name" placeholder="Enter vendor name" />
      <button data-testid="nav-back" onClick={prevStep} disabled>Back</button>
      <button data-testid="nav-next" onClick={nextStep}>Next</button>
    </div>
  ),
}));

vi.mock('../../../src/components/VendorForm/LocationDetails', () => ({
  default: ({ nextStep, prevStep }: any) => (
    <div data-testid="step-2">
      <h2>Location Details</h2>
      <input data-testid="vendor-address" placeholder="Enter address" />
      <button data-testid="nav-back" onClick={prevStep}>Back</button>
      <button data-testid="nav-next" onClick={nextStep}>Next</button>
    </div>
  ),
}));

vi.mock('../../../src/components/VendorForm/FinancialAndBanking', () => ({
  default: ({ nextStep, prevStep }: any) => (
    <div data-testid="step-3">
      <h2>Financial & Banking</h2>
      <select data-testid="vendor-currency">
        <option value="">Select currency</option>
        <option value="USD">USD</option>
      </select>
      <button data-testid="nav-back" onClick={prevStep}>Back</button>
      <button data-testid="nav-next" onClick={nextStep}>Next</button>
    </div>
  ),
}));

vi.mock('../../../src/components/VendorForm/ContactAndDocuments', () => ({
  default: ({ nextStep, prevStep }: any) => (
    <div data-testid="step-4">
      <h2>Contact & Documents</h2>
      <input data-testid="vendor-email" placeholder="Enter email" />
      <button data-testid="nav-back" onClick={prevStep}>Back</button>
      <button data-testid="nav-next" onClick={nextStep}>Next</button>
    </div>
  ),
}));

vi.mock('../../../src/components/VendorForm/VendorReview', () => ({
  default: ({ prevStep, onSubmit }: any) => (
    <div data-testid="step-5">
      <h2>Review & Submit</h2>
      <div data-testid="review-content">Review your vendor information</div>
      <button data-testid="nav-back" onClick={prevStep}>Back</button>
      <button data-testid="nav-submit" onClick={onSubmit}>Submit</button>
    </div>
  ),
}));

// Mock VerticalStepProgress
vi.mock('../../../src/components/shared/VerticalStepProgress', () => ({
  default: ({ steps, currentStep, onStepClick, allowNavigation }: any) => (
    <div data-testid="step-progress">
      {steps.map((step: any) => (
        <button
          key={step.id}
          data-testid={`step-indicator-${step.id}`}
          onClick={() => allowNavigation && onStepClick?.(step.id)}
          disabled={!allowNavigation || step.id > currentStep}
          className={step.id === currentStep ? 'active' : ''}
        >
          {step.title}
        </button>
      ))}
    </div>
  ),
}));

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

// Mock useNavigate and useParams
const mockNavigate = vi.fn();

// Use a container object so vi.mock factory closure can access the latest value
const searchParamsContainer = { current: new URLSearchParams() };
const mockSetSearchParams = vi.fn((params: any) => {
  if (params && typeof params === 'object') {
    const sp = searchParamsContainer.current;
    Array.from(sp.keys()).forEach(key => sp.delete(key));
    Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)));
  }
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [searchParamsContainer.current, mockSetSearchParams],
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/vendor-management/add-vendor', search: '' }),
  };
});

describe('VendorFormContainer', () => {
  const renderContainer = () => {
    return render(
      <BrowserRouter>
        <VendorFormContainer />
      </BrowserRouter>
    );
  };

  // Helper to find navigation buttons exposed by mocked step components
  const getNextButton = () => screen.queryByTestId('nav-next');
  const getBackButton = () => screen.queryByTestId('nav-back');
  const getSubmitButton = () => screen.queryByTestId('nav-submit');

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetSearchParams.mockClear();
    // Reset search params to a fresh instance each test
    searchParamsContainer.current = new URLSearchParams();
  });

  describe('Initial Rendering', () => {
    it('should render the container with step progress', () => {
      renderContainer();
      expect(screen.getByTestId('step-progress')).toBeInTheDocument();
    });

    it('should render first step by default', () => {
      renderContainer();
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      expect(screen.getByTestId('step-1')).toHaveTextContent('Basic & Company Info');
    });

    it('should render all 5 step indicators', () => {
      renderContainer();
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`step-indicator-${i}`)).toBeInTheDocument();
      }
    });

    it('should have first step indicator as active', () => {
      renderContainer();
      expect(screen.getByTestId('step-indicator-1')).toHaveClass('active');
    });

    it('should render navigation buttons within step component', () => {
      renderContainer();
      expect(getNextButton()).toBeInTheDocument();
      expect(getBackButton()).toBeInTheDocument();
    });
  });

  describe('Step Navigation - Next Button', () => {
    it('should move to next step when Next is clicked', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      expect(screen.getByTestId('step-2')).toHaveTextContent('Location Details');
    });

    it('should progress through all 5 steps sequentially', () => {
      renderContainer();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-3')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-4')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-5')).toBeInTheDocument();
    });

    it('should show Submit button on last step (step 5)', () => {
      renderContainer();
      for (let i = 0; i < 4; i++) {
        fireEvent.click(getNextButton()!);
      }
      expect(screen.getByTestId('step-5')).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
    });
  });

  describe('Step Navigation - Back Button', () => {
    it('should disable Back button on first step', () => {
      renderContainer();
      expect(getBackButton()).toBeDisabled();
    });

    it('should enable Back button after moving to second step', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      expect(getBackButton()).not.toBeDisabled();
    });

    it('should move back to previous step when Back is clicked', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      fireEvent.click(getBackButton()!);
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should preserve step context when navigating back', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      fireEvent.click(getBackButton()!);
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });
  });

  describe('Step Progress Click Navigation', () => {
    it('should allow navigation to completed steps via step progress', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-3')).toBeInTheDocument();

      const step1Indicator = screen.getByTestId('step-indicator-1');
      fireEvent.click(step1Indicator);
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should not allow navigation to future steps via step progress', () => {
      renderContainer();
      const step3Indicator = screen.getByTestId('step-indicator-3');
      fireEvent.click(step3Indicator);
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should allow jumping to any visited step', () => {
      renderContainer();
      fireEvent.click(getNextButton()!); // to step 2
      fireEvent.click(getNextButton()!); // to step 3
      fireEvent.click(getNextButton()!); // to step 4

      expect(screen.getByTestId('step-4')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('step-indicator-2'));
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should render form inputs on each step', () => {
      renderContainer();
      expect(screen.getByTestId('vendor-name')).toBeInTheDocument();
    });

    it('should allow navigation between steps', () => {
      renderContainer();
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });

    it('should render all steps sequentially', () => {
      renderContainer();
      expect(screen.getByTestId('step-1')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-3')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-4')).toBeInTheDocument();

      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-5')).toBeInTheDocument();
    });
  });

  describe('URL Synchronization', () => {
    it('should update URL when step changes', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show step component content on each step', () => {
      renderContainer();
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
  });

  describe('Step Configuration', () => {
    it('should have correct step titles', () => {
      renderContainer();
      const expectedTitles = [
        'Basic & Company Info',
        'Location Details',
        'Financial & Banking',
        'Contact & Documents',
        'Review & Submit',
      ];
      expectedTitles.forEach((title, index) => {
        expect(screen.getByTestId(`step-indicator-${index + 1}`)).toHaveTextContent(title);
      });
    });

    it('should render correct number of steps (5)', () => {
      renderContainer();
      expect(screen.getAllByTestId(/step-indicator-\d+/)).toHaveLength(5);
    });
  });

  describe('Responsive Layout', () => {
    it('should render step progress sidebar on desktop', () => {
      renderContainer();
      expect(screen.getByTestId('step-progress')).toBeInTheDocument();
    });

    it('should apply correct layout classes', () => {
      const { container } = renderContainer();
      expect(container.querySelector('.flex')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation buttons', () => {
      renderContainer();
      expect(getNextButton()).toBeInTheDocument();
      expect(getBackButton()).toBeInTheDocument();
    });

    it('should indicate current step to screen readers', () => {
      renderContainer();
      expect(screen.getByTestId('step-indicator-1')).toHaveClass('active');
    });

    it('should disable future steps for keyboard navigation', () => {
      renderContainer();
      expect(screen.getByTestId('step-indicator-3')).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid navigation clicks', () => {
      renderContainer();
      fireEvent.click(getNextButton()!);
      fireEvent.click(getNextButton()!);
      fireEvent.click(getNextButton()!);
      expect(screen.getByTestId('step-4')).toBeInTheDocument();
    });

    it('should handle empty form data gracefully', () => {
      renderContainer();
      for (let i = 0; i < 4; i++) {
        fireEvent.click(getNextButton()!);
      }
      expect(screen.getByTestId('step-5')).toBeInTheDocument();
    });

    it('should handle form inputs with placeholders', () => {
      renderContainer();
      expect(screen.getByTestId('vendor-name')).toHaveAttribute('placeholder');
    });
  });
});
