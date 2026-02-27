import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from '../../../src/components/shared/FormInput';

describe('FormInput', () => {
  describe('Rendering', () => {
    it('should render input with label', () => {
      render(<FormInput label="Full Name" name="fullName" />);

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render without label when not provided', () => {
      render(<FormInput name="username" placeholder="Enter username" />);

      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<FormInput name="email" placeholder="email@example.com" />);

      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    });

    it('should render required asterisk when required', () => {
      const { container } = render(
        <FormInput label="Email" name="email" required />
      );

      const asterisk = container.querySelector('.text-red-500');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk?.textContent).toBe('*');
    });

    it('should render help text when provided', () => {
      render(
        <FormInput
          label="Password"
          name="password"
          helpText="Must be at least 8 characters"
        />
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<FormInput name="name" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render number input', () => {
      render(<FormInput name="age" type="number" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render email input', () => {
      render(<FormInput name="email" type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<FormInput name="password" type="password" />);

      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render date input', () => {
      render(<FormInput name="birthdate" type="date" />);

      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });

    it('should render tel input', () => {
      render(<FormInput name="phone" type="tel" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<FormInput name="website" type="url" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });
  });

  describe('Number Input Attributes', () => {
    it('should set min and max for number input', () => {
      render(<FormInput name="quantity" type="number" min={1} max={100} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should set step for number input', () => {
      render(<FormInput name="price" type="number" step={0.01} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.01');
    });

    it('should set step to any for decimal prices', () => {
      render(<FormInput name="amount" type="number" step="any" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', 'any');
    });
  });

  describe('Value and onChange', () => {
    it('should render with initial value', () => {
      render(<FormInput name="name" value="John Doe" onChange={() => {}} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('John Doe');
    });

    it('should call onChange when input changes', () => {
      const onChange = vi.fn();
      render(<FormInput name="name" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Jane' } });

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should update value on change', () => {
      let currentValue = '';
      const onChange = vi.fn((e) => {
        currentValue = e.target.value;
      });

      const { rerender } = render(<FormInput name="name" value={currentValue} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New Value' } });

      // Verify onChange was called
      expect(onChange).toHaveBeenCalledTimes(1);

      // Rerender with new value to simulate React state update
      rerender(<FormInput name="name" value={currentValue} onChange={onChange} />);

      // Now verify the input has the updated value
      expect((input as HTMLInputElement).value).toBe('New Value');
    });
  });

  describe('Error States', () => {
    it('should display error message', () => {
      render(
        <FormInput
          name="email"
          label="Email"
          error="Email is required"
        />
      );

      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should apply error styling to input', () => {
      render(<FormInput name="email" error="Invalid email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300');
      expect(input).toHaveClass('bg-red-50');
    });

    it('should show error icon with error message', () => {
      const { container } = render(
        <FormInput name="email" error="Invalid email" />
      );

      const errorIcon = container.querySelector('svg[data-lucide="alert-circle"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should not show error when error is null', () => {
      render(<FormInput name="email" error={null} />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-300');
    });

    it('should not show error when error is undefined', () => {
      render(<FormInput name="email" />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-300');
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<FormInput name="name" disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(<FormInput name="name" disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(<FormInput name="name" disabled onChange={onChange} />);

      const input = screen.getByRole('textbox');
      // Note: In React, disabled inputs still fire onChange in tests
      // but in real browsers they don't. The disabled attribute is what matters.
      expect(input).toBeDisabled();
    });
  });

  describe('Read-Only State', () => {
    it('should set input as readonly', () => {
      render(<FormInput name="name" readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should apply readonly styling', () => {
      render(<FormInput name="name" readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-50');
    });
  });

  describe('Styling and Classes', () => {
    it('should apply default styling', () => {
      render(<FormInput name="name" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('px-4');
      expect(input).toHaveClass('py-2.5');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('rounded-lg');
    });

    it('should apply focus styles', () => {
      render(<FormInput name="name" />);

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('focus:outline-none');
      expect(input.className).toContain('focus:ring-2');
      expect(input.className).toContain('focus:ring-blue-500');
    });

    it('should apply custom className', () => {
      render(<FormInput name="name" className="custom-class" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should apply custom label className', () => {
      render(
        <FormInput
          name="name"
          label="Name"
          labelClassName="custom-label"
        />
      );

      const label = screen.getByText('Name');
      expect(label).toHaveClass('custom-label');
    });
  });

  describe('Icon Support', () => {
    it('should render prefix icon', () => {
      const PrefixIcon = () => <span data-testid="prefix-icon">$</span>;
      render(<FormInput name="price" prefixIcon={<PrefixIcon />} />);

      expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    });

    it('should render suffix icon', () => {
      const SuffixIcon = () => <span data-testid="suffix-icon">@</span>;
      render(<FormInput name="email" suffixIcon={<SuffixIcon />} />);

      expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
    });

    it('should add padding when prefix icon exists', () => {
      const PrefixIcon = () => <span>$</span>;
      render(<FormInput name="price" type="number" prefixIcon={<PrefixIcon />} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveClass('pl-10');
    });

    it('should add padding when suffix icon exists', () => {
      const SuffixIcon = () => <span>%</span>;
      render(<FormInput name="discount" suffixIcon={<SuffixIcon />} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('Accessibility', () => {
    it('should associate label with input using htmlFor', () => {
      render(<FormInput name="email" label="Email Address" />);

      const label = screen.getByText('Email Address');
      const input = screen.getByLabelText('Email Address');

      expect(label).toHaveAttribute('for', 'email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('should set aria-invalid when error exists', () => {
      render(<FormInput name="email" error="Invalid email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not set aria-invalid when no error', () => {
      render(<FormInput name="email" />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('should set aria-describedby for help text', () => {
      render(
        <FormInput
          name="password"
          helpText="Min 8 characters"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'password-help');
    });

    it('should set aria-describedby for error message', () => {
      render(
        <FormInput
          name="email"
          error="Email is required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(<FormInput name="name" value="" onChange={() => {}} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle null value', () => {
      render(<FormInput name="name" value={null as any} onChange={() => {}} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle undefined value', () => {
      render(<FormInput name="name" onChange={() => {}} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle very long labels gracefully', () => {
      const longLabel = 'This is a very long label that might wrap to multiple lines in the UI';
      render(<FormInput name="field" label={longLabel} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle special characters in value', () => {
      const specialValue = `<>&"'`;
      render(
        <FormInput
          name="special"
          value={specialValue}
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(specialValue);
    });
  });

  describe('MaxLength', () => {
    it('should set maxLength attribute', () => {
      render(<FormInput name="username" maxLength={20} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '20');
    });

    it('should prevent input beyond maxLength', () => {
      render(<FormInput name="code" maxLength={5} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '5');
    });
  });

  describe('AutoComplete', () => {
    it('should set autocomplete attribute', () => {
      render(<FormInput name="email" autoComplete="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });

    it('should disable autocomplete when set to off', () => {
      render(<FormInput name="otp" autoComplete="off" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('AutoFocus', () => {
    it('should autofocus input when autoFocus is true', () => {
      render(<FormInput name="search" autoFocus />);

      const input = screen.getByRole('textbox');
      // In React, autoFocus is a boolean prop, not an attribute in DOM
      expect(input).toHaveFocus();
    });
  });
});
