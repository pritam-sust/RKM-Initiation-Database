'use client';

import { PersonRecord } from '@/types';
import { AlertCircle, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageProvider';

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
  const [dikshaVenue, setDikshaVenue] = useState('');
  const [dikshaCeremonySerial, setDikshaCeremonySerial] = useState('');

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
      setDikshaVenue(person.diksha_venue || '');
      setDikshaCeremonySerial(person.diksha_ceremony_serial || '');
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
      setDikshaVenue('');
      setDikshaCeremonySerial('');
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
      diksha_venue: dikshaVenue.trim() || null,
      diksha_ceremony_serial: dikshaCeremonySerial.trim() || null,
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
      className="modal-backdrop-custom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog-modern animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="d-flex flex-column h-100 overflow-hidden">
          {/* Header */}
          <div className="modal-header-modern">
            <h5 className="modal-title fs-6 fw-bold mb-0 text-white">
              {person ? t('editPerson') : t('addNewPerson')}
            </h5>
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
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 rounded-3 small">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="row g-3">
              {/* Initiation Number */}
              <div className="col-12 col-md-4">
                <label className="form-label-custom">
                  {t('uniqueId')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control-custom font-mono"
                  placeholder="e.g. সিএ১২৩৪৫৬ or DA6140"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  required
                />
              </div>

              {/* Diksha Date */}
              <div className="col-12 col-md-4">
                <label className="form-label-custom">{t('dikshaDate')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. 12-05-2020 or ১২/০৫/২০২০"
                  value={dikshaDate}
                  onChange={(e) => setDikshaDate(e.target.value)}
                />
              </div>

              {/* Diksha Guru */}
              <div className="col-12 col-md-4">
                <label className="form-label-custom">{t('dikshaGuru')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. Swami Vivekananda"
                  value={dikshaGuru}
                  onChange={(e) => setDikshaGuru(e.target.value)}
                />
              </div>

              {/* Diksha Venue */}
              <div className="col-12 col-md-6">
                <label className="form-label-custom">{t('dikshaVenue')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. Sylhet Ashram or সিলেট রামকৃষ্ণ মিশন"
                  value={dikshaVenue}
                  onChange={(e) => setDikshaVenue(e.target.value)}
                />
              </div>

              {/* Guru Diksha Ceremony Serial */}
              <div className="col-12 col-md-6">
                <label className="form-label-custom">{t('dikshaCeremonySerial')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. 45th or ৪৫তম"
                  value={dikshaCeremonySerial}
                  onChange={(e) => setDikshaCeremonySerial(e.target.value)}
                />
              </div>

              {/* Name */}
              <div className="col-12 col-md-6">
                <label className="form-label-custom">
                  {t('name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. শ্রীপ্রদীপ দে or Sri Dhiman Bhowmik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Father / Spouse Name */}
              <div className="col-12 col-md-6">
                <label className="form-label-custom">{t('fatherOrSpouseName')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. শ্রী সুবিনয় রায়"
                  value={fatherOrSpouseName}
                  onChange={(e) => setFatherOrSpouseName(e.target.value)}
                />
              </div>

              {/* Age */}
              <div className="col-6 col-md-3">
                <label className="form-label-custom">{t('age')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              {/* Mobile Number */}
              <div className="col-6 col-md-3">
                <label className="form-label-custom">{t('mobileNumber')}</label>
                <input
                  type="text"
                  className="form-control-custom font-mono"
                  placeholder="e.g. 01712345678"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              {/* Occupation */}
              <div className="col-12 col-md-3">
                <label className="form-label-custom">{t('occupation')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. Teacher"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>

              {/* Education */}
              <div className="col-12 col-md-3">
                <label className="form-label-custom">{t('education')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="e.g. B.A., M.Sc."
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="col-12">
                <label className="form-label-custom">
                  {t('address')} <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control-custom"
                  rows={3}
                  placeholder="Enter full multiline address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-light border-top border-slate-200 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-rkm-secondary px-4"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn-rkm-primary btn-sm px-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
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
