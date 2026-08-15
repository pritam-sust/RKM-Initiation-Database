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
    <div className="saas-table-container mb-4">
      {/* Header */}
      <div className="p-4 bg-white border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1 fs-5">{t('previewTitle')}</h4>
          <p className="small text-muted mb-0">{t('previewSub')}</p>
        </div>

        <button
          type="button"
          className="btn-rkm-primary btn-sm px-4 py-2"
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
              <Database size={16} />
              <span>
                {t('importConfirmed')} ({selectedCount})
              </span>
            </>
          )}
        </button>
      </div>

      <div className="p-4">
        {/* Summary Filter Pills */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 p-2.5 bg-light rounded-3 border border-slate-200">
          <div className="d-flex flex-wrap align-items-center gap-1.5">
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                filter === 'all' ? 'btn-dark' : 'btn-outline-secondary border-0 text-dark'
              }`}
              onClick={() => setFilter('all')}
            >
              Total: {summary.total}
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                filter === 'valid' ? 'btn-success text-white' : 'btn-outline-secondary border-0 text-dark'
              }`}
              onClick={() => setFilter('valid')}
            >
              <CheckCircle size={14} className="me-1 d-inline" />
              Valid: {summary.validCount}
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                filter === 'duplicate' ? 'btn-warning text-dark' : 'btn-outline-secondary border-0 text-dark'
              }`}
              onClick={() => setFilter('duplicate')}
            >
              <AlertTriangle size={14} className="me-1 d-inline" />
              Duplicate: {summary.duplicateCount}
            </button>
            {summary.invalidCount > 0 && (
              <button
                type="button"
                className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                  filter === 'invalid' ? 'btn-danger text-white' : 'btn-outline-secondary border-0 text-dark'
                }`}
                onClick={() => setFilter('invalid')}
              >
                <XCircle size={14} className="me-1 d-inline" />
                Invalid: {summary.invalidCount}
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1.5 fw-semibold px-3"
            onClick={toggleSelectAllValid}
          >
            <CheckSquare size={14} />
            <span>Select All Valid</span>
          </button>
        </div>

        {/* Table */}
        <div className="table-responsive border rounded-3 overflow-hidden">
          <table className="saas-table align-middle">
            <thead>
              <tr>
                <th style={{ width: '45px' }} className="text-center">
                  #
                </th>
                <th style={{ width: '130px' }}>{t('uniqueId')}</th>
                <th style={{ width: '170px' }}>{t('name')}</th>
                <th style={{ width: '150px' }}>{t('fatherOrSpouseName')}</th>
                <th style={{ width: '115px' }}>{t('mobileNumber')}</th>
                <th style={{ width: '110px' }}>{t('dikshaDate')}</th>
                <th style={{ width: '140px' }}>{t('dikshaGuru')}</th>
                <th>{t('address')}</th>
                <th style={{ width: '110px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted small">
                    No records found for the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.tempId} className={!rec.selected ? 'opacity-50 bg-light' : ''}>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-dark border-0"
                        onClick={() => toggleSelect(rec.tempId)}
                        disabled={rec.status === 'invalid'}
                      >
                        {rec.selected ? (
                          <CheckSquare size={18} className="text-primary" />
                        ) : (
                          <Square size={18} className="text-muted" />
                        )}
                      </button>
                    </td>
                    <td>
                      <span className="badge-unique-id">
                        {rec.unique_id}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{rec.name}</td>
                    <td className="small text-secondary">{rec.father_or_spouse_name || '—'}</td>
                    <td className="small font-mono">{rec.mobile_number || '—'}</td>
                    <td className="small">{rec.diksha_date || '—'}</td>
                    <td className="small">{rec.diksha_guru || '—'}</td>
                    <td className="whitespace-pre-line small text-secondary text-truncate-2" style={{ maxWidth: '200px' }}>
                      {rec.address}
                    </td>
                    <td>
                      {rec.status === 'valid' && (
                        <span className="chip-tag chip-green">
                          <CheckCircle size={12} />
                          <span>{t('statusValid')}</span>
                        </span>
                      )}
                      {rec.status === 'duplicate' && (
                        <span className="chip-tag chip-orange" title={rec.errorMessage}>
                          <AlertTriangle size={12} />
                          <span>{t('statusDuplicate')}</span>
                        </span>
                      )}
                      {rec.status === 'invalid' && (
                        <span className="chip-tag chip-maroon" title={rec.errorMessage}>
                          <XCircle size={12} />
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
