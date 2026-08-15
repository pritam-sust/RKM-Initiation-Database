export interface PersonRecord {
  id: string;
  unique_id: string;
  name: string;
  address: string;
  diksha_date?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export type ParseStatus = 'valid' | 'duplicate' | 'invalid';

export interface ParsedRecord {
  tempId: string;
  unique_id: string;
  name: string;
  address: string;
  diksha_date?: string | null;
  status: ParseStatus;
  errorMessage?: string;
  selected?: boolean;
}

export interface ParseSummary {
  total: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  records: ParsedRecord[];
}

export interface SearchQueryOptions {
  query?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
