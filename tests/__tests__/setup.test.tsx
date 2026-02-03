import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';

describe('Frontend Test Setup Verification', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('should work with renderWithProviders', () => {
    const TestComponent = () => <div>With Providers</div>;
    renderWithProviders(<TestComponent />);
    expect(screen.getByText('With Providers')).toBeInTheDocument();
  });
});
