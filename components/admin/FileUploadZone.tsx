'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../LanguageProvider';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const { t } = useLanguage();
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

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-body">
      <div className="card-body p-4 p-md-5">
        <div
          className={`border-2 border-dashed rounded-4 p-4 text-center transition-all ${
            dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle bg-light'
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
            accept=".docx,.pdf"
            className="d-none"
            onChange={handleChange}
          />

          <div className="bg-primary bg-opacity-15 text-primary rounded-circle w-16 h-16 d-flex align-items-center justify-content-center mx-auto mb-3">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h4 className="fw-bold text-dark mb-2">{t('uploadTitle')}</h4>
          <p className="text-muted mb-3 max-w-md mx-auto small">{t('uploadSub')}</p>

          <button
            type="button"
            className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {t('uploadBtn')}
          </button>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-light rounded-3 border border-secondary-subtle d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary text-white p-2 rounded-3">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">{selectedFile.name}</h6>
                <span className="small text-muted font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
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
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parse & Preview</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mt-4 rounded-3 mb-0">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
