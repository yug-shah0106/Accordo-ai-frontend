import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VerticalStepProgress from '../VerticalStepProgress';

describe('VerticalStepProgress', () => {
  const mockSteps = [
    { id: 1, title: 'Basic Info', description: 'Enter basic details' },
    { id: 2, title: 'Commercial', description: 'Price & Terms' },
    { id: 3, title: 'Contract', description: 'SLA & Quality' },
    { id: 4, title: 'Weights', description: 'Parameter importance' },
  ];

  describe('Rendering', () => {
    it('should render all steps with titles', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Commercial')).toBeInTheDocument();
      expect(screen.getByText('Contract')).toBeInTheDocument();
      expect(screen.getByText('Weights')).toBeInTheDocument();
    });

    it('should render step descriptions when provided', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      expect(screen.getByText('Enter basic details')).toBeInTheDocument();
      expect(screen.getByText('Price & Terms')).toBeInTheDocument();
      expect(screen.getByText('SLA & Quality')).toBeInTheDocument();
      expect(screen.getByText('Parameter importance')).toBeInTheDocument();
    });

    it('should render step numbers', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render with vertical layout', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      // Check for vertical flex container
      const progressContainer = container.querySelector('.flex-col');
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe('Step States', () => {
    it('should mark completed steps with check icon', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={3} />);

      // Steps 1 and 2 should be completed
      const checkIcons = container.querySelectorAll('svg[data-lucide="check"]');
      expect(checkIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should highlight current step', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={2} />);

      // Current step should have special styling
      const currentStepButton = screen.getByText('2').closest('button');
      expect(currentStepButton).toHaveClass('bg-blue-600');
      expect(currentStepButton).toHaveClass('text-white');
    });

    it('should style future steps differently', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={2} />);

      // Future steps should have gray styling
      const futureStepButton = screen.getByText('3').closest('button');
      expect(futureStepButton).toHaveClass('bg-gray-200');
      expect(futureStepButton).toHaveClass('text-gray-500');
    });

    it('should style completed steps with blue background', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={3} />);

      // Completed steps should have blue background
      const completedStepButton = screen.getByLabelText('Step 1: Basic Info');
      expect(completedStepButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Navigation', () => {
    it('should call onStepClick when completed step is clicked', () => {
      const onStepClick = vi.fn();
      render(
        <VerticalStepProgress
          steps={mockSteps}
          currentStep={3}
          onStepClick={onStepClick}
          allowNavigation={true}
        />
      );

      // Click on step 1 (completed)
      const step1Button = screen.getByLabelText('Step 1: Basic Info');
      fireEvent.click(step1Button!);

      expect(onStepClick).toHaveBeenCalledWith(1);
    });

    it('should not call onStepClick when future step is clicked', () => {
      const onStepClick = vi.fn();
      render(
        <VerticalStepProgress
          steps={mockSteps}
          currentStep={2}
          onStepClick={onStepClick}
          allowNavigation={true}
        />
      );

      // Click on step 4 (future)
      const step4Button = screen.getByText('4').closest('button');
      fireEvent.click(step4Button!);

      expect(onStepClick).not.toHaveBeenCalled();
    });

    it('should not allow navigation when allowNavigation is false', () => {
      const onStepClick = vi.fn();
      render(
        <VerticalStepProgress
          steps={mockSteps}
          currentStep={3}
          onStepClick={onStepClick}
          allowNavigation={false}
        />
      );

      // Click on step 1 (completed)
      const step1Button = screen.getByLabelText('Step 1: Basic Info');
      fireEvent.click(step1Button!);

      expect(onStepClick).not.toHaveBeenCalled();
    });

    it('should show cursor-pointer on completed steps when navigation allowed', () => {
      const { container } = render(
        <VerticalStepProgress
          steps={mockSteps}
          currentStep={3}
          allowNavigation={true}
        />
      );

      const completedStepButton = screen.getByLabelText('Step 1: Basic Info');
      expect(completedStepButton).toHaveClass('cursor-pointer');
    });

    it('should show cursor-not-allowed on future steps', () => {
      const { container } = render(
        <VerticalStepProgress
          steps={mockSteps}
          currentStep={2}
          allowNavigation={true}
        />
      );

      const futureStepButton = screen.getByText('4').closest('button');
      expect(futureStepButton).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Connector Lines', () => {
    it('should show connector lines between steps', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={2} />);

      // Should have 3 connector lines for 4 steps
      const connectors = container.querySelectorAll('.h-12'); // Vertical connectors
      expect(connectors.length).toBeGreaterThanOrEqual(3);
    });

    it('should color connector based on completion status', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={3} />);

      // First two connectors should be blue (completed)
      const connectors = container.querySelectorAll('.bg-blue-600');
      expect(connectors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button type', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should disable future step buttons', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={2} />);

      const step4Button = screen.getByText('4').closest('button');
      expect(step4Button).toBeDisabled();
    });

    it('should enable completed and current step buttons', () => {
      render(
        <VerticalStepProgress
          steps={mockSteps}
          currentStep={2}
          allowNavigation={true}
        />
      );

      const step1Button = screen.getByLabelText('Step 1: Basic Info');
      const step2Button = screen.getByLabelText('Step 2: Commercial');

      expect(step1Button).not.toBeDisabled();
      expect(step2Button).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const singleStep = [{ id: 1, title: 'Only Step', description: 'Single step' }];
      render(<VerticalStepProgress steps={singleStep} currentStep={1} />);

      expect(screen.getByText('Only Step')).toBeInTheDocument();
    });

    it('should handle steps without descriptions', () => {
      const stepsNoDesc = [
        { id: 1, title: 'Step 1' },
        { id: 2, title: 'Step 2' },
      ];
      render(<VerticalStepProgress steps={stepsNoDesc} currentStep={1} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    it('should handle currentStep = 1 (first step)', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      const step1Button = screen.getByText('1').closest('button');
      expect(step1Button).toHaveClass('bg-blue-600');
    });

    it('should handle currentStep = last step', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={4} />);

      const step4Button = screen.getByText('4').closest('button');
      expect(step4Button).toHaveClass('bg-blue-600');
    });
  });

  describe('Visual Styling', () => {
    it('should have transition animations', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={2} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('transition');
      });
    });

    it('should have rounded step indicators', () => {
      const { container } = render(<VerticalStepProgress steps={mockSteps} currentStep={1} />);

      const stepButtons = container.querySelectorAll('button');
      stepButtons.forEach(button => {
        expect(button.className).toContain('rounded-full');
      });
    });

    it('should display step titles with proper font weight', () => {
      render(<VerticalStepProgress steps={mockSteps} currentStep={2} />);

      const currentTitle = screen.getByText('Commercial').closest('p');
      expect(currentTitle).toHaveClass('font-medium');
    });
  });
});
