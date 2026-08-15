'use client';

import React from 'react';
import { PersonRecord } from '@/types';
import { useLanguage } from './LanguageProvider';
import { User, Tag, Calendar, MapPin, Phone, Briefcase, GraduationCap, Award, Users, X, Sparkles } from 'lucide-react';

interface PersonDetailModalProps {
  person: PersonRecord | null;
  onClose: () => void;
}

export default function PersonDetailModal({ person, onClose }: PersonDetailModalProps) {
  const { t } = useLanguage();

  if (!person) return null;

  return (
    <div
      className="modal-backdrop-custom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog-modern animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header-modern">
          <div className="d-flex align-items-center gap-3">
            <span className="badge-unique-id" style={{ fontSize: '0.8125rem' }}>
              {person.unique_id}
            </span>
            <span className="h6 mb-0 fw-bold text-white tracking-tight">
              {t('viewDetails')}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-icon-ghost text-white-50 hover-text-white border-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-modern">
          {/* Profile Hero Card with generous spacing */}
          <div className="modal-hero-card">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
              style={{
                width: '3.5rem',
                height: '3.5rem',
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              }}
            >
              <User size={26} />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h3 className="h4 text-dark fw-bold mb-0" style={{ letterSpacing: '-0.01em', lineHeight: '1.25' }}>
                  {person.name}
                </h3>
                {person.diksha_guru && (
                  <span className="chip-tag chip-maroon">
                    <Award size={12} />
                    <span>{person.diksha_guru}</span>
                  </span>
                )}
              </div>
              {person.father_or_spouse_name ? (
                <p className="text-muted small mb-0 mt-1">
                  <span className="text-secondary">{t('fatherOrSpouseName')}:</span>{' '}
                  <span className="text-dark fw-semibold">{person.father_or_spouse_name}</span>
                </p>
              ) : (
                <p className="text-muted extra-small mb-0 mt-1">Initiated Devotee Record</p>
              )}
            </div>
          </div>

          {/* Section 1: Initiation Details */}
          <div className="modal-section-card">
            <div className="modal-section-title">
              <Sparkles size={15} className="text-warning flex-shrink-0" />
              <span>Initiation Information</span>
            </div>
            <div className="row g-3.5">
              <div className="col-12 col-md-4">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <Tag size={13} className="text-secondary" />
                    {t('uniqueId')}
                  </span>
                  <span className="kv-value mono">{person.unique_id}</span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <Calendar size={13} className="text-secondary" />
                    {t('dikshaDate')}
                  </span>
                  <span className="kv-value">
                    {person.diksha_date ? person.diksha_date : <span className="text-muted fw-normal">{t('notSpecified')}</span>}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <Award size={13} className="text-secondary" />
                    {t('dikshaGuru')}
                  </span>
                  <span className="kv-value">
                    {person.diksha_guru ? person.diksha_guru : <span className="text-muted fw-normal">{t('notSpecified')}</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="modal-section-card">
            <div className="modal-section-title">
              <User size={15} className="text-primary flex-shrink-0" />
              <span>Personal & Contact Information</span>
            </div>
            <div className="row g-3.5">
              <div className="col-6 col-md-3">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <Users size={13} className="text-secondary" />
                    {t('age')}
                  </span>
                  <span className="kv-value">
                    {person.age ? person.age : <span className="text-muted fw-normal">{t('notSpecified')}</span>}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <Phone size={13} className="text-secondary" />
                    {t('mobileNumber')}
                  </span>
                  <span className="kv-value mono">
                    {person.mobile_number ? person.mobile_number : <span className="text-muted fw-normal">{t('notSpecified')}</span>}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <Briefcase size={13} className="text-secondary" />
                    {t('occupation')}
                  </span>
                  <span className="kv-value">
                    {person.occupation ? person.occupation : <span className="text-muted fw-normal">{t('notSpecified')}</span>}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="kv-item">
                  <span className="kv-label d-flex align-items-center gap-1.5">
                    <GraduationCap size={13} className="text-secondary" />
                    {t('education')}
                  </span>
                  <span className="kv-value">
                    {person.education ? person.education : <span className="text-muted fw-normal">{t('notSpecified')}</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Full Address Block */}
          <div className="modal-section-card mb-0">
            <div className="modal-section-title">
              <MapPin size={15} className="text-danger flex-shrink-0" />
              <span>{t('address')}</span>
            </div>
            <p className="kv-value whitespace-pre-line text-dark mb-0" style={{ lineHeight: '1.6' }}>
              {person.address}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-light border-top border-slate-200 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-sm btn-rkm-secondary px-4"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
