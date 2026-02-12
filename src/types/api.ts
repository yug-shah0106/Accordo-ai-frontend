/**
 * API response type definitions
 *
 * Standardized types for all API responses from the backend.
 */

import type {
  User,
  Company,
  Role,
  Permission,
  Project,
  Product,
  Requisition,
  Vendor,
  Contract,
  PurchaseOrder,
  DashboardStats,
} from './index';

// ============================================================================
// Generic API Response Wrapper
// ============================================================================

export interface ApiSuccess<T = any> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>; // Validation errors
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================================================
// Authentication API Responses
// ============================================================================

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ============================================================================
// User API Responses
// ============================================================================

export interface GetUserResponse {
  user: User;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
}

export interface CreateUserResponse {
  user: User;
  message: string;
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

// ============================================================================
// Company API Responses
// ============================================================================

export interface GetCompanyResponse {
  company: Company;
}

export interface ListCompaniesResponse {
  companies: Company[];
  total: number;
}

export interface CreateCompanyResponse {
  company: Company;
  message: string;
}

export interface UpdateCompanyResponse {
  company: Company;
  message: string;
}

// ============================================================================
// Role & Permission API Responses
// ============================================================================

export interface GetRoleResponse {
  role: Role;
  permissions?: Permission[];
}

export interface ListRolesResponse {
  roles: Role[];
  total: number;
}

export interface CreateRoleResponse {
  role: Role;
  message: string;
}

export interface UpdateRoleResponse {
  role: Role;
  message: string;
}

export interface ListPermissionsResponse {
  permissions: Permission[];
}

export interface UpdatePermissionsResponse {
  permissions: Permission[];
  message: string;
}

// ============================================================================
// Project API Responses
// ============================================================================

export interface GetProjectResponse {
  project: Project;
}

export interface ListProjectsResponse {
  projects: Project[];
  total: number;
}

export interface CreateProjectResponse {
  project: Project;
  message: string;
}

export interface UpdateProjectResponse {
  project: Project;
  message: string;
}

export interface DeleteProjectResponse {
  message: string;
}

// ============================================================================
// Product API Responses
// ============================================================================

export interface GetProductResponse {
  product: Product;
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
}

export interface CreateProductResponse {
  product: Product;
  message: string;
}

export interface UpdateProductResponse {
  product: Product;
  message: string;
}

// ============================================================================
// Requisition API Responses
// ============================================================================

export interface GetRequisitionResponse {
  requisition: Requisition;
}

export interface ListRequisitionsResponse {
  requisitions: Requisition[];
  total: number;
}

export interface CreateRequisitionResponse {
  requisition: Requisition;
  message: string;
}

export interface UpdateRequisitionResponse {
  requisition: Requisition;
  message: string;
}

export interface DeleteRequisitionResponse {
  message: string;
}

// ============================================================================
// Vendor API Responses
// ============================================================================

export interface GetVendorResponse {
  vendor: Vendor;
}

export interface ListVendorsResponse {
  vendors: Vendor[];
  total: number;
}

export interface CreateVendorResponse {
  vendor: Vendor;
  message: string;
}

export interface UpdateVendorResponse {
  vendor: Vendor;
  message: string;
}

export interface DeleteVendorResponse {
  message: string;
}

// ============================================================================
// Contract API Responses
// ============================================================================

export interface GetContractResponse {
  contract: Contract;
}

export interface ListContractsResponse {
  contracts: Contract[];
  total: number;
}

export interface CreateContractResponse {
  contract: Contract;
  message: string;
}

export interface UpdateContractResponse {
  contract: Contract;
  message: string;
}

export interface AcceptContractResponse {
  contract: Contract;
  message: string;
}

export interface RejectContractResponse {
  contract: Contract;
  message: string;
}

// ============================================================================
// Purchase Order API Responses
// ============================================================================

export interface GetPOResponse {
  po: PurchaseOrder;
}

export interface ListPOsResponse {
  pos: PurchaseOrder[];
  total: number;
}

export interface CreatePOResponse {
  po: PurchaseOrder;
  message: string;
}

export interface UpdatePOResponse {
  po: PurchaseOrder;
  message: string;
}

// ============================================================================
// Dashboard API Responses
// ============================================================================

export interface GetDashboardStatsResponse {
  stats: DashboardStats;
}

export interface GetDashboardChartsResponse {
  charts: {
    requisitionsByStatus: any;
    contractsByStatus: any;
    spendByMonth: any;
    topVendors: any;
  };
}

// ============================================================================
// File Upload Responses
// ============================================================================

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface MultiFileUploadResponse {
  files: FileUploadResponse[];
}

// ============================================================================
// Bulk Operation Responses
// ============================================================================

export interface BulkDeleteResponse {
  deleted: number;
  message: string;
}

export interface BulkUpdateResponse {
  updated: number;
  message: string;
}

// ============================================================================
// Export/Download Responses
// ============================================================================

export interface ExportResponse {
  url: string;
  filename: string;
  format: 'pdf' | 'csv' | 'xlsx';
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface DetailedApiError extends ApiError {
  statusCode: number;
  timestamp: string;
  path?: string;
  validationErrors?: ValidationError[];
}
