'use client';

import { PersonRecord } from '@/types';
import { AlertCircle, ArrowDown, ArrowRight, ArrowUp, Award, Calendar, CheckCircle, RotateCcw, SearchX, Sparkles, User } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import Pagination from './Pagination';

interface SearchResultListProps {
  results: PersonRecord[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error?: string | null;
  onSelectPerson: (person: PersonRecord) => void;
  onClearFilters?: () => void;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onSortChange: (newSortBy: string, newSortOrder: 'asc' | 'desc') => void;
}

export default function SearchResultList({
  results,
  total,
  page,
  totalPages,
  limit,
  sortBy,
  sortOrder,
  isLoading,
  error,
  onSelectPerson,
  onClearFilters,
  onPageChange,
  onLimitChange,
  onSortChange,
}: SearchResultListProps) {
  const { t, language } = useLanguage();

  const handleSortFieldChange = (field: string) => {
    onSortChange(field, sortOrder);
  };

  const handleToggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return (
      <div>
        {/* Skeleton Status Bar */}
        <div className="results-status-bar mb-3.5 placeholder-glow">
          <span className="placeholder col-3 rounded py-2 bg-light"></span>
          <span className="placeholder col-2 rounded py-2 bg-light"></span>
        </div>

        <div className="row g-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4">
              <div className="persona-card placeholder-glow">
                <div className="persona-card-body">
                  <div className="slot-header">
                    <span className="placeholder col-4 rounded py-1.5 bg-light"></span>
                    <span className="placeholder col-3 rounded py-1 bg-light"></span>
                  </div>
                  <h5 className="placeholder col-8 bg-secondary bg-opacity-25 mb-1.5 rounded py-2"></h5>
                  <p className="placeholder col-6 bg-light mb-2.5 rounded"></p>
                  <div className="d-flex gap-1 mb-2.5">
                    <span className="placeholder col-4 rounded py-1 bg-light"></span>
                    <span className="placeholder col-4 rounded py-1 bg-light"></span>
                  </div>
                </div>
                <div className="persona-card-footer">
                  <span className="placeholder col-3 bg-light"></span>
                  <span className="placeholder col-2 bg-light"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state-card border-danger border-opacity-25 my-4">
        <div className="empty-state-icon-glow" style={{ color: '#dc2626', background: '#fef2f2', borderColor: '#fecaca' }}>
          <AlertCircle size={32} />
        </div>
        <h4 className="fw-bold text-danger mb-2 fs-5">{t('noResultsTitle')}</h4>
        <p className="text-muted mb-4 max-w-md mx-auto small">{error}</p>
        {onClearFilters && (
          <button
            type="button"
            className="btn btn-sm btn-rkm-secondary px-4 py-2"
            onClick={onClearFilters}
          >
            <RotateCcw size={14} />
            <span>{t('resetBtn')}</span>
          </button>
        )}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty-state-card my-4 animate-fade-in">
        <div className="empty-state-icon-glow">
          <SearchX size={34} />
        </div>
        <h3 className="h5 fw-bold text-dark mb-2">
          {language === 'bn' ? 'কোনো দীক্ষিত ভক্তের রেকর্ড পাওয়া যায়নি' : 'No Initiation Records Found'}
        </h3>
        <p className="text-muted mb-4 max-w-md mx-auto small" style={{ lineHeight: '1.6' }}>
          {language === 'bn'
            ? 'আপনার অনুসন্ধানের সাথে মিলিয়ে কোনো তথ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে বানান পরীক্ষা করুন অথবা ইউনিক আইডি বা নামের অংশ দিয়ে অনুসন্ধান করুন।'
            : "We couldn't find any records matching your search criteria. Try searching with a partial name, Bengali script, or checking for typos."}
        </p>

        <div className="d-flex justify-content-center flex-wrap gap-2">
          {onClearFilters && (
            <button
              type="button"
              className="btn-rkm-primary btn-sm px-4 py-2"
              onClick={onClearFilters}
            >
              <RotateCcw size={14} />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Modern Results Status Bar with Top Sorting Controls */}
      <div className="results-status-bar">
        {/* Left: Total Records Count */}
        <div className="results-count-pill">
          <span className="results-count-number">{total.toLocaleString()}</span>
          <span className="results-count-text">{t('resultsFound')}</span>
        </div>

        {/* Right: Interactive Sorting & Live Indicator */}
        <div className="d-flex flex-wrap align-items-center gap-2.5 ms-auto">
          {/* Sorting Controls */}
          <div className="sort-controls-group">
            <span className="extra-small text-muted d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
              {t('sortBy')}:
            </span>
            <select
              className="sort-select-custom"
              value={sortBy}
              onChange={(e) => handleSortFieldChange(e.target.value)}
              title={t('sortBy')}
            >
              <option value="name">{t('sortByName')}</option>
              <option value="diksha_guru">{t('sortByGuru')}</option>
              <option value="diksha_date">{t('sortByDate')}</option>
              <option value="unique_id">{t('sortById')}</option>
              <option value="created_at">{t('sortByRecent')}</option>
            </select>

            {/* Sort Order Direction Toggle */}
            <button
              type="button"
              className="btn-sort-toggle active"
              onClick={handleToggleSortOrder}
              title={`${t('sortOrder')}: ${sortOrder === 'asc' ? t('ascending') : t('descending')}`}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp size={14} className="text-primary" />
              ) : (
                <ArrowDown size={14} className="text-primary" />
              )}
              <span className="ms-1 font-mono extra-small" style={{ fontSize: '0.75rem' }}>
                {sortOrder.toUpperCase()}
              </span>
            </button>
          </div>

          <div className="d-flex align-items-center gap-1 ps-2 border-start border-slate-200">
            <span className="live-status-dot"></span>
            <span className="extra-small fw-semibold text-secondary d-none d-lg-inline" style={{ fontSize: '0.75rem' }}>
              Live Archive
            </span>
          </div>
        </div>
      </div>

      {/* 3-Column Structured Public Grid */}
      <div className="row g-3.5 mb-4">
        {results.map((person) => (
          <div key={person.id} className="col-12 col-md-6 col-lg-4">
            <div
              className="persona-card"
              onClick={() => onSelectPerson(person)}
            >
              <div className="persona-card-accent-bar"></div>

              <div className="persona-card-body">
                {/* 1. Header Slot: Initiation Number & Diksha Date */}
                <div className="slot-header">
                  <span className="badge-unique-id" title={t('uniqueId')}>
                    {person.unique_id}
                  </span>
                  {person.diksha_date ? (
                    <span className="chip-tag chip-orange" title={t('dikshaDate')}>
                      <Calendar size={11} />
                      <span>{person.diksha_date}</span>
                    </span>
                  ) : (
                    <span className="chip-tag chip-slate" style={{ opacity: 0.75 }}>
                      <Calendar size={11} />
                      <span>{language === 'bn' ? 'দীক্ষার তারিখ: —' : 'Date: —'}</span>
                    </span>
                  )}
                </div>

                {/* 2. Devotee Name Slot */}
                <h3 className="slot-name mt-1" title={person.name}>
                  {person.name}
                </h3>

                {/* 3. Diksha Guru Information */}
                <div className="mt-2 mb-1">
                  <div className="extra-small text-muted mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('dikshaGuru')}
                  </div>
                  {person.diksha_guru ? (
                    <div className="chip-tag chip-maroon d-inline-flex align-items-center gap-1" title={person.diksha_guru}>
                      <Award size={12} className="flex-shrink-0 text-warning" />
                      <span className="fw-semibold text-truncate" style={{ maxWidth: '210px' }}>
                        {person.diksha_guru}
                      </span>
                    </div>
                  ) : (
                    <div className="chip-tag chip-slate text-muted" style={{ fontSize: '0.75rem' }}>
                      <User size={11} className="text-secondary" />
                      <span>{language === 'bn' ? 'দীক্ষাগুরু: উল্লেখ নেই' : 'Diksha Guru: Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* 4. Subtle Verification Badge */}
                <div className="d-flex align-items-center gap-1 mt-2.5 pt-2 border-top border-slate-100">
                  <CheckCircle size={13} className="text-success flex-shrink-0" />
                  <span className="extra-small text-secondary fw-medium" style={{ fontSize: '0.725rem' }}>
                    {language === 'bn' ? 'দীক্ষিত ভক্তের সংরক্ষিত রেকর্ড' : 'Initiated Devotee Record'}
                  </span>
                </div>
              </div>

              {/* 5. Card Footer Slot */}
              <div className="persona-card-footer">
                <span className="chip-tag chip-orange py-0.5 px-2" style={{ fontSize: '0.7rem' }}>
                  <Sparkles size={10} />
                  <span>RKM Archive</span>
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-dark fw-bold p-0 d-flex align-items-center gap-1 hover-text-primary flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPerson(person);
                  }}
                >
                  <span style={{ fontSize: '0.8125rem' }}>{t('viewDetails')}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalRecords={total}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        limitOptions={[12, 24, 48, 96]}
      />
    </div>
  );
}
