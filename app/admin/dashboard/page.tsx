'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import PersonFormModal from '@/components/admin/PersonFormModal';
import { useLanguage } from '@/components/LanguageProvider';
import PersonDetailModal from '@/components/PersonDetailModal';
import { PersonRecord, PersonFilterOptions } from '@/types';
import { ChevronLeft, ChevronRight, Edit2, Eye, Plus, Search, Trash2, Users, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PersonFilterOptions>({ q: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<PersonRecord | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<PersonRecord | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<PersonRecord | null>(null);

  const checkAuthAndFetch = useCallback(async () => {
    try {
      const authRes = await fetch('/api/admin/auth/me');
      if (!authRes.ok) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.q?.trim()) params.set('q', filters.q.trim());
      if (filters.unique_id?.trim()) params.set('unique_id', filters.unique_id.trim());
      if (filters.name?.trim()) params.set('name', filters.name.trim());
      if (filters.father_or_spouse_name?.trim()) params.set('father_or_spouse_name', filters.father_or_spouse_name.trim());
      if (filters.age?.trim()) params.set('age', filters.age.trim());
      if (filters.address?.trim()) params.set('address', filters.address.trim());
      if (filters.mobile_number?.trim()) params.set('mobile_number', filters.mobile_number.trim());
      if (filters.occupation?.trim()) params.set('occupation', filters.occupation.trim());
      if (filters.education?.trim()) params.set('education', filters.education.trim());
      if (filters.diksha_date?.trim()) params.set('diksha_date', filters.diksha_date.trim());
      if (filters.diksha_guru?.trim()) params.set('diksha_guru', filters.diksha_guru.trim());
      params.set('page', String(page));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/persons?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPersons(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      console.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, router]);

  useEffect(() => {
    checkAuthAndFetch();
  }, [checkAuthAndFetch]);

  const specificFilterKeys: (keyof PersonFilterOptions)[] = [
    'unique_id',
    'name',
    'father_or_spouse_name',
    'age',
    'address',
    'mobile_number',
    'occupation',
    'education',
    'diksha_date',
    'diksha_guru',
  ];

  const activeFilterCount = specificFilterKeys.reduce((acc, key) => {
    return filters[key] && filters[key]?.trim() ? acc + 1 : acc;
  }, 0);

  const handleGlobalQueryChange = (val: string) => {
    setFilters((prev) => ({ ...prev, q: val }));
    setPage(1);
  };

  const handleFieldChange = (key: keyof PersonFilterOptions, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      q: '',
      unique_id: '',
      name: '',
      father_or_spouse_name: '',
      age: '',
      address: '',
      mobile_number: '',
      occupation: '',
      education: '',
      diksha_date: '',
      diksha_guru: '',
    });
    setPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (person: PersonRecord) => {
    setSelectedForEdit(person);
    setIsFormOpen(true);
  };

  return (
    <div className="min-vh-100 bg-light">
      <AdminNavbar onAddPerson={handleOpenAdd} />

      <div className="container pb-5">
        {/* Top Summary & Search Banner */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="small text-white-50 text-uppercase fw-semibold tracking-wider d-block mb-1">
                    {t('totalRecords')}
                  </span>
                  <h3 className="display-6 fw-bold mb-0 text-white">{total}</h3>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-circle text-white">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 d-flex flex-column justify-content-center">
              <div className="input-group input-group-lg border rounded-3 overflow-hidden">
                <span className="input-group-text bg-white border-0 text-muted">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none fs-6"
                  placeholder={t('searchAllFieldsPlaceholder')}
                  value={filters.q || ''}
                  onChange={(e) => handleGlobalQueryChange(e.target.value)}
                />
                <button
                  type="button"
                  className={`btn border-0 d-flex align-items-center gap-1.5 px-3 ${
                    showAdvanced || activeFilterCount > 0
                      ? 'btn-light text-primary fw-semibold'
                      : 'btn-light text-secondary'
                  }`}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  title={t('filters')}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="d-none d-sm-inline">{t('filters')}</span>
                  {activeFilterCount > 0 && (
                    <span className="badge bg-primary text-white rounded-pill px-2">
                      {activeFilterCount}
                    </span>
                  )}
                  {showAdvanced ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {(filters.q || activeFilterCount > 0) && (
                  <button
                    type="button"
                    className="btn btn-light text-danger"
                    onClick={handleClearFilters}
                    title={t('clearFilters')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filters for Admin */}
        {showAdvanced && (
          <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 p-md-4 bg-body animate-fade-in">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span className="fw-bold text-dark">{t('advancedFilters')}</span>
                {activeFilterCount > 0 && (
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                    {activeFilterCount} {t('activeFiltersCount')}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger text-decoration-none p-0 d-flex align-items-center gap-1"
                  onClick={handleClearFilters}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('clearFilters')}</span>
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('uniqueId')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('uniqueId')}
                  value={filters.unique_id || ''}
                  onChange={(e) => handleFieldChange('unique_id', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('name')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('name')}
                  value={filters.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('fatherOrSpouseName')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('fatherOrSpouseName')}
                  value={filters.father_or_spouse_name || ''}
                  onChange={(e) => handleFieldChange('father_or_spouse_name', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('age')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('age')}
                  value={filters.age || ''}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('mobileNumber')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('mobileNumber')}
                  value={filters.mobile_number || ''}
                  onChange={(e) => handleFieldChange('mobile_number', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('dikshaGuru')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('dikshaGuru')}
                  value={filters.diksha_guru || ''}
                  onChange={(e) => handleFieldChange('diksha_guru', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('dikshaDate')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('dikshaDate')}
                  value={filters.diksha_date || ''}
                  onChange={(e) => handleFieldChange('diksha_date', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('occupation')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('occupation')}
                  value={filters.occupation || ''}
                  onChange={(e) => handleFieldChange('occupation', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('education')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('education')}
                  value={filters.education || ''}
                  onChange={(e) => handleFieldChange('education', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label small fw-semibold text-secondary mb-1">{t('address')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder={t('address')}
                  value={filters.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Records Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-body">
          <div className="card-header bg-white py-3 px-4 border-0 d-flex align-items-center justify-content-between">
            <h5 className="fw-bold text-dark mb-0">{t('adminDashboard')}</h5>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-1.5"
              onClick={handleOpenAdd}
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewPerson')}</span>
            </button>
          </div>

          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : persons.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No records found matching the criteria.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '130px' }} className="px-4 py-3">{t('uniqueId')}</th>
                      <th style={{ width: '180px' }}>{t('name')}</th>
                      <th style={{ width: '160px' }}>{t('fatherOrSpouseName')}</th>
                      <th style={{ width: '110px' }}>{t('mobileNumber')}</th>
                      <th style={{ width: '115px' }}>{t('dikshaDate')}</th>
                      <th style={{ width: '140px' }}>{t('dikshaGuru')}</th>
                      <th>{t('address')}</th>
                      <th style={{ width: '130px' }} className="text-end px-4 py-3">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {persons.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <span className="badge bg-primary bg-opacity-15 text-primary border border-primary border-opacity-25 font-mono px-2 py-1 fs-6 fw-bold">
                            {p.unique_id}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{p.name}</td>
                        <td className="small text-secondary">{p.father_or_spouse_name || '—'}</td>
                        <td className="small font-mono">{p.mobile_number || '—'}</td>
                        <td className="small">{p.diksha_date || '—'}</td>
                        <td className="small">{p.diksha_guru || '—'}</td>
                        <td className="whitespace-pre-line small text-secondary" style={{ maxWidth: '200px' }}>{p.address}</td>
                        <td className="text-end px-4 py-3">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setSelectedForDetail(p)}
                              title={t('viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleOpenEdit(p)}
                              title={t('editPerson')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => setSelectedForDelete(p)}
                              title={t('deletePerson')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="card-footer bg-white p-3 border-0 d-flex align-items-center justify-content-between">
              <span className="small text-muted">
                Page {page} of {totalPages} ({total} total records)
              </span>

              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PersonFormModal
        person={selectedForEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={checkAuthAndFetch}
      />

      <DeleteConfirmModal
        person={selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onSuccess={checkAuthAndFetch}
      />

      <PersonDetailModal
        person={selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
      />
    </div>
  );
}
