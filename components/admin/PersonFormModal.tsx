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
  const [fatherOrSpouseName, setFatherOrSpouseName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [dikshaDate, setDikshaDate] = useState('');
  const [dikshaGuru, setDikshaGuru] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (person) {
      setUniqueId(person.unique_id);
      setName(person.name);
      setFatherOrSpouseName(person.father_or_spouse_name || '');
      setAge(person.age || '');
      setAddress(person.address);
      setMobileNumber(person.mobile_number || '');
      setOccupation(person.occupation || '');
      setEducation(person.education || '');
      setDikshaDate(person.diksha_date || '');
      setDikshaGuru(person.diksha_guru || '');
    } else {
      setUniqueId('');
      setName('');
      setFatherOrSpouseName('');
      setAge('');
      setAddress('');
      setMobileNumber('');
      setOccupation('');
      setEducation('');
      setDikshaDate('');
      setDikshaGuru('');
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
      father_or_spouse_name: fatherOrSpouseName.trim() || null,
      age: age.trim() || null,
      address: address.trim(),
      mobile_number: mobileNumber.trim() || null,
      occupation: occupation.trim() || null,
      education: education.trim() || null,
      diksha_date: dikshaDate.trim() || null,
      diksha_guru: dikshaGuru.trim() || null,
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
        className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
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
              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark">
                  {t('uniqueId')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. সিএ১২৩৪৫৬ or DA6140"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  required
                />
              </div>

              {/* Diksha Date */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark">{t('dikshaDate')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. 12-05-2020 or ১২/০৫/২০২০"
                  value={dikshaDate}
                  onChange={(e) => setDikshaDate(e.target.value)}
                />
              </div>

              {/* Diksha Guru */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark">{t('dikshaGuru')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. Swami Vivekananda"
                  value={dikshaGuru}
                  onChange={(e) => setDikshaGuru(e.target.value)}
                />
              </div>

              {/* Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark">
                  {t('name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. শ্রীপ্রদীপ দে or Sri Dhiman Bhowmik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Father / Spouse Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark">{t('fatherOrSpouseName')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. শ্রী সুবিনয় রায়"
                  value={fatherOrSpouseName}
                  onChange={(e) => setFatherOrSpouseName(e.target.value)}
                />
              </div>

              {/* Age */}
              <div className="col-md-3">
                <label className="form-label fw-semibold text-dark">{t('age')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              {/* Mobile Number */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-dark">{t('mobileNumber')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. 01712345678"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              {/* Occupation */}
              <div className="col-md-5">
                <label className="form-label fw-semibold text-dark">{t('occupation')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. ব্যবসায়ী / Teacher"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>

              {/* Education */}
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark">{t('education')}</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g. স্নাতক / B.Sc."
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label fw-semibold text-dark">
                  {t('address')} <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control rounded-3"
                  rows={3}
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
