/**
 * Hook return type definitions
 *
 * Types for return values of all custom hooks in the application.
 */

import type {
  Deal,
  Message,
  NegotiationConfig,
  ConversationState,
  CreateDealInput,
  ListDealsParams,
} from './chatbot';

// ============================================================================
// Chatbot Hooks
// ============================================================================

/**
 * useDeal - Simple deal management hook
 */
export interface UseDealReturn {
  deal: Deal | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, role?: 'VENDOR' | 'ACCORDO') => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * useDealActions - Advanced deal management with permissions
 */
export interface UseDealActionsReturn {
  // State
  deal: Deal | null;
  messages: Message[];
  config: NegotiationConfig | null;
  loading: boolean;
  error: string | null;
  sending: boolean;

  // Permissions
  canNegotiate: boolean;
  canSend: boolean;
  canReset: boolean;

  // Computed values
  maxRounds: number;

  // Actions
  sendVendorMessage: (content: string) => Promise<void>;
  reset: () => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * useConversation - Conversation mode hook
 */
export interface UseConversationReturn {
  // State
  deal: Deal | null;
  messages: Message[];
  conversationState: ConversationState | null;
  loading: boolean;
  sending: boolean;
  error: string | null;

  // Flags
  canSend: boolean;
  isTerminal: boolean;
  revealAvailable: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * useDeals - Deal listing hook
 */
export interface UseDealsReturn {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  filters: ListDealsParams;
  setFilters: (filters: ListDealsParams) => void;
  createDeal: (data: CreateDealInput) => Promise<Deal>;
  archiveDeal: (dealId: string) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  reload: () => Promise<void>;
}

// ============================================================================
// Form Hooks
// ============================================================================

/**
 * useMultiStepForm - Multi-step form management
 */
export interface UseMultiStepFormReturn<T = any> {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  formData: Partial<T>;
  errors: Record<string, string>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<T>) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  validateStep: () => boolean;
  reset: () => void;
}

/**
 * useFormValidation - Form validation hook
 */
export interface UseFormValidationReturn<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
}

// ============================================================================
// Data Fetching Hooks
// ============================================================================

/**
 * useApi - Generic API hook
 */
export interface UseApiReturn<T, P = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: P) => Promise<void>;
  mutate: (newData: T | null) => void;
}

/**
 * usePagination - Pagination hook
 */
export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

/**
 * useInfiniteScroll - Infinite scroll hook
 */
export interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// UI State Hooks
// ============================================================================

/**
 * useModal - Modal state management
 */
export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * useDisclosure - Generic disclosure state
 */
export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

/**
 * useToast - Toast notification hook
 */
export interface UseToastReturn {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastOptions {
  duration?: number;
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * useTabs - Tabs state management
 */
export interface UseTabsReturn {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isActive: (tabId: string) => boolean;
}

// ============================================================================
// Storage Hooks
// ============================================================================

/**
 * useLocalStorage - Local storage hook
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

/**
 * useSessionStorage - Session storage hook
 */
export interface UseSessionStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// ============================================================================
// Authentication Hooks
// ============================================================================

/**
 * useAuth - Authentication hook
 */
export interface UseAuthReturn {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * usePermissions - Permissions check hook
 */
export interface UsePermissionsReturn {
  hasPermission: (moduleId: number, level: 1 | 2 | 3 | 4) => boolean;
  canRead: (moduleId: number) => boolean;
  canCreate: (moduleId: number) => boolean;
  canUpdate: (moduleId: number) => boolean;
  canDelete: (moduleId: number) => boolean;
  permissions: any[];
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * useDebounce - Debounce hook
 */
export interface UseDebounceReturn<T> {
  debouncedValue: T;
}

/**
 * useThrottle - Throttle hook
 */
export interface UseThrottleReturn<T> {
  throttledValue: T;
}

/**
 * useCopyToClipboard - Copy to clipboard hook
 */
export interface UseCopyToClipboardReturn {
  copiedText: string | null;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * useMediaQuery - Media query hook
 */
export interface UseMediaQueryReturn {
  matches: boolean;
}

/**
 * useOnClickOutside - Click outside detection hook
 */
export type UseOnClickOutsideReturn = void;

/**
 * useWindowSize - Window size hook
 */
export interface UseWindowSizeReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * useToggle - Toggle state hook
 */
export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

// ============================================================================
// Timer Hooks
// ============================================================================

/**
 * useInterval - Interval hook
 */
export type UseIntervalReturn = void;

/**
 * useTimeout - Timeout hook
 */
export type UseTimeoutReturn = void;

/**
 * useCountdown - Countdown hook
 */
export interface UseCountdownReturn {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}
