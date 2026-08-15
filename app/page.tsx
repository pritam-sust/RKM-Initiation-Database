'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResultList from '@/components/SearchResultList';
import PersonDetailModal from '@/components/PersonDetailModal';
import { PersonRecord } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';

export default function PublicSearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30`);
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
    fetchResults(query);
  }, [query, fetchResults]);

  return (
    <div className="container py-4 py-md-5">
      {/* Banner */}
      <div className="text-center mb-4 mb-md-5 max-w-2xl mx-auto">
        <h2 className="display-6 fw-bold text-dark mb-2">{t('appTitle')}</h2>
        <p className="lead text-muted fs-6 mb-0">{t('appSubTitle')}</p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto">
        <SearchForm initialQuery={query} onSearch={setQuery} isLoading={isLoading} />
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
