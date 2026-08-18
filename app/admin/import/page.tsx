'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import FileUploadZone from '@/components/admin/FileUploadZone';
import ImportPreviewTable from '@/components/admin/ImportPreviewTable';
import { ParseSummary, ParsedRecord } from '@/types';
import { useLanguage } from '@/components/LanguageProvider';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminImportPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseSummary, setParseSummary] = useState<ParseSummary | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (!res.ok) {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setParseSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/import/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to parse file.');
        setIsLoading(false);
        return;
      }

      setParseSummary(data);
    } catch {
      setError('Network error while processing file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async (selectedRecords: ParsedRecord[]) => {
    setIsImporting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        records: selectedRecords.map((r) => ({
          unique_id: r.unique_id,
          name: r.name,
          father_or_spouse_name: r.father_or_spouse_name || null,
          age: r.age || null,
          address: r.address,
          mobile_number: r.mobile_number || null,
          occupation: r.occupation || null,
          education: r.education || null,
          diksha_date: r.diksha_date || null,
          diksha_date_sort: r.diksha_date_sort || null,
          diksha_guru: r.diksha_guru || null,
          diksha_venue: r.diksha_venue || null,
          diksha_ceremony_serial: r.diksha_ceremony_serial || null,
        })),
      };

      const res = await fetch('/api/admin/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Import failed.');
        setIsImporting(false);
        return;
      }

      setSuccessMessage(
        `Successfully imported ${data.importedCount} record(s) into PostgreSQL database!`
      );
      setParseSummary(null); // Clear preview table after successful import
    } catch {
      setError('An error occurred during database insertion.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <AdminNavbar />

      <div className="container pb-5">
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">{t('importDocuments')}</h2>
          <p className="text-muted mb-0">
            {t('importPageSubtitle')}
          </p>
        </div>

        {successMessage && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4 rounded-4 p-4 shadow-sm">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h5 className="alert-heading fw-bold mb-1">{t('importSuccess')}</h5>
              <p className="mb-0">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-4 p-4 shadow-sm">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload File Section */}
        <FileUploadZone
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          error={error}
        />

        {/* Parsed Preview Table */}
        {parseSummary && (
          <ImportPreviewTable
            summary={parseSummary}
            onConfirmImport={handleConfirmImport}
            isImporting={isImporting}
          />
        )}
      </div>
    </div>
  );
}
