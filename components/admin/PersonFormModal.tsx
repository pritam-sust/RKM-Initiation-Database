'use client';

import React, { useState, useEffect } from 'react';
import { PersonRecord } from '@/types';
import { useLanguage } from '../LanguageProvider';
import { Save, X, AlertCircle } from 'lucide-react';

interface PersonFormModalProps {
  person?: PersonRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PersonFormModal({
  person,
  isOpen,
  onClose,
  onSuccess,
}: PersonFormModalProps) {
  const { t } = useLanguage();

  const [uniqueId, setUniqueId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [dikshaDate, setDikshaDate] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (person) {
      setUniqueId(person.unique_id);
      setName(person.name);
      setAddress(person.address);
      setDikshaDate(person.diksha_date || '');
    } else {
      setUniqueId('');
      setName('');
      setAddress('');
      setDikshaDate('');
    }
    setError(null);
  }, [person, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      unique_id: uniqueId.trim(),
      name: name.trim(),
      address: address.trim(),
      diksha_date: dikshaDate.trim() || null,
    };

    try {
      const url = person ? `/api/admin/persons/${person.id}` : '/api/admin/persons';
      const method = person ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save record.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch {
      setError('An unexpected error occurred.');
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
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-primary text-white border-0 py-3 px-4">
            <h5 className="modal-title fw-bold mb-0">
              {person ? t('editPerson') : t('addNewPerson')}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="row g-3">
              {/* Unique ID */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark">
                  {t('uniqueId')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg font-mono rounded-3"
                  placeholder="e.g. সিএ১২৩৪৫৬ or DA6140"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  required
                />
              </div>

              {/* Diksha Date */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark">{t('dikshaDate')}</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  placeholder="e.g. 12-05-2020 or ১২/০৫/২০২০"
                  value={dikshaDate}
                  onChange={(e) => setDikshaDate(e.target.value)}
                />
              </div>

              {/* Name */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark">
                  {t('name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  placeholder="e.g. শ্রীপ্রদীপ দে or Sri Dhiman Rjn Bhowmik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark">
                  {t('address')} <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control form-control-lg rounded-3"
                  rows={4}
                  placeholder="Enter full multiline address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-0 py-3 px-4">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 rounded-pill"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 me-1" />
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 rounded-pill d-flex align-items-center gap-1.5 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
