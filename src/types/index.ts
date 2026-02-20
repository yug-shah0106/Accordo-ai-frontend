/**
 * Core type definitions for Accordo AI Platform
 *
 * This file contains all shared types used across the application.
 * For chatbot-specific types, see ./chatbot.ts
 * For API response types, see ./api.ts
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserType = 'admin' | 'customer' | 'vendor';

export interface User {
  id: number;
  name: string;
  email: string;
  userType: UserType;
  companyId: number;
  roleId?: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  Company?: Company;
  Role?: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType?: UserType;
}

// ============================================================================
// Company & Organization Types
// ============================================================================

export interface Company {
  id: number;
  name: string;
  type: 'customer' | 'vendor';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Role & Permission Types
// ============================================================================

export interface Module {
  id: number;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  roleId: number;
  moduleId: number;
  permissionLevel: 1 | 2 | 3 | 4; // 1=read, 2=create, 3=update, 4=delete
  createdAt: string;
  updatedAt: string;
  Role?: Role;
  Module?: Module;
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
  id: number;
  name: string;
  description?: string;
  companyId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  Company?: Company;
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  Company?: Company;
}

// ============================================================================
// Requisition Types
// ============================================================================

export type RequisitionStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Requisition {
  id: number;
  title: string;
  description?: string;
  projectId: number;
  status: RequisitionStatus;
  quantity?: number;
  estimatedBudget?: number;
  targetPrice?: number;
  batna?: number;
  maxDiscount?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  Project?: Project;
  Creator?: User;
  Vendors?: Vendor[];
}

// ============================================================================
// Vendor Types
// ============================================================================

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  companyId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  Company?: Company;
}

// ============================================================================
// Contract Types
// ============================================================================

export type ContractStatus = 'draft' | 'sent' | 'negotiating' | 'accepted' | 'rejected';

export interface Contract {
  id: number;
  requisitionId: number;
  vendorId: number;
  status: ContractStatus;
  terms?: string;
  price?: number;
  token?: string; // For vendor portal access
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  Requisition?: Requisition;
  Vendor?: Vendor;
  Creator?: User;
}

// ============================================================================
// Purchase Order Types
// ============================================================================

export type POStatus = 'draft' | 'issued' | 'received' | 'completed';

export interface PurchaseOrder {
  id: number;
  contractId: number;
  poNumber: string;
  status: POStatus;
  totalAmount: number;
  issuedDate?: string;
  receivedDate?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  Contract?: Contract;
  Creator?: User;
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface DashboardStats {
  totalRequisitions: number;
  activeContracts: number;
  totalVendors: number;
  totalSpend: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormStep {
  id: number;
  title: string;
  isValid?: boolean;
}

export interface FormError {
  field: string;
  message: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type ID = string | number;

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Export all types
// ============================================================================

export * from './chatbot';
export * from './api';
export * from './components';
export * from './hooks';
export * from './dashboard';
