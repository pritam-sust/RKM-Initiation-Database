'use client';

import { PersonRecord } from '@/types';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageProvider';

interface BulkDeleteConfirmModalProps {
  selectedPersons: PersonRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkDeleteConfirmModal({
  selectedPersons,
  isOpen,
  onClose,
  onSuccess,
}: BulkDeleteConfirmModalProps) {
  const { t, language } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || selectedPersons.length === 0) return null;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const ids = selectedPersons.map((p) => p.id);
      const res = await fetch('/api/admin/persons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to delete records.');
      }
    } catch {
      setError('Network error while deleting records. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop-custom animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog-modern"
        style={{ maxWidth: '38rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-modern bg-danger text-white border-0" style={{ background: 'linear-gradient(135deg, #7f1933 0%, #991b1b 100%)' }}>
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-warning flex-shrink-0" />
            <h5 className="mb-0 fw-bold fs-6">{t('confirmBulkDeleteTitle')}</h5>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-white p-0 border-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-modern">
          <div className="d-flex align-items-start gap-3 mb-3.5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '3rem', height: '3rem', backgroundColor: '#fef2f2', color: '#dc2626' }}
            >
              <Trash2 size={24} />
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-1">
                {language === 'bn'
                  ? `${selectedPersons.length} টি রেকর্ড স্থায়ীভাবে মুছে ফেলতে চাচ্ছেন?`
                  : `Are you sure you want to delete ${selectedPersons.length} records?`}
              </h6>
              <p className="text-secondary small mb-0">
                {t('confirmBulkDeleteBody')}
              </p>
            </div>
          </div>

          {/* Selected Records List Preview */}
          <div className="p-3 bg-light rounded-3 border border-slate-200 mb-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <div className="extra-small text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
              {t('selectedRecords')} ({selectedPersons.length})
            </div>
            <div className="d-flex flex-wrap gap-1">
              {selectedPersons.map((person) => (
                <span key={person.id} className="chip-tag chip-slate font-mono" style={{ fontSize: '0.75rem' }}>
                  <strong className="text-primary me-1">{person.unique_id}</strong>
                  <span className="text-truncate" style={{ maxWidth: '120px' }}>{person.name}</span>
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-danger small py-2 px-3 rounded-3 mb-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button
              type="button"
              className="btn btn-sm btn-rkm-secondary px-3.5 py-2"
              onClick={onClose}
              disabled={isDeleting}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger px-4 py-2 fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  <span>
                    {language === 'bn'
                      ? `${selectedPersons.length} টি রেকর্ড মুছুন`
                      : `Delete ${selectedPersons.length} Records`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
