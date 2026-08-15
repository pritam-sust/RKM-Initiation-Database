'use client';

import React from 'react';
import { PersonRecord } from '@/types';
import { useLanguage } from './LanguageProvider';
import { User, Tag, Calendar, MapPin, X } from 'lucide-react';

interface PersonDetailModalProps {
  person: PersonRecord | null;
  onClose: () => void;
}

export default function PersonDetailModal({ person, onClose }: PersonDetailModalProps) {
  const { t } = useLanguage();

  if (!person) return null;

  return (
    <div
      className="modal fade show d-block bg-dark bg-opacity-50 animate-fade-in"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-gradient bg-primary text-white border-0 py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-white text-primary fs-6 px-3 py-2 rounded-pill font-mono shadow-sm">
                {person.unique_id}
              </span>
              <h5 className="modal-title mb-0 fw-bold">{t('viewDetails')}</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Person Name */}
            <div className="d-flex align-items-start gap-3 mb-4 pb-3 border-bottom">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <span className="text-uppercase small text-muted font-semibold tracking-wider d-block mb-1">
                  {t('name')}
                </span>
                <h3 className="h4 text-dark fw-bold mb-0">{person.name}</h3>
              </div>
            </div>

            <div className="row g-4">
              {/* Unique ID */}
              <div className="col-md-6">
                <div className="p-3 rounded-3 bg-light border border-secondary-subtle h-100">
                  <div className="d-flex align-items-center gap-2 text-primary mb-2">
                    <Tag className="w-5 h-5" />
                    <span className="fw-semibold text-dark">{t('uniqueId')}</span>
                  </div>
                  <p className="fs-5 font-mono text-dark fw-bold mb-0">{person.unique_id}</p>
                </div>
              </div>

              {/* Diksha Date */}
              <div className="col-md-6">
                <div className="p-3 rounded-3 bg-light border border-secondary-subtle h-100">
                  <div className="d-flex align-items-center gap-2 text-primary mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="fw-semibold text-dark">{t('dikshaDate')}</span>
                  </div>
                  <p className="fs-5 text-dark fw-bold mb-0">
                    {person.diksha_date ? person.diksha_date : <span className="text-muted fst-italic">{t('notSpecified')}</span>}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="col-12">
                <div className="p-3 rounded-3 bg-light border border-secondary-subtle">
                  <div className="d-flex align-items-center gap-2 text-primary mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="fw-semibold text-dark">{t('address')}</span>
                  </div>
                  <div
                    className="fs-6 text-dark whitespace-pre-line bg-white p-3 rounded-2 border border-secondary-subtle font-sans"
                    style={{ minHeight: '100px', lineHeight: '1.6' }}
                  >
                    {person.address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-0 py-3 px-4">
            <button
              type="button"
              className="btn btn-secondary px-4 rounded-pill"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
