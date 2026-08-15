'use client';

import React from 'react';
import { PersonRecord } from '@/types';
import { useLanguage } from './LanguageProvider';
import { User, Tag, Calendar, MapPin, Phone, Briefcase, GraduationCap, BookOpen, Users } from 'lucide-react';

interface PersonDetailModalProps {
  person: PersonRecord | null;
  onClose: () => void;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  notSpecified: string;
  mono?: boolean;
  preWrap?: boolean;
}

function InfoRow({ icon, label, value, notSpecified, mono, preWrap }: InfoRowProps) {
  return (
    <div className="p-3 rounded-3 bg-light border border-secondary-subtle h-100">
      <div className="d-flex align-items-center gap-2 text-primary mb-2">
        {icon}
        <span className="fw-semibold text-dark small text-uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mb-0 text-dark fw-bold ${mono ? 'font-mono fs-5' : 'fs-6'} ${preWrap ? 'whitespace-pre-line' : ''}`}>
        {value ? value : <span className="text-muted fst-italic fw-normal">{notSpecified}</span>}
      </p>
    </div>
  );
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
        className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
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
            {/* Person Name – Hero Row */}
            <div className="d-flex align-items-start gap-3 mb-4 pb-3 border-bottom">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <span className="text-uppercase small text-muted fw-semibold d-block mb-1">{t('name')}</span>
                <h3 className="h4 text-dark fw-bold mb-0">{person.name}</h3>
                {person.father_or_spouse_name && (
                  <p className="text-muted small mb-0 mt-1">
                    {t('fatherOrSpouseName')}: {person.father_or_spouse_name}
                  </p>
                )}
              </div>
            </div>

            {/* Row 1: Unique ID | Diksha Date | Diksha Guru */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <InfoRow
                  icon={<Tag className="w-4 h-4" />}
                  label={t('uniqueId')}
                  value={person.unique_id}
                  notSpecified={t('notSpecified')}
                  mono
                />
              </div>
              <div className="col-md-4">
                <InfoRow
                  icon={<Calendar className="w-4 h-4" />}
                  label={t('dikshaDate')}
                  value={person.diksha_date}
                  notSpecified={t('notSpecified')}
                />
              </div>
              <div className="col-md-4">
                <InfoRow
                  icon={<BookOpen className="w-4 h-4" />}
                  label={t('dikshaGuru')}
                  value={person.diksha_guru}
                  notSpecified={t('notSpecified')}
                />
              </div>
            </div>

            {/* Row 2: Age | Mobile | Occupation | Education */}
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <InfoRow
                  icon={<Users className="w-4 h-4" />}
                  label={t('age')}
                  value={person.age}
                  notSpecified={t('notSpecified')}
                />
              </div>
              <div className="col-md-3">
                <InfoRow
                  icon={<Phone className="w-4 h-4" />}
                  label={t('mobileNumber')}
                  value={person.mobile_number}
                  notSpecified={t('notSpecified')}
                />
              </div>
              <div className="col-md-3">
                <InfoRow
                  icon={<Briefcase className="w-4 h-4" />}
                  label={t('occupation')}
                  value={person.occupation}
                  notSpecified={t('notSpecified')}
                />
              </div>
              <div className="col-md-3">
                <InfoRow
                  icon={<GraduationCap className="w-4 h-4" />}
                  label={t('education')}
                  value={person.education}
                  notSpecified={t('notSpecified')}
                />
              </div>
            </div>

            {/* Address – Full Width */}
            <div className="p-3 rounded-3 bg-light border border-secondary-subtle">
              <div className="d-flex align-items-center gap-2 text-primary mb-2">
                <MapPin className="w-4 h-4" />
                <span className="fw-semibold text-dark small text-uppercase tracking-wider">{t('address')}</span>
              </div>
              <div
                className="fs-6 text-dark whitespace-pre-line bg-white p-3 rounded-2 border border-secondary-subtle"
                style={{ minHeight: '80px', lineHeight: '1.7' }}
              >
                {person.address}
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
