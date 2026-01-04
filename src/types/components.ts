/**
 * Component prop type definitions
 *
 * Types for all reusable component props across the application.
 */

import type { ReactNode, CSSProperties } from 'react';

// ============================================================================
// Common Component Props
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface ClickableProps {
  onClick?: () => void;
  disabled?: boolean;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

// ============================================================================
// Button Component Props
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends BaseComponentProps, ClickableProps, LoadingProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

// ============================================================================
// Form Component Props
// ============================================================================

export interface InputProps extends BaseComponentProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string | number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface TextAreaProps extends Omit<InputProps, 'type'> {
  rows?: number;
  cols?: number;
  resize?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  name: string;
  value?: string | number;
  onChange?: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface CheckboxProps extends BaseComponentProps {
  name: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export interface RadioProps extends BaseComponentProps {
  name: string;
  value: string | number;
  checked?: boolean;
  onChange?: (value: string | number) => void;
  label?: string;
  disabled?: boolean;
}

// ============================================================================
// Modal Component Props
// ============================================================================

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
}

// ============================================================================
// Table Component Props
// ============================================================================

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => any);
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

// ============================================================================
// Card Component Props
// ============================================================================

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

// ============================================================================
// Badge Component Props
// ============================================================================

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
}

// ============================================================================
// Dropdown Component Props
// ============================================================================

export interface DropdownItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onSelect?: (value: string | number) => void;
  closeOnSelect?: boolean;
}

// ============================================================================
// Pagination Component Props
// ============================================================================

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

// ============================================================================
// Tabs Component Props
// ============================================================================

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends BaseComponentProps {
  tabs: Tab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'line' | 'enclosed' | 'pills';
}

// ============================================================================
// Toast/Notification Component Props
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Breadcrumb Component Props
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

// ============================================================================
// Avatar Component Props
// ============================================================================

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  fallbackIcon?: ReactNode;
}

// ============================================================================
// Spinner/Loader Component Props
// ============================================================================

export interface SpinnerProps extends BaseComponentProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  label?: string;
}

// ============================================================================
// Empty State Component Props
// ============================================================================

export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Stepper Component Props
// ============================================================================

export interface StepperStep {
  id: string | number;
  label: string;
  description?: string;
  status?: 'pending' | 'current' | 'completed' | 'error';
}

export interface StepperProps extends BaseComponentProps {
  steps: StepperStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (stepIndex: number) => void;
}

// ============================================================================
// Chart Component Props
// ============================================================================

export interface ChartProps extends BaseComponentProps {
  data: any;
  options?: any;
  type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  height?: number;
  width?: number;
}

// ============================================================================
// Sidebar Component Props
// ============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  children?: SidebarItem[];
  badge?: string | number;
}

export interface SidebarProps extends BaseComponentProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  logo?: ReactNode;
  footer?: ReactNode;
}

// ============================================================================
// File Upload Component Props
// ============================================================================

export interface FileUploadProps extends BaseComponentProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}
