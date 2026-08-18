export interface PersonRecord {
  id: string;
  unique_id: string;
  name: string;
  father_or_spouse_name?: string | null;
  age?: string | null;
  address: string;
  mobile_number?: string | null;
  occupation?: string | null;
  education?: string | null;
  diksha_date?: string | null;
  diksha_date_sort?: string | null;
  diksha_guru?: string | null;
  diksha_venue?: string | null;
  diksha_ceremony_serial?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export type ParseStatus = 'valid' | 'duplicate' | 'invalid';

export interface ParsedRecord {
  tempId: string;
  unique_id: string;
  name: string;
  father_or_spouse_name?: string | null;
  age?: string | null;
  address: string;
  mobile_number?: string | null;
  occupation?: string | null;
  education?: string | null;
  diksha_date?: string | null;
  diksha_date_sort?: string | null;
  diksha_guru?: string | null;
  diksha_venue?: string | null;
  diksha_ceremony_serial?: string | null;
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

export interface PersonFilterOptions {
  q?: string;
  unique_id?: string;
  name?: string;
  father_or_spouse_name?: string;
  age?: string;
  address?: string;
  mobile_number?: string;
  occupation?: string;
  education?: string;
  diksha_date?: string;
  diksha_guru?: string;
  diksha_venue?: string;
  diksha_ceremony_serial?: string;
}

export interface SearchQueryOptions extends PersonFilterOptions {
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
