// TypeScript types for Table component
import { ReactNode } from "react";

export interface TableColumn {
  header: string;
  accessor: string;
  accessorKey?: string;
  accessorSubKey?: string;
  isBadge?: boolean;
  isRating?: (index: number) => number | undefined;
  isLink?: string;
}

export interface TableAction {
  type: 'button' | 'link';
  label: string;
  icon: ReactNode;
  link?: (row: any) => string;
  onClick?: (row: any) => void;
  state?: string | 'whole';
  condition?: (row: any) => boolean;
}

export interface TableProps {
  data: any[];
  columns: TableColumn[];
  actions: TableAction[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  style?: string;
  currentPage?: number;
  itemsPerPage?: number;
}
