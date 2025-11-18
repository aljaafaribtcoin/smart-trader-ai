// Main Types Export
export * from './account';
export * from './trade';
export * from './market';
export * from './ai';
export * from './chat';
export * from './pattern';

// Common Types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
}

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  symbols?: string[];
  timeframes?: string[];
  status?: string[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}
