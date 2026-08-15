'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../LanguageProvider';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, File } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error?: string | null;
}

export default function FileUploadZone({
  onFileSelect,
  isLoading,
  error,
}: FileUploadZoneProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartParse = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'xlsx' || ext === 'xls') {
      return (
        <div
          className="rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: '2.75rem', height: '2.75rem', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
        >
          <FileSpreadsheet size={24} />
        </div>
      );
    } else if (ext === 'pdf') {
      return (
        <div
          className="rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: '2.75rem', height: '2.75rem', backgroundColor: '#fff1f2', color: '#881337', border: '1px solid #fecdd3' }}
        >
          <FileText size={24} />
        </div>
      );
    } else {
      return (
        <div
          className="rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: '2.75rem', height: '2.75rem', backgroundColor: '#eff6ff', color: '#0369a1', border: '1px solid #bfdbfe' }}
        >
          <FileText size={24} />
        </div>
      );
    }
  };

  return (
    <div className="rkm-card mb-4">
      <div className="p-4 p-md-5">
        <div
          className={`border border-2 border-dashed rounded-4 p-5 text-center transition-all ${
            dragActive ? 'border-primary bg-light' : 'border-slate-300 bg-slate-50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.xlsx,.xls,.pdf"
            className="d-none"
            onChange={handleChange}
          />

          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--rkm-orange-light)', color: 'var(--rkm-orange)' }}
          >
            <UploadCloud size={32} />
          </div>

          <h4 className="fw-bold text-dark mb-1 fs-5">
            {language === 'bn' ? 'ফাইল আপলোড করুন (Word, Excel, PDF)' : 'Upload File (Word, Excel, PDF)'}
          </h4>
          <p className="text-muted mb-3 max-w-md mx-auto small">
            {language === 'bn'
              ? 'দীক্ষিত ব্যক্তিদের রেকর্ড সম্বলিত .docx, .doc, .xlsx, .xls, অথবা .pdf ফাইল নির্বাচন করুন।'
              : 'Drag & drop a .docx, .doc, .xlsx, .xls, or .pdf file containing initiated person records.'}
          </p>

          <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
            <span className="chip-tag chip-blue">Word (.doc, .docx)</span>
            <span className="chip-tag chip-green">Excel (.xls, .xlsx)</span>
            <span className="chip-tag chip-maroon">PDF (.pdf)</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-rkm-secondary px-4 py-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {t('uploadBtn')}
          </button>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3.5 bg-light rounded-3 border border-slate-200 d-flex flex-wrap align-items-center justify-content-between gap-3 animate-fade-in">
            <div className="d-flex align-items-center gap-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <h6 className="fw-bold mb-0 text-dark fs-6">{selectedFile.name}</h6>
                <div className="d-flex align-items-center gap-2 mt-0.5">
                  <span className="small text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span className="badge-unique-id" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.35rem' }}>
                    {selectedFile.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-rkm-primary btn-sm px-4 py-2"
              onClick={handleStartParse}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>{t('processing')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Parse & Preview</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mt-4 rounded-3 mb-0 small">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
