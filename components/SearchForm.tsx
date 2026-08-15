'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { PersonFilterOptions } from '@/types';

interface SearchFormProps {
  initialFilters: PersonFilterOptions;
  onSearch: (filters: PersonFilterOptions) => void;
  isLoading?: boolean;
}

export default function SearchForm({ initialFilters, onSearch, isLoading }: SearchFormProps) {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<PersonFilterOptions>(initialFilters);

  // Count active specific filters (excluding global query 'q')
  const specificFilterKeys: (keyof PersonFilterOptions)[] = [
    'unique_id',
    'name',
    'father_or_spouse_name',
    'age',
    'address',
    'mobile_number',
    'occupation',
    'education',
    'diksha_date',
    'diksha_guru',
  ];

  const activeFilterCount = specificFilterKeys.reduce((acc, key) => {
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
      {/* Main Search Bar Card */}
      <div className="card border-0 shadow-lg bg-body rounded-4 overflow-hidden p-2">
        <div className="input-group input-group-lg border-0">
          <span className="input-group-text bg-transparent border-0 pe-1 text-primary">
            <Search className="w-6 h-6" />
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none fs-5 py-3 text-dark bg-transparent"
            placeholder={t('searchPlaceholder')}
            value={filters.q || ''}
            onChange={(e) => handleGlobalQueryChange(e.target.value)}
            disabled={isLoading}
            aria-label="Search"
          />

          {/* Filter Toggle Button */}
          <button
            type="button"
            className={`btn border-0 d-flex align-items-center gap-1.5 px-3 my-1 rounded-3 transition-all ${
              showAdvanced || activeFilterCount > 0
                ? 'btn-light text-primary fw-semibold'
                : 'btn-light text-secondary'
            }`}
            onClick={() => setShowAdvanced(!showAdvanced)}
            title={t('filters')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="d-none d-sm-inline">{t('filters')}</span>
            {activeFilterCount > 0 && (
              <span className="badge bg-primary text-white rounded-pill px-2 py-0.5 small">
                {activeFilterCount}
              </span>
            )}
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5 ms-0.5 text-muted" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ms-0.5 text-muted" />
            )}
          </button>

          {/* Clear button if any filter or query is present */}
          {(filters.q || activeFilterCount > 0) && (
            <button
              type="button"
              className="btn bg-transparent border-0 text-muted hover-text-dark me-1"
              onClick={handleClear}
              disabled={isLoading}
              title={t('resetBtn')}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Submit Search Button */}
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

      {/* Advanced Filter Collapse Panel */}
      {showAdvanced && (
        <div className="card border-0 shadow-sm rounded-4 mt-3 p-3 p-md-4 bg-body animate-fade-in">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span className="fw-bold text-dark">{t('advancedFilters')}</span>
              {activeFilterCount > 0 && (
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
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
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('clearFilters')}</span>
              </button>
            )}
          </div>

          <div className="row g-3">
            {/* Unique ID */}
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('uniqueId')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('uniqueId')}
                value={filters.unique_id || ''}
                onChange={(e) => handleFieldChange('unique_id', e.target.value)}
              />
            </div>

            {/* Name */}
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('name')}
                value={filters.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>

            {/* Father / Spouse Name */}
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('fatherOrSpouseName')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('fatherOrSpouseName')}
                value={filters.father_or_spouse_name || ''}
                onChange={(e) => handleFieldChange('father_or_spouse_name', e.target.value)}
              />
            </div>

            {/* Age */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('age')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('age')}
                value={filters.age || ''}
                onChange={(e) => handleFieldChange('age', e.target.value)}
              />
            </div>

            {/* Mobile Number */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('mobileNumber')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('mobileNumber')}
                value={filters.mobile_number || ''}
                onChange={(e) => handleFieldChange('mobile_number', e.target.value)}
              />
            </div>

            {/* Diksha Guru */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('dikshaGuru')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('dikshaGuru')}
                value={filters.diksha_guru || ''}
                onChange={(e) => handleFieldChange('diksha_guru', e.target.value)}
              />
            </div>

            {/* Diksha Date */}
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('dikshaDate')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('dikshaDate')}
                value={filters.diksha_date || ''}
                onChange={(e) => handleFieldChange('diksha_date', e.target.value)}
              />
            </div>

            {/* Occupation */}
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('occupation')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('occupation')}
                value={filters.occupation || ''}
                onChange={(e) => handleFieldChange('occupation', e.target.value)}
              />
            </div>

            {/* Education */}
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('education')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('education')}
                value={filters.education || ''}
                onChange={(e) => handleFieldChange('education', e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label small fw-semibold text-secondary mb-1">
                {t('address')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3"
                placeholder={t('address')}
                value={filters.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 pt-2 d-flex justify-content-end gap-2 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-3 px-3"
              onClick={() => setShowAdvanced(false)}
            >
              {t('hideFilters')}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm rounded-3 px-4 fw-semibold d-flex align-items-center gap-1.5"
              disabled={isLoading}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('applyFilters')}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
