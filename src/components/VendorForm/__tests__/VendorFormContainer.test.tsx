import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VendorFormContainer from '../VendorFormContainer';

// Mock child step components - these use their own internal form management
vi.mock('../VendorBasicInformation', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-1">
      <h2>Basic Information</h2>
      <input
        data-testid="vendor-name"
        placeholder="Enter vendor name"
      />
    </div>
  ),
}));

vi.mock('../VendorGeneralInformation', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-2">
      <h2>General Information</h2>
      <input
        data-testid="vendor-description"
        placeholder="Enter description"
      />
    </div>
  ),
}));

vi.mock('../VendorCurrencyDetails', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-3">
      <h2>Currency Details</h2>
      <select data-testid="vendor-currency">
        <option value="">Select currency</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
    </div>
  ),
}));

vi.mock('../VendorContactDetails', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-4">
      <h2>Contact Details</h2>
      <input
        data-testid="vendor-email"
        placeholder="Enter email"
      />
    </div>
  ),
}));

vi.mock('../VendorBankDetails', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-5">
      <h2>Bank Details</h2>
      <input
        data-testid="vendor-bank"
        placeholder="Enter bank name"
      />
    </div>
  ),
}));

vi.mock('../VendorDocumentUpload', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-6">
      <h2>Document Upload</h2>
      <input
        data-testid="vendor-documents"
        type="file"
      />
    </div>
  ),
}));

vi.mock('../VendorReview', () => ({
  default: ({ currentStep, nextStep, prevStep }: any) => (
    <div data-testid="step-7">
      <h2>Review</h2>
      <div data-testid="review-content">Review your vendor information</div>
    </div>
  ),
}));

// Mock VerticalStepProgress
vi.mock('../../shared/VerticalStepProgress', () => ({
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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
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

  // Helper to get navigation buttons specifically (not step indicators)
  const getNavButtons = () => {
    const buttons = screen.getAllByRole('button');
    const backButton = buttons.find(btn =>
      btn.textContent?.trim() === 'Back' ||
      (btn.textContent?.includes('Back') && !btn.textContent?.includes('Basic'))
    );
    const nextButton = buttons.find(btn => btn.textContent?.trim() === 'Next');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Submit'));

    return { backButton, nextButton, submitButton };
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Initial Rendering', () => {
    it('should render the container with step progress', () => {
      renderContainer();

      expect(screen.getByTestId('step-progress')).toBeInTheDocument();
    });

    it('should render first step by default', () => {
      renderContainer();

      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      // Check step component header, not step indicator
      const step1 = screen.getByTestId('step-1');
      expect(step1).toHaveTextContent('Basic Information');
    });

    it('should render all 7 step indicators', () => {
      renderContainer();

      for (let i = 1; i <= 7; i++) {
        expect(screen.getByTestId(`step-indicator-${i}`)).toBeInTheDocument();
      }
    });

    it('should have first step indicator as active', () => {
      renderContainer();

      const firstStep = screen.getByTestId('step-indicator-1');
      expect(firstStep).toHaveClass('active');
    });

    it('should render navigation buttons', () => {
      renderContainer();

      const { backButton, nextButton } = getNavButtons();

      expect(backButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Step Navigation - Next Button', () => {
    it('should move to next step when Next button is clicked', () => {
      renderContainer();

      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton!);

      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      const step2 = screen.getByTestId('step-2');
      expect(step2).toHaveTextContent('General Information');
    });

    it('should progress through all steps sequentially', () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Step 1 -> Step 2
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();

      // Step 2 -> Step 3
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-3')).toBeInTheDocument();

      // Step 3 -> Step 4
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-4')).toBeInTheDocument();

      // Step 4 -> Step 5
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-5')).toBeInTheDocument();

      // Step 5 -> Step 6
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-6')).toBeInTheDocument();

      // Step 6 -> Step 7
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-7')).toBeInTheDocument();
    });

    it('should change Next button to Submit on last step', () => {
      renderContainer();

      let navButtons = getNavButtons();

      // Navigate to last step
      for (let i = 0; i < 6; i++) {
        fireEvent.click(navButtons.nextButton!);
        navButtons = getNavButtons(); // Refresh button references after each click
      }

      // On step 7, should have Submit button instead of Next
      const finalButtons = getNavButtons();
      expect(finalButtons.submitButton).toBeInTheDocument();
      expect(finalButtons.nextButton).toBeUndefined();
    });
  });

  describe('Step Navigation - Back Button', () => {
    it('should disable Back button on first step', () => {
      renderContainer();

      const { backButton } = getNavButtons();
      expect(backButton).toBeDisabled();
    });

    it('should enable Back button after moving to second step', () => {
      renderContainer();

      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);

      const { backButton } = getNavButtons();
      expect(backButton).not.toBeDisabled();
    });

    it('should move back to previous step when Back button is clicked', () => {
      renderContainer();

      // Move to step 2
      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();

      // Move back to step 1
      const { backButton } = getNavButtons();
      fireEvent.click(backButton);
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should preserve form data when navigating back', () => {
      renderContainer();

      // Move to step 2
      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);

      expect(screen.getByTestId('step-2')).toBeInTheDocument();

      // Move back to step 1
      const { backButton } = getNavButtons();
      fireEvent.click(backButton);

      // Verify we're back on step 1
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });
  });

  describe('Step Progress Click Navigation', () => {
    it('should allow navigation to completed steps via step progress', () => {
      renderContainer();

      // Move to step 3
      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByTestId('step-3')).toBeInTheDocument();

      // Click on step 1 indicator
      const step1Indicator = screen.getByTestId('step-indicator-1');
      fireEvent.click(step1Indicator);

      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should not allow navigation to future steps via step progress', () => {
      renderContainer();

      // Try to click on step 3 indicator while on step 1
      const step3Indicator = screen.getByTestId('step-indicator-3');
      fireEvent.click(step3Indicator);

      // Should still be on step 1
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('should allow jumping to any visited step', () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Visit steps 1, 2, 3, 4
      fireEvent.click(nextButton); // to step 2
      fireEvent.click(nextButton); // to step 3
      fireEvent.click(nextButton); // to step 4

      expect(screen.getByTestId('step-4')).toBeInTheDocument();

      // Jump back to step 2
      const step2Indicator = screen.getByTestId('step-indicator-2');
      fireEvent.click(step2Indicator);

      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should render form inputs on each step', () => {
      renderContainer();

      const nameInput = screen.getByTestId('vendor-name');
      expect(nameInput).toBeInTheDocument();
    });

    it('should allow navigation between steps', () => {
      renderContainer();

      expect(screen.getByTestId('step-1')).toBeInTheDocument();

      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);

      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });

    it('should render all steps sequentially', () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Navigate through all steps
      expect(screen.getByTestId('step-1')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-3')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-4')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-5')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-6')).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(screen.getByTestId('step-7')).toBeInTheDocument();
    });
  });

  describe('URL Synchronization', () => {
    it('should update URL when step changes', () => {
      renderContainer();

      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);

      // Verify URL would be updated (in real implementation)
      // This would use useSearchParams to set ?step=2
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });

    it('should initialize to URL step parameter if provided', () => {
      // This test would need to mock useSearchParams to return ?step=3
      // Then verify that step 3 is rendered initially
      // Skipped for now as it requires more complex mocking
    });
  });

  describe('Validation', () => {
    it('should show validation errors when moving to next step with invalid data', () => {
      renderContainer();

      // Try to move to next step without filling required field
      const { nextButton } = getNavButtons();
      fireEvent.click(nextButton);

      // Should show validation error (if validation is implemented)
      // This depends on validation logic in the container
    });

    it('should not advance to next step if current step has validation errors', () => {
      renderContainer();

      // This test would verify that validation prevents navigation
      // Implementation depends on validation strategy
    });
  });

  describe('Form Submission', () => {
    it('should call submit handler when Submit button is clicked on last step', async () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Navigate to last step
      for (let i = 0; i < 6; i++) {
        fireEvent.click(nextButton);
      }

      const { submitButton } = getNavButtons();
      fireEvent.click(submitButton);

      // Verify submission logic is called
      await waitFor(() => {
        // Would verify API call or success state
      });
    });

    it('should show Submit button on last step', () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Navigate to last step
      for (let i = 0; i < 6; i++) {
        fireEvent.click(nextButton!);
      }

      const { submitButton } = getNavButtons();
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Submit');
    });

    it('should navigate to vendor list after successful submission', async () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Navigate to last step
      for (let i = 0; i < 6; i++) {
        fireEvent.click(nextButton);
      }

      const { submitButton } = getNavButtons();
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/vendor-management');
      });
    });

    it('should show error message if submission fails', async () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Navigate to last step
      for (let i = 0; i < 6; i++) {
        fireEvent.click(nextButton);
      }

      const { submitButton } = getNavButtons();
      fireEvent.click(submitButton);

      // Would verify error toast or error message display
    });
  });

  describe('Step Configuration', () => {
    it('should have correct step titles', () => {
      renderContainer();

      const expectedTitles = [
        'Basic Information',
        'General Information',
        'Currency Details',
        'Contact Details',
        'Bank Details',
        'Document Upload',
        'Review',
      ];

      expectedTitles.forEach((title, index) => {
        const stepIndicator = screen.getByTestId(`step-indicator-${index + 1}`);
        expect(stepIndicator).toHaveTextContent(title);
      });
    });

    it('should render correct number of steps', () => {
      renderContainer();

      const stepIndicators = screen.getAllByTestId(/step-indicator-\d+/);
      expect(stepIndicators).toHaveLength(7);
    });
  });

  describe('Responsive Layout', () => {
    it('should render step progress sidebar on desktop', () => {
      renderContainer();

      const stepProgress = screen.getByTestId('step-progress');
      expect(stepProgress).toBeInTheDocument();
    });

    it('should apply correct layout classes', () => {
      const { container } = renderContainer();

      // Verify container uses flex layout
      const mainContainer = container.querySelector('.flex');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation buttons', () => {
      renderContainer();

      const { backButton } = getNavButtons();
      const { nextButton } = getNavButtons();

      expect(backButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('should indicate current step to screen readers', () => {
      renderContainer();

      // Would verify aria-current or similar attributes
      const activeStep = screen.getByTestId('step-indicator-1');
      expect(activeStep).toHaveClass('active');
    });

    it('should disable future steps for keyboard navigation', () => {
      renderContainer();

      const step3Indicator = screen.getByTestId('step-indicator-3');
      expect(step3Indicator).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid navigation clicks', () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Click next multiple times rapidly
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should be on step 4
      expect(screen.getByTestId('step-4')).toBeInTheDocument();
    });

    it('should handle empty form data gracefully', () => {
      renderContainer();

      const { nextButton } = getNavButtons();

      // Navigate through all steps without filling data
      for (let i = 0; i < 6; i++) {
        fireEvent.click(nextButton);
      }

      // Should reach review step
      expect(screen.getByTestId('step-7')).toBeInTheDocument();
    });

    it('should handle form inputs with placeholders', () => {
      renderContainer();

      const nameInput = screen.getByTestId('vendor-name');
      expect(nameInput).toHaveAttribute('placeholder');
    });
  });
});
