// Shared TypeScript interfaces for management pages

// Table Column Definition
export interface TableColumn {
  header: string;
  accessor: string;
  accessorKey?: string;
  accessorSubKey?: string;
  isBadge?: boolean;
  isRating?: (index: number) => number | undefined;
  isLink?: string;
}

// Table Action Definition
export interface TableAction {
  type: 'button' | 'link';
  label: string;
  icon: React.ReactNode;
  link?: (row: any) => string;
  onClick?: (row: any) => void;
  state?: string | 'whole';
  condition?: (row: any) => boolean;
}

// Filter Definition
export interface FilterOption {
  moduleName: string;
  filterBy: string;
  controlType: 'checkbox' | 'rangeNumeric' | 'rangeDate' | 'inputText';
  label: string;
  description?: string;
  value: any;
  options?: string[];
  range?: [number, number];
  selected?: Record<string, boolean>;
}

// API Response Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  Role: {
    id: string;
    name: string;
  };
}

export interface Role {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  companyId: string;
  approvedContractCount?: number;
  contractCount?: number;
}

export interface VendorRow {
  vendorId: string;
  companyId: string;
  Vendor: Vendor;
}

export interface Company {
  id: string;
  companyName: string;
  establishmentDate: string;
  nature: string;
  gstNumber: string;
  gstFileUrl: string;
  panNumber: string;
  panFileUrl: string;
  msmeNumber: string;
  msmeFileUrl: string;
  ciNumber: string;
  ciFileUrl: string;
  type: string;
  pocName: string;
  pocDesignation: string;
  pocEmail: string;
  pocPhone: string;
  pocWebsite: string;
  bankName: string;
  beneficiaryName: string;
  accountNumber: string;
  ifscCode: string;
  fullAddress: string;
  Vendor: Vendor[];
}

export interface PurchaseOrder {
  id: string;
  requisitionId: string;
  vendorId: string;
  createdAt: string;
  status: 'Created' | 'Cancelled';
  Vendor: {
    name: string;
  };
}

export interface Project {
  id: string;
  Id: string;
  projectId: string;
  projectName: string;
  typeOfProject: string;
  projectAddress: string;
  tenureInDays: number;
  ProjectPoc: ProjectPoc[];
}

export interface ProjectPoc {
  userId: string;
  User: {
    name: string;
  };
}

export interface RequisitionProduct {
  id: string;
  qty: number;
  targetPrice: number;
  Product: {
    productName: string;
  };
}

export interface Contract {
  id: string;
  status: 'Created' | 'InitialQuotation' | 'Accepted' | 'Rejected';
  Vendor: {
    id: string;
    name: string;
  };
}

export interface RequisitionAttachment {
  id: string;
  attachmentUrl: string;
}

export interface Requisition {
  id?: string;
  rfqId?: string;
  subject: string;
  category: string;
  deliveryDate: string;
  negotiationClosureDate: string;
  benchmarkingDate: string;
  typeOfCurrency: string;
  totalPrice: number;
  status: 'Created' | 'Fulfilled' | 'Cancelled' | 'Benchmarked' | 'InitialQuotation' | 'NegotiationStarted';
  paymentTerms: string;
  benchmarkResponse?: string;
  Project: {
    projectId: string;
  };
  Contract: Contract[];
  RequisitionProduct: RequisitionProduct[];
  RequisitionAttachment: RequisitionAttachment[];
}

// useFetchData Hook Return Type
export interface UseFetchDataReturn<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  filters: string | undefined;
  setFilters: (filters: string | null | undefined) => void;
  search: string;
  setSearch: (search: string) => void;
  totalDoc: number;
  setTotalDoc: (total: number) => void;
  additionalData: {
    inactiveVendors: string | number;
    totalVendors: string | number;
  };
  refetch: () => Promise<void>;
}
