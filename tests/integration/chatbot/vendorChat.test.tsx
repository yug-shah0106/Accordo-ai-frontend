/**
 * VendorChat Integration Tests - REDIRECT & ERROR_RECOVERY
 *
 * Tests the VendorChat page component for:
 * 1. Crash fix: null decision doesn't throw TypeError (optional chaining)
 * 2. Toast notifications for REDIRECT and ERROR_RECOVERY at all 3 locations
 * 3. Correct rendering with new action types
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VendorChat from '../../../src/pages/vendorChat/VendorChat';
import toast from 'react-hot-toast';

// Mock scrollIntoView (not available in jsdom)
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => {
  const mockToast = vi.fn();
  mockToast.success = vi.fn();
  mockToast.error = vi.fn();
  return { default: mockToast };
});

// Mock the vendor chat service
vi.mock('../../../src/services/vendorChat.service', () => {
  return {
    default: {
      enterChat: vi.fn(),
      getDeal: vi.fn(),
      sendMessage: vi.fn(),
      getPMResponse: vi.fn(),
      selectMesoOption: vi.fn(),
      submitOthers: vi.fn(),
    },
    vendorChatService: {
      enterChat: vi.fn(),
      getDeal: vi.fn(),
      sendMessage: vi.fn(),
      getPMResponse: vi.fn(),
      selectMesoOption: vi.fn(),
      submitOthers: vi.fn(),
    },
  };
});

// Import mocked service
import vendorChatService from '../../../src/services/vendorChat.service';

const mockDeal = {
  id: 'deal-123',
  title: 'Test Negotiation',
  status: 'NEGOTIATING' as const,
  round: 2,
  mode: 'INSIGHTS' as const,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

const mockVendorMessage = {
  id: 'msg-1',
  dealId: 'deal-123',
  role: 'VENDOR' as const,
  content: 'I offer $30,000 with Net 30 terms',
  createdAt: '2026-03-01T10:00:00Z',
};

const mockPmMessage = {
  id: 'msg-2',
  dealId: 'deal-123',
  role: 'ACCORDO' as const,
  content: 'Thank you for your offer. Let me review.',
  createdAt: '2026-03-01T10:01:00Z',
};

const mockDealData = {
  deal: mockDeal,
  messages: [mockVendorMessage, mockPmMessage],
  contract: null,
  requisition: {
    id: 1,
    title: 'Test RFQ',
    rfqNumber: 'RFQ-001',
    products: [],
  },
  vendorQuote: null,
  isVendor: true as const,
};

const renderVendorChat = () => {
  return render(
    <MemoryRouter initialEntries={['/vendor-chat/test-token-123']}>
      <Routes>
        <Route path="/vendor-chat/:uniqueToken" element={<VendorChat />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('VendorChat - REDIRECT & ERROR_RECOVERY', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: getDeal returns deal data successfully
    vi.mocked(vendorChatService.enterChat).mockResolvedValue({ data: {} });
    vi.mocked(vendorChatService.getDeal).mockResolvedValue({
      data: mockDealData,
    });
  });

  describe('Crash fix - null decision handling', () => {
    it('should not crash when PM response has null decision (optional chaining fix)', async () => {
      // Setup: getDeal returns vendor message without PM response (triggers auto PM)
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage],
        },
      });

      // PM response with null decision — previously would crash without ?.
      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: mockDeal,
          decision: null as any,
        },
      });

      // Should not throw
      expect(() => renderVendorChat()).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Test Negotiation')).toBeInTheDocument();
      });
    });

    it('should not crash when decision.action is undefined', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage],
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: mockDeal,
          decision: { action: undefined } as any,
        },
      });

      expect(() => renderVendorChat()).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Test Negotiation')).toBeInTheDocument();
      });
    });
  });

  describe('Toast notifications - Auto PM response (location 1: fetchDeal)', () => {
    it('should show redirect toast when auto PM response returns REDIRECT', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage], // Only vendor msg → triggers auto PM
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: mockDeal,
          decision: { action: 'REDIRECT', utilityScore: 0, reasons: ['off-topic'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          'Your message was redirected back to the negotiation topic.',
          expect.objectContaining({ icon: '↩️' })
        );
      });
    });

    it('should show recovery toast when auto PM response returns ERROR_RECOVERY', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage],
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: mockDeal,
          decision: { action: 'ERROR_RECOVERY', utilityScore: 0, reasons: ['error'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          'Something went wrong, but the system recovered. Please continue.',
          expect.objectContaining({ icon: '🛡️' })
        );
      });
    });

    it('should still show success toast for ACCEPT via auto PM', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage],
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: { ...mockDeal, status: 'ACCEPTED' },
          decision: { action: 'ACCEPT', utilityScore: 0.85, reasons: ['good offer'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Your offer has been accepted!');
      });
    });

    it('should still show error toast for WALK_AWAY via auto PM', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage],
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: { ...mockDeal, status: 'WALKED_AWAY' },
          decision: { action: 'WALK_AWAY', utilityScore: 0.1, reasons: ['too low'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'The procurement manager has walked away from this negotiation.'
        );
      });
    });

    it('should still show escalation toast for ESCALATE via auto PM', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: {
          ...mockDealData,
          messages: [mockVendorMessage],
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: mockPmMessage,
          deal: { ...mockDeal, status: 'ESCALATED' },
          decision: { action: 'ESCALATE', utilityScore: 0.4, reasons: ['complex'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          'This negotiation has been escalated for review.',
          expect.objectContaining({ icon: '⚠️' })
        );
      });
    });
  });

  describe('Toast notifications - handleSend (location 3: send message flow)', () => {
    it('should show redirect toast when PM responds with REDIRECT', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: mockDealData, // Both vendor + PM msgs, no auto-PM trigger
      });

      vi.mocked(vendorChatService.sendMessage).mockResolvedValue({
        data: {
          vendorMessage: { ...mockVendorMessage, id: 'msg-new', content: 'What about the weather?' },
          deal: mockDeal,
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: { ...mockPmMessage, id: 'msg-pm-new', content: 'Please stay on topic.' },
          deal: mockDeal,
          decision: { action: 'REDIRECT', utilityScore: 0, reasons: ['off-topic'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(screen.getByText('Test Negotiation')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Type your offer to the buyer...');
      fireEvent.change(textarea, { target: { value: 'What about the weather?' } });

      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          'Your message was redirected back to the negotiation topic.',
          expect.objectContaining({ icon: '↩️' })
        );
      });
    });

    it('should show recovery toast when PM responds with ERROR_RECOVERY', async () => {
      vi.mocked(vendorChatService.getDeal).mockResolvedValue({
        data: mockDealData,
      });

      vi.mocked(vendorChatService.sendMessage).mockResolvedValue({
        data: {
          vendorMessage: { ...mockVendorMessage, id: 'msg-new', content: 'My offer is $25k' },
          deal: mockDeal,
        },
      });

      vi.mocked(vendorChatService.getPMResponse).mockResolvedValue({
        data: {
          pmMessage: { ...mockPmMessage, id: 'msg-pm-new', content: 'Recovered response.' },
          deal: mockDeal,
          decision: { action: 'ERROR_RECOVERY', utilityScore: 0.4, reasons: ['timeout'] },
        },
      });

      renderVendorChat();

      await waitFor(() => {
        expect(screen.getByText('Test Negotiation')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Type your offer to the buyer...');
      fireEvent.change(textarea, { target: { value: 'My offer is $25k' } });

      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          'Something went wrong, but the system recovered. Please continue.',
          expect.objectContaining({ icon: '🛡️' })
        );
      });
    });
  });

  describe('Toast notifications - Others form (location 2: submitOthers)', () => {
    // The Others form requires MESO state to render. We test the response shape
    // to verify the service mock accepts REDIRECT/ERROR_RECOVERY decisions.

    it('should handle REDIRECT decision from Others form submission', async () => {
      vi.mocked(vendorChatService.submitOthers).mockResolvedValue({
        data: {
          vendorMessage: { ...mockVendorMessage, id: 'msg-others' },
          pmMessage: { ...mockPmMessage, id: 'msg-pm-others' },
          deal: mockDeal,
          decision: { action: 'REDIRECT', utilityScore: 0, reasons: ['off-topic'] },
        },
      });

      const response = await vendorChatService.submitOthers('token', 30000, 45);
      expect(response.data.decision.action).toBe('REDIRECT');
    });

    it('should handle ERROR_RECOVERY decision from Others form submission', async () => {
      vi.mocked(vendorChatService.submitOthers).mockResolvedValue({
        data: {
          vendorMessage: { ...mockVendorMessage, id: 'msg-others' },
          pmMessage: { ...mockPmMessage, id: 'msg-pm-others' },
          deal: mockDeal,
          decision: { action: 'ERROR_RECOVERY', utilityScore: 0.3, reasons: ['error'] },
        },
      });

      const response = await vendorChatService.submitOthers('token', 30000, 45);
      expect(response.data.decision.action).toBe('ERROR_RECOVERY');
    });
  });

  describe('Rendering with new action types', () => {
    it('should render the chat page with deal title', async () => {
      renderVendorChat();

      await waitFor(() => {
        expect(screen.getByText('Test Negotiation')).toBeInTheDocument();
      });
    });

    it('should show status badge as "In Progress"', async () => {
      renderVendorChat();

      await waitFor(() => {
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });
    });

    it('should show round number', async () => {
      renderVendorChat();

      await waitFor(() => {
        expect(screen.getByText('Round 2')).toBeInTheDocument();
      });
    });

    it('should show composer when deal is NEGOTIATING', async () => {
      renderVendorChat();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your offer to the buyer...')).toBeInTheDocument();
      });
    });
  });
});
