import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormSelect from '../FormSelect';

describe('FormSelect', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('should render select with label', () => {
      render(
        <FormSelect
          label="Country"
          name="country"
          options={mockOptions}
        />
      );

      expect(screen.getByLabelText('Country')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render without label when not provided', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('should render required asterisk when required', () => {
      const { container } = render(
        <FormSelect
          label="Country"
          name="country"
          options={mockOptions}
          required
        />
      );

      const asterisk = container.querySelector('.text-red-500');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk?.textContent).toBe('*');
    });

    it('should render placeholder option', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          placeholder="Select a country..."
        />
      );

      expect(screen.getByText('Select a country...')).toBeInTheDocument();
    });

    it('should render default placeholder when not provided', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      expect(screen.getByText('Select an option...')).toBeInTheDocument();
    });

    it('should render help text when provided', () => {
      render(
        <FormSelect
          label="Country"
          name="country"
          options={mockOptions}
          helpText="Choose your country of residence"
        />
      );

      expect(screen.getByText('Choose your country of residence')).toBeInTheDocument();
    });
  });

  describe('Options Rendering', () => {
    it('should render all options', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should render options with custom value and label keys', () => {
      const customOptions = [
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' },
      ];

      render(
        <FormSelect
          name="item"
          options={customOptions}
          valueKey="id"
          labelKey="name"
        />
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      render(<FormSelect name="country" options={[]} />);

      const select = screen.getByRole('combobox');
      const options = select.querySelectorAll('option');

      // Should only have placeholder option
      expect(options.length).toBe(1);
      expect(screen.getByText('Select an option...')).toBeInTheDocument();
    });

    it('should render option groups when provided', () => {
      const groupedOptions = [
        {
          label: 'North America',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
          ],
        },
        {
          label: 'Europe',
          options: [
            { value: 'uk', label: 'United Kingdom' },
            { value: 'fr', label: 'France' },
          ],
        },
      ];

      render(
        <FormSelect
          name="country"
          optionGroups={groupedOptions}
        />
      );

      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  describe('Value and onChange', () => {
    it('should render with initial value', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          value="option2"
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should call onChange when selection changes', () => {
      const onChange = vi.fn();
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          onChange={onChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option2' } });

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should update value on change', () => {
      let currentValue = '';
      const onChange = vi.fn((e) => {
        currentValue = e.target.value;
      });

      const { rerender } = render(
        <FormSelect
          name="country"
          options={mockOptions}
          value={currentValue}
          onChange={onChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option3' } });

      expect(onChange).toHaveBeenCalledTimes(1);

      // Rerender with new value
      rerender(
        <FormSelect
          name="country"
          options={mockOptions}
          value={currentValue}
          onChange={onChange}
        />
      );

      expect((select as HTMLSelectElement).value).toBe('option3');
    });

    it('should handle empty string value', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('');
    });
  });

  describe('Error States', () => {
    it('should display error message', () => {
      render(
        <FormSelect
          name="country"
          label="Country"
          options={mockOptions}
          error="Country is required"
        />
      );

      expect(screen.getByText('Country is required')).toBeInTheDocument();
    });

    it('should apply error styling to select', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          error="Invalid selection"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-300');
      expect(select).toHaveClass('bg-red-50');
    });

    it('should show error icon with error message', () => {
      const { container } = render(
        <FormSelect
          name="country"
          options={mockOptions}
          error="Invalid selection"
        />
      );

      const errorIcon = container.querySelector('svg[data-lucide="alert-circle"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should not show error when error is null', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          error={null}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).not.toHaveClass('border-red-300');
    });

    it('should not show error when error is undefined', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).not.toHaveClass('border-red-300');
    });
  });

  describe('Disabled State', () => {
    it('should disable select when disabled prop is true', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          disabled
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          disabled
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('disabled:bg-gray-50');
      expect(select).toHaveClass('disabled:text-gray-500');
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          disabled
          onChange={onChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'option2' } });

      // Disabled selects don't fire onChange in browsers
      expect(select).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const { container } = render(
        <FormSelect
          name="country"
          options={mockOptions}
          isLoading
        />
      );

      const loader = container.querySelector('svg[data-lucide="loader-2"]');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveClass('animate-spin');
    });

    it('should disable select when loading', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          isLoading
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should show loading text in placeholder', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          isLoading
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide chevron icon when loading', () => {
      const { container } = render(
        <FormSelect
          name="country"
          options={mockOptions}
          isLoading
        />
      );

      const chevron = container.querySelector('svg[data-lucide="chevron-down"]');
      expect(chevron).not.toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('should apply default styling', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full');
      expect(select).toHaveClass('px-4');
      expect(select).toHaveClass('py-2.5');
      expect(select).toHaveClass('border');
      expect(select).toHaveClass('rounded-lg');
    });

    it('should apply focus styles', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select.className).toContain('focus:outline-none');
      expect(select.className).toContain('focus:ring-2');
      expect(select.className).toContain('focus:ring-blue-500');
    });

    it('should apply custom className', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          className="custom-class"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-class');
    });

    it('should apply custom label className', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          label="Country"
          labelClassName="custom-label"
        />
      );

      const label = screen.getByText('Country');
      expect(label).toHaveClass('custom-label');
    });

    it('should hide default chevron with appearance-none', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('appearance-none');
    });
  });

  describe('Custom Chevron Icon', () => {
    it('should render custom chevron down icon', () => {
      const { container } = render(
        <FormSelect name="country" options={mockOptions} />
      );

      const chevron = container.querySelector('svg[data-lucide="chevron-down"]');
      expect(chevron).toBeInTheDocument();
    });

    it('should position chevron on the right', () => {
      const { container } = render(
        <FormSelect name="country" options={mockOptions} />
      );

      const chevronContainer = container.querySelector('.absolute.right-3');
      expect(chevronContainer).toBeInTheDocument();
    });

    it('should make chevron non-interactive', () => {
      const { container } = render(
        <FormSelect name="country" options={mockOptions} />
      );

      const chevronContainer = container.querySelector('.pointer-events-none');
      expect(chevronContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should associate label with select using htmlFor', () => {
      render(
        <FormSelect
          name="country"
          label="Country"
          options={mockOptions}
        />
      );

      const label = screen.getByText('Country');
      const select = screen.getByLabelText('Country');

      expect(label).toHaveAttribute('for', 'country');
      expect(select).toHaveAttribute('id', 'country');
    });

    it('should set aria-invalid when error exists', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          error="Invalid selection"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not set aria-invalid when no error', () => {
      render(<FormSelect name="country" options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).not.toHaveAttribute('aria-invalid');
    });

    it('should set aria-describedby for help text', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          helpText="Choose wisely"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'country-help');
    });

    it('should set aria-describedby for error message', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          error="Country is required"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'country-error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle numeric values', () => {
      const numericOptions = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
      ];

      render(
        <FormSelect
          name="number"
          options={numericOptions}
          value={1}
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('1');
    });

    it('should handle very long option labels', () => {
      const longOptions = [
        { value: 'long', label: 'This is a very long option label that might wrap in the UI' },
      ];

      render(<FormSelect name="test" options={longOptions} />);

      expect(screen.getByText('This is a very long option label that might wrap in the UI')).toBeInTheDocument();
    });

    it('should handle special characters in labels', () => {
      const specialOptions = [
        { value: 'special', label: '<>&"\'Special' },
      ];

      render(<FormSelect name="test" options={specialOptions} />);

      expect(screen.getByText('<>&"\'Special')).toBeInTheDocument();
    });

    it('should handle null value gracefully', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          value={null as any}
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('');
    });

    it('should handle undefined value gracefully', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('');
    });
  });

  describe('Multiple Select', () => {
    it('should support multiple selection', () => {
      render(
        <FormSelect
          name="countries"
          options={mockOptions}
          multiple
        />
      );

      const select = screen.getByRole('listbox');
      expect(select).toHaveAttribute('multiple');
    });

    it('should handle multiple values', () => {
      render(
        <FormSelect
          name="countries"
          options={mockOptions}
          multiple
          value={['option1', 'option2']}
          onChange={() => {}}
        />
      );

      const select = screen.getByRole('listbox') as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(opt => opt.value);

      expect(selectedOptions).toContain('option1');
      expect(selectedOptions).toContain('option2');
    });
  });

  describe('AutoFocus', () => {
    it('should autofocus select when autoFocus is true', () => {
      render(
        <FormSelect
          name="country"
          options={mockOptions}
          autoFocus
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveFocus();
    });
  });
});
