'use client';

import { ParseSummary, ParsedRecord } from '@/types';
import { AlertTriangle, CheckCircle, CheckSquare, Database, Square, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageProvider';

interface ImportPreviewTableProps {
  summary: ParseSummary;
  onConfirmImport: (selectedRecords: ParsedRecord[]) => Promise<void>;
  isImporting: boolean;
}

export default function ImportPreviewTable({
  summary,
  onConfirmImport,
  isImporting,
}: ImportPreviewTableProps) {
  const { t } = useLanguage();
  const [records, setRecords] = useState<ParsedRecord[]>(summary.records);
  const [filter, setFilter] = useState<'all' | 'valid' | 'duplicate' | 'invalid'>('all');

  const toggleSelect = (tempId: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, selected: !r.selected } : r))
    );
  };

  const toggleSelectAllValid = () => {
    const hasUnselectedValid = records.some((r) => r.status === 'valid' && !r.selected);
    setRecords((prev) =>
      prev.map((r) => (r.status === 'valid' ? { ...r, selected: hasUnselectedValid } : r))
    );
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const selectedCount = records.filter((r) => r.selected).length;

  const handleImportClick = () => {
    const selected = records.filter((r) => r.selected);
    if (selected.length > 0) {
      onConfirmImport(selected);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-body">
      {/* Header */}
      <div className="card-header bg-dark text-white p-4 border-0 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h4 className="fw-bold text-white mb-1">{t('previewTitle')}</h4>
          <p className="small text-white-50 mb-0">{t('previewSub')}</p>
        </div>

        <button
          type="button"
          className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow"
          onClick={handleImportClick}
          disabled={isImporting || selectedCount === 0}
        >
          {isImporting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Importing...</span>
            </>
          ) : (
            <>
              <Database className="w-5 h-5" />
              <span>
                {t('importConfirmed')} ({selectedCount})
              </span>
            </>
          )}
        </button>
      </div>

      <div className="card-body p-4">
        {/* Summary Pill Badges */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 p-3 bg-light rounded-3 border">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-semibold ${
                filter === 'all' ? 'btn-dark' : 'btn-outline-dark'
              }`}
              onClick={() => setFilter('all')}
            >
              Total: {summary.total}
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-semibold ${
                filter === 'valid' ? 'btn-success text-white' : 'btn-outline-success'
              }`}
              onClick={() => setFilter('valid')}
            >
              <CheckCircle className="w-4 h-4 me-1 d-inline" />
              Valid: {summary.validCount}
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-semibold ${
                filter === 'duplicate' ? 'btn-warning text-dark' : 'btn-outline-warning'
              }`}
              onClick={() => setFilter('duplicate')}
            >
              <AlertTriangle className="w-4 h-4 me-1 d-inline" />
              Duplicate: {summary.duplicateCount}
            </button>
            {summary.invalidCount > 0 && (
              <button
                type="button"
                className={`btn btn-sm rounded-pill fw-semibold ${
                  filter === 'invalid' ? 'btn-danger text-white' : 'btn-outline-danger'
                }`}
                onClick={() => setFilter('invalid')}
              >
                <XCircle className="w-4 h-4 me-1 d-inline" />
                Invalid: {summary.invalidCount}
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1.5 fw-semibold"
            onClick={toggleSelectAllValid}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Select/Deselect All Valid</span>
          </button>
        </div>

        {/* Records Preview Table */}
        <div className="table-responsive rounded-3 border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '50px' }} className="text-center">
                  Select
                </th>
                <th style={{ width: '150px' }}>{t('uniqueId')}</th>
                <th style={{ width: '220px' }}>{t('name')}</th>
                <th>{t('address')}</th>
                <th style={{ width: '130px' }}>{t('dikshaDate')}</th>
                <th style={{ width: '140px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No records found for the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.tempId} className={!rec.selected ? 'opacity-50 bg-light' : ''}>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary border-0"
                        onClick={() => toggleSelect(rec.tempId)}
                        disabled={rec.status === 'invalid'}
                      >
                        {rec.selected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted" />
                        )}
                      </button>
                    </td>
                    <td>
                      <span className="font-mono fw-bold badge bg-primary bg-opacity-15 text-light border border-primary border-opacity-25 px-2.5 py-1.5 fs-6">
                        {rec.unique_id}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{rec.name}</td>
                    <td className="whitespace-pre-line small text-secondary">{rec.address}</td>
                    <td className="small">{rec.diksha_date || '—'}</td>
                    <td>
                      {rec.status === 'valid' && (
                        <span className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t('statusValid')}</span>
                        </span>
                      )}
                      {rec.status === 'duplicate' && (
                        <span
                          className="badge bg-warning bg-opacity-20 text-warning-emphasis border border-warning rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
                          title={rec.errorMessage}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{t('statusDuplicate')}</span>
                        </span>
                      )}
                      {rec.status === 'invalid' && (
                        <span
                          className="badge bg-danger bg-opacity-15 text-danger border border-danger rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
                          title={rec.errorMessage}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('statusInvalid')}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
