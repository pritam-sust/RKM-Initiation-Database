'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchForm({ initialQuery = '', onSearch, isLoading }: SearchFormProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="card border-0 shadow-lg bg-body rounded-4 overflow-hidden p-2">
        <div className="input-group input-group-lg border-0">
          <span className="input-group-text bg-transparent border-0 pe-1 text-primary">
            <Search className="w-6 h-6" />
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none fs-5 py-3 text-dark bg-transparent"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              className="btn bg-transparent border-0 text-muted hover-text-dark me-2"
              onClick={handleClear}
              disabled={isLoading}
              title={t('resetBtn')}
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary px-4 px-md-5 rounded-3 font-semibold shadow-sm d-flex align-items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>{t('searchBtn')}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{t('searchBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
