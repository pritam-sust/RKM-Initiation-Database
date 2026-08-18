'use client';

import { PersonFilterOptions } from '@/types';
import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

interface SearchFormProps {
  initialFilters: PersonFilterOptions;
  onSearch: (filters: PersonFilterOptions) => void;
  isLoading?: boolean;
}

export default function SearchForm({ initialFilters, onSearch, isLoading }: SearchFormProps) {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<PersonFilterOptions>(initialFilters);

  const publicFilterKeys: (keyof PersonFilterOptions)[] = [
    'unique_id',
    'name',
    'diksha_date',
    'diksha_guru',
  ];

  const activeFilterCount = publicFilterKeys.reduce((acc, key) => {
    return filters[key] && filters[key]?.trim() ? acc + 1 : acc;
  }, 0);

  const handleGlobalQueryChange = (val: string) => {
    setFilters((prev) => ({ ...prev, q: val }));
  };

  const handleFieldChange = (key: keyof PersonFilterOptions, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const emptyFilters: PersonFilterOptions = {
      q: '',
      unique_id: '',
      name: '',
      father_or_spouse_name: '',
      age: '',
      address: '',
      mobile_number: '',
      occupation: '',
      education: '',
      diksha_date: '',
      diksha_guru: '',
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {/* Search Bar */}
      <div className="search-container-box">
        <div className="d-flex align-items-center ps-2 pe-1 text-muted">
          <Search size={22} className="text-secondary" />
        </div>
        <input
          type="text"
          className="search-input-field flex-grow-1"
          placeholder={t('searchPlaceholder')}
          value={filters.q || ''}
          onChange={(e) => handleGlobalQueryChange(e.target.value)}
          disabled={isLoading}
          aria-label="Search"
        />

        {/* Clear query button */}
        {filters.q && (
          <button
            type="button"
            className="btn-icon-ghost"
            onClick={() => handleGlobalQueryChange('')}
            title={t('resetBtn')}
          >
            <X size={18} />
          </button>
        )}

        {/* Filter Drawer Toggle */}
        <button
          type="button"
          className={`btn btn-sm d-flex align-items-center gap-1 px-3 py-2 rounded-3 border transition-all ${
            showAdvanced || activeFilterCount > 0
              ? 'btn-light border-secondary text-dark fw-bold'
              : 'btn-light border-slate-200 text-secondary'
          }`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          title={t('filters')}
        >
          <SlidersHorizontal size={16} />
          <span className="d-none d-sm-inline">{t('filters')}</span>
          {activeFilterCount > 0 && (
            <span className="badge rounded-pill bg-dark text-white px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
              {activeFilterCount}
            </span>
          )}
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Submit Action */}
        <button
          type="submit"
          className="btn-rkm-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>{t('searchBtn')}</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>{t('searchBtn')}</span>
            </>
          )}
        </button>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvanced && (
        <div className="filter-drawer-card mt-3 animate-fade-in">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
            <div className="d-flex align-items-center gap-2">
              <SlidersHorizontal size={16} className="text-secondary" />
              <span className="fw-bold text-dark fs-6">{t('advancedFilters')}</span>
              {activeFilterCount > 0 && (
                <span className="chip-tag chip-orange">
                  {activeFilterCount} {t('activeFiltersCount')}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm text-danger text-decoration-none p-0 d-flex align-items-center gap-1"
                onClick={handleClear}
              >
                <RotateCcw size={14} />
                <span>{t('clearFilters')}</span>
              </button>
            )}
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-custom">{t('uniqueId')}</label>
              <input
                type="text"
                className="form-control-custom font-mono"
                placeholder={t('uniqueId')}
                value={filters.unique_id || ''}
                onChange={(e) => handleFieldChange('unique_id', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-custom">{t('name')}</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder={t('name')}
                value={filters.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-custom">{t('dikshaGuru')}</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder={t('dikshaGuru')}
                value={filters.diksha_guru || ''}
                onChange={(e) => handleFieldChange('diksha_guru', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-custom">{t('dikshaDate')}</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder={t('dikshaDate')}
                value={filters.diksha_date || ''}
                onChange={(e) => handleFieldChange('diksha_date', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 d-flex justify-content-end gap-2 border-top border-light">
            <button
              type="button"
              className="btn btn-sm btn-light border px-3 rounded-3"
              onClick={() => setShowAdvanced(false)}
            >
              {t('hideFilters')}
            </button>
            <button
              type="submit"
              className="btn-rkm-primary btn-sm px-4"
              disabled={isLoading}
            >
              <Search size={14} />
              <span>{t('applyFilters')}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
