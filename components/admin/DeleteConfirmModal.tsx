'use client';

import React, { useState } from 'react';
import { PersonRecord } from '@/types';
import { useLanguage } from '../LanguageProvider';
import { Trash2, AlertTriangle } from 'lucide-react';

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
      className="modal fade show d-block bg-dark bg-opacity-50 animate-fade-in"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-body p-4 text-center">
            <div className="bg-danger bg-opacity-10 text-danger rounded-circle w-16 h-16 d-flex align-items-center justify-content-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="fw-bold text-dark mb-2">{t('confirmDeleteTitle')}</h4>
            <p className="text-muted mb-3">
              {t('confirmDeleteBody')}
              <br />
              <strong className="text-danger font-mono fs-5">{person.unique_id} ({person.name})</strong>
            </p>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-4 rounded-pill fw-semibold"
                onClick={onClose}
                disabled={isLoading}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 rounded-pill fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{t('confirm')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
