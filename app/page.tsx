'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResultList from '@/components/SearchResultList';
import PersonDetailModal from '@/components/PersonDetailModal';
import { PersonRecord, PersonFilterOptions } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';

export default function PublicSearchPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<PersonFilterOptions>({ q: '' });
  const [results, setResults] = useState<PersonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);

  const fetchResults = useCallback(async (currentFilters: PersonFilterOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilters.q?.trim()) params.set('q', currentFilters.q.trim());
      if (currentFilters.unique_id?.trim()) params.set('unique_id', currentFilters.unique_id.trim());
      if (currentFilters.name?.trim()) params.set('name', currentFilters.name.trim());
      if (currentFilters.father_or_spouse_name?.trim()) params.set('father_or_spouse_name', currentFilters.father_or_spouse_name.trim());
      if (currentFilters.age?.trim()) params.set('age', currentFilters.age.trim());
      if (currentFilters.address?.trim()) params.set('address', currentFilters.address.trim());
      if (currentFilters.mobile_number?.trim()) params.set('mobile_number', currentFilters.mobile_number.trim());
      if (currentFilters.occupation?.trim()) params.set('occupation', currentFilters.occupation.trim());
      if (currentFilters.education?.trim()) params.set('education', currentFilters.education.trim());
      if (currentFilters.diksha_date?.trim()) params.set('diksha_date', currentFilters.diksha_date.trim());
      if (currentFilters.diksha_guru?.trim()) params.set('diksha_guru', currentFilters.diksha_guru.trim());
      params.set('limit', '50');

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.data || []);
        setTotal(data.total || 0);
      } else {
        setError(data.error || 'Failed to perform search.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(filters);
  }, [filters, fetchResults]);

  return (
    <div className="container py-4 py-md-5">
      {/* Banner */}
      <div className="text-center mb-4 mb-md-5 max-w-2xl mx-auto">
        <h2 className="display-6 fw-bold text-dark mb-2">{t('appTitle')}</h2>
        <p className="lead text-muted fs-6 mb-0">{t('appSubTitle')}</p>
      </div>

      {/* Search & Filter Form */}
      <div className="max-w-3xl mx-auto">
        <SearchForm
          initialFilters={filters}
          onSearch={(newFilters) => setFilters(newFilters)}
          isLoading={isLoading}
        />
      </div>

      {/* Results Container */}
      <div className="mt-4">
        <SearchResultList
          results={results}
          total={total}
          isLoading={isLoading}
          error={error}
          onSelectPerson={setSelectedPerson}
        />
      </div>

      {/* Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}
