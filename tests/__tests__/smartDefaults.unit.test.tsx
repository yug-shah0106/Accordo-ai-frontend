import { describe, it, expect, vi } from 'vitest';
import { createMockSmartDefaults } from '../factories';

describe('Smart Defaults - Date Auto-Fill Unit Tests', () => {
  describe('Date Extraction Logic', () => {
    it('should extract maxDeliveryDate from smart defaults', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: null,
        },
      });

      // Act
      const maxDeliveryDate = mockSmartDefaults.delivery.maxDeliveryDate;

      // Assert
      expect(maxDeliveryDate).toBe('2026-03-20');
      expect(maxDeliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should extract negotiationClosureDate from smart defaults', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: null,
          negotiationClosureDate: '2026-02-28',
        },
      });

      // Act
      const negotiationClosureDate = mockSmartDefaults.delivery.negotiationClosureDate;

      // Assert
      expect(negotiationClosureDate).toBe('2026-02-28');
      expect(negotiationClosureDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle both dates when both are present', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      // Act & Assert
      expect(mockSmartDefaults.delivery.maxDeliveryDate).toBe('2026-03-20');
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toBe('2026-02-28');
    });

    it('should handle null dates', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: null,
          negotiationClosureDate: null,
        },
      });

      // Act & Assert
      expect(mockSmartDefaults.delivery.maxDeliveryDate).toBeNull();
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toBeNull();
    });
  });

  describe('Nullish Coalescing Logic', () => {
    it('should preserve existing value over null smart default', () => {
      // Arrange
      const existingRequiredDate = '2026-04-01';
      const smartDefaultMaxDeliveryDate = null;

      // Act - Simulate nullish coalescing operator (??)
      const result = existingRequiredDate ?? smartDefaultMaxDeliveryDate ?? '';

      // Assert
      expect(result).toBe('2026-04-01');
    });

    it('should use smart default when existing value is null', () => {
      // Arrange
      const existingRequiredDate = null;
      const smartDefaultMaxDeliveryDate = '2026-03-20';

      // Act - Simulate nullish coalescing operator (??)
      const result = existingRequiredDate ?? smartDefaultMaxDeliveryDate ?? '';

      // Assert
      expect(result).toBe('2026-03-20');
    });

    it('should use empty string when both values are null', () => {
      // Arrange
      const existingRequiredDate = null;
      const smartDefaultMaxDeliveryDate = null;

      // Act - Simulate nullish coalescing operator (??)
      const result = existingRequiredDate ?? smartDefaultMaxDeliveryDate ?? '';

      // Assert
      expect(result).toBe('');
    });

    it('should preserve user input (empty string) over smart default', () => {
      // Arrange
      const existingRequiredDate = '';
      const smartDefaultMaxDeliveryDate = '2026-03-20';

      // Act - Using ?? operator (empty string is truthy for ??)
      const result = existingRequiredDate ?? smartDefaultMaxDeliveryDate ?? '';

      // Assert
      expect(result).toBe(''); // Empty string is preserved
    });
  });

  describe('Date Format Validation', () => {
    it('should accept YYYY-MM-DD format', () => {
      // Arrange
      const dates = ['2026-03-20', '2026-02-28', '2030-12-31', '2020-01-01'];

      // Act & Assert
      dates.forEach(date => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should reject invalid date formats', () => {
      // Arrange
      const invalidDates = [
        '03-20-2026',
        '2026/03/20',
        '20-03-2026',
        '2026-3-20',
        '2026-03-20T10:30:00Z',
      ];

      // Act & Assert
      invalidDates.forEach(date => {
        expect(date).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should not contain time components', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      // Assert
      expect(mockSmartDefaults.delivery.maxDeliveryDate).not.toContain('T');
      expect(mockSmartDefaults.delivery.maxDeliveryDate).not.toContain(':');
      expect(mockSmartDefaults.delivery.negotiationClosureDate).not.toContain('T');
      expect(mockSmartDefaults.delivery.negotiationClosureDate).not.toContain(':');
    });
  });

  describe('Smart Defaults Structure', () => {
    it('should have delivery object with date fields', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      // Assert
      expect(mockSmartDefaults).toHaveProperty('delivery');
      expect(mockSmartDefaults.delivery).toHaveProperty('typicalDeliveryDays');
      expect(mockSmartDefaults.delivery).toHaveProperty('maxDeliveryDate');
      expect(mockSmartDefaults.delivery).toHaveProperty('negotiationClosureDate');
    });

    it('should maintain backwards compatibility with existing fields', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        priceQuantity: {
          targetUnitPrice: 50,
          maxAcceptablePrice: 60,
          volumeDiscountExpectation: 5,
        },
        paymentTerms: {
          minDays: 30,
          maxDays: 60,
          advancePaymentLimit: 20,
          acceptedMethods: 'Bank Transfer',
        },
      });

      // Assert
      expect(mockSmartDefaults).toHaveProperty('priceQuantity');
      expect(mockSmartDefaults).toHaveProperty('paymentTerms');
      expect(mockSmartDefaults).toHaveProperty('source');
      expect(mockSmartDefaults).toHaveProperty('confidence');
      expect(mockSmartDefaults.priceQuantity.targetUnitPrice).toBe(50);
      expect(mockSmartDefaults.priceQuantity.maxAcceptablePrice).toBe(60);
    });

    it('should handle optional date fields', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          // No maxDeliveryDate or negotiationClosureDate
        },
      });

      // Assert
      expect(mockSmartDefaults.delivery.typicalDeliveryDays).toBe(14);
      // Optional fields may be undefined or null
      expect([undefined, null]).toContain(mockSmartDefaults.delivery.maxDeliveryDate);
      expect([undefined, null]).toContain(mockSmartDefaults.delivery.negotiationClosureDate);
    });
  });

  describe('TypeScript Interface Compliance', () => {
    it('should match SmartDefaults interface shape', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults();

      // Assert - Check all required top-level properties
      expect(mockSmartDefaults).toHaveProperty('priceQuantity');
      expect(mockSmartDefaults).toHaveProperty('paymentTerms');
      expect(mockSmartDefaults).toHaveProperty('delivery');
      expect(mockSmartDefaults).toHaveProperty('source');
      expect(mockSmartDefaults).toHaveProperty('confidence');

      // Check nested delivery properties
      expect(typeof mockSmartDefaults.delivery.typicalDeliveryDays).toBe('number');
      expect(typeof mockSmartDefaults.source).toBe('string');
      expect(typeof mockSmartDefaults.confidence).toBe('number');
    });

    it('should have correct types for date fields', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2026-03-20',
          negotiationClosureDate: '2026-02-28',
        },
      });

      // Assert
      expect(typeof mockSmartDefaults.delivery.maxDeliveryDate).toBe('string');
      expect(typeof mockSmartDefaults.delivery.negotiationClosureDate).toBe('string');
    });

    it('should accept null for optional date fields', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: null,
          negotiationClosureDate: null,
        },
      });

      // Assert
      expect(mockSmartDefaults.delivery.maxDeliveryDate).toBeNull();
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle past dates', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2020-01-01',
          negotiationClosureDate: '2019-12-31',
        },
      });

      // Assert - Should accept past dates (validation happens in UI)
      expect(mockSmartDefaults.delivery.maxDeliveryDate).toBe('2020-01-01');
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toBe('2019-12-31');
    });

    it('should handle future dates', () => {
      // Arrange
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: '2030-12-31',
          negotiationClosureDate: '2030-11-30',
        },
      });

      // Assert
      expect(mockSmartDefaults.delivery.maxDeliveryDate).toBe('2030-12-31');
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toBe('2030-11-30');
    });

    it('should handle same date for both fields', () => {
      // Arrange
      const sameDate = '2026-03-15';
      const mockSmartDefaults = createMockSmartDefaults({
        delivery: {
          typicalDeliveryDays: 14,
          maxDeliveryDate: sameDate,
          negotiationClosureDate: sameDate,
        },
      });

      // Assert
      expect(mockSmartDefaults.delivery.maxDeliveryDate).toBe(sameDate);
      expect(mockSmartDefaults.delivery.negotiationClosureDate).toBe(sameDate);
    });
  });
});
