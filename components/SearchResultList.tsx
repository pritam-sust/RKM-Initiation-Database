'use client';

import { PersonRecord } from '@/types';
import { AlertCircle, Calendar, Eye, Inbox, MapPin } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface SearchResultListProps {
  results: PersonRecord[];
  total: number;
  isLoading: boolean;
  error?: string | null;
  onSelectPerson: (person: PersonRecord) => void;
}

export default function SearchResultList({
  results,
  total,
  isLoading,
  error,
  onSelectPerson,
}: SearchResultListProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="row g-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 placeholder-glow">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="placeholder col-3 rounded-pill bg-secondary"></span>
                <span className="placeholder col-2 rounded-pill bg-light"></span>
              </div>
              <h5 className="placeholder col-7 bg-secondary mb-2 rounded"></h5>
              <p className="placeholder col-10 bg-light mb-1 rounded"></p>
              <p className="placeholder col-8 bg-light mb-3 rounded"></p>
              <div className="placeholder col-4 rounded-pill bg-primary"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-danger border-opacity-25 bg-danger bg-opacity-10 rounded-4 p-4 text-center my-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-2" />
        <h5 className="text-danger fw-bold">{t('noResultsTitle')}</h5>
        <p className="text-danger-emphasis mb-0">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4 bg-body">
        <div className="bg-primary bg-opacity-10 text-primary rounded-circle w-16 h-16 d-flex align-items-center justify-content-center mx-auto mb-3">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="fw-bold text-dark mb-2">{t('noResultsTitle')}</h4>
        <p className="text-muted mb-0 max-w-md mx-auto">{t('noResultsSub')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
        <p className="text-muted mb-0 fw-medium">
          <span className="badge bg-primary rounded-pill me-1 fs-6">{total}</span>
          {t('resultsFound')}
        </p>
      </div>

      <div className="row g-3">
        {results.map((person) => (
          <div key={person.id} className="col-12 col-md-6">
            <div
              className="card border-0 shadow-sm hover-shadow-md rounded-4 transition-all h-100 overflow-hidden cursor-pointer border-start border-4 border-primary"
              onClick={() => onSelectPerson(person)}
            >
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary bg-opacity-15 text-light border border-primary border-opacity-25 rounded-pill font-mono px-3 py-1 fw-bold fs-6">
                      {person.unique_id}
                    </span>
                    {person.diksha_date && (
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {person.diksha_date}
                      </span>
                    )}
                  </div>

                  <h3 className="h5 fw-bold text-dark mb-1">{person.name}</h3>

                  {person.father_or_spouse_name && (
                    <p className="text-muted small mb-2">
                      <span className="text-secondary">{t('fatherOrSpouseName')}:</span> {person.father_or_spouse_name}
                    </p>
                  )}

                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {person.diksha_guru && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-2 small">
                        {t('dikshaGuru')}: {person.diksha_guru}
                      </span>
                    )}
                    {person.mobile_number && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-2 small font-mono">
                        {person.mobile_number}
                      </span>
                    )}
                  </div>

                  <p className="text-muted small mb-3 whitespace-pre-line text-truncate-2 d-flex gap-1.5 align-items-start">
                    <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{person.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-top border-light d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1.5 fw-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPerson(person);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t('viewDetails')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
