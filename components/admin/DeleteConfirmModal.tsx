'use client';

import { PersonRecord } from '@/types';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../LanguageProvider';

interface DeleteConfirmModalProps {
  person: PersonRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({
  person,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  if (!person) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/persons/${person.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop-custom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog-modern animate-fade-in"
        style={{ maxWidth: '28rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 text-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            <AlertTriangle size={28} />
          </div>
          <h4 className="fw-bold text-dark mb-2 fs-5">{t('confirmDeleteTitle')}</h4>
          <p className="text-muted small mb-3">
            {t('confirmDeleteBody')}
          </p>
          <div className="p-3 bg-light rounded-3 border border-slate-200 mb-4">
            <span className="badge-unique-id mb-1">
              {person.unique_id}
            </span>
            <div className="fw-bold text-dark fs-6 mt-1">{person.name}</div>
          </div>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-rkm-secondary px-4"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger px-4 fw-semibold d-flex align-items-center gap-1 shadow-sm rounded-3"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <Trash2 size={15} />
              )}
              <span>{t('confirm')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
