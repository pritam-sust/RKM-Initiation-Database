'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [12, 24, 48, 96],
}: PaginationProps) {
  const { t, language } = useLanguage();
  const [jumpInput, setJumpInput] = useState('');

  if (totalRecords === 0) return null;

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpInput('');
    }
  };

  return (
    <div className="pagination-container-modern animate-fade-in">
      {/* 1. Record Count & Page Size Info */}
      <div className="d-flex flex-wrap align-items-center gap-3">
        <span className="small text-secondary fw-medium">
          {t('showingResults')}{' '}
          <strong className="text-dark font-mono">
            {startRecord} - {endRecord}
          </strong>{' '}
          {t('of')}{' '}
          <strong className="text-dark font-mono">{totalRecords.toLocaleString()}</strong>{' '}
          {t('records')}
        </span>

        {onLimitChange && (
          <div className="d-flex align-items-center gap-1 ms-sm-2">
            <span className="extra-small text-muted" style={{ fontSize: '0.75rem' }}>
              {t('perPage')}:
            </span>
            <select
              className="sort-select-custom py-1 px-2 font-mono"
              style={{ fontSize: '0.75rem' }}
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Navigation Pills */}
      {totalPages > 1 && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="pagination-pills-wrapper">
            {/* First Button */}
            <button
              type="button"
              className="pagination-btn-pill"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
              title={t('firstPage')}
            >
              <ChevronsLeft size={15} />
            </button>

            {/* Prev Button */}
            <button
              type="button"
              className="pagination-btn-pill"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              title={t('prevPage')}
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page Number Pills */}
            <div className="d-none d-sm-inline-flex gap-1">
              {getPageNumbers().map((p, idx) =>
                typeof p === 'number' ? (
                  <button
                    key={idx}
                    type="button"
                    className={`pagination-btn-pill font-mono ${p === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-muted d-flex align-items-center font-mono">
                    ...
                  </span>
                )
              )}
            </div>

            {/* Current Page Pill on Mobile */}
            <div className="d-inline-flex d-sm-none align-items-center px-2 py-1 bg-light rounded font-mono text-dark fw-bold" style={{ fontSize: '0.8125rem' }}>
              {currentPage} / {totalPages}
            </div>

            {/* Next Button */}
            <button
              type="button"
              className="pagination-btn-pill"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              title={t('nextPage')}
            >
              <ChevronRight size={15} />
            </button>

            {/* Last Button */}
            <button
              type="button"
              className="pagination-btn-pill"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              title={t('lastPage')}
            >
              <ChevronsRight size={15} />
            </button>
          </div>

          {/* 3. Quick Page Jump Box (For deep navigation across 500,000 records) */}
          {totalPages > 5 && (
            <form onSubmit={handleJumpSubmit} className="pagination-jump-box ms-1">
              <span className="extra-small text-muted d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
                {t('goToPage')}:
              </span>
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder={String(currentPage)}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="pagination-jump-input"
              />
              <button
                type="submit"
                className="btn btn-sm btn-rkm-secondary py-1 px-2"
                style={{ fontSize: '0.75rem' }}
                disabled={!jumpInput}
              >
                {t('jump')}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
