'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import PersonFormModal from '@/components/admin/PersonFormModal';
import { useLanguage } from '@/components/LanguageProvider';
import PersonDetailModal from '@/components/PersonDetailModal';
import { PersonRecord, PersonFilterOptions } from '@/types';
import { ChevronLeft, ChevronRight, Edit3, Eye, Plus, Search, Trash2, Users, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, Calendar, Award, Phone } from 'lucide-react';
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
        {/* Top Metric & Search Toolbar */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4 col-lg-3">
            <div className="stat-card-modern h-100">
              <div>
                <span className="form-label-custom mb-1">{t('totalRecords')}</span>
                <h2 className="display-6 fw-bold text-dark mb-0 tracking-tight">{total}</h2>
              </div>
              <div className="stat-icon-wrapper stat-icon-blue">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8 col-lg-9">
            <div className="search-container-box h-100">
              <div className="ps-2 pe-1 text-muted">
                <Search size={20} className="text-secondary" />
              </div>
              <input
                type="text"
                className="search-input-field flex-grow-1"
                placeholder={t('searchAllFieldsPlaceholder')}
                value={filters.q || ''}
                onChange={(e) => handleGlobalQueryChange(e.target.value)}
              />
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3 border transition-all ${
                  showAdvanced || activeFilterCount > 0
                    ? 'btn-light border-secondary text-dark fw-bold'
                    : 'btn-light border-slate-200 text-secondary'
                }`}
                onClick={() => setShowAdvanced(!showAdvanced)}
                title={t('filters')}
              >
                <SlidersHorizontal size={15} />
                <span className="d-none d-sm-inline">{t('filters')}</span>
                {activeFilterCount > 0 && (
                  <span className="badge rounded-pill bg-dark text-white px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                    {activeFilterCount}
                  </span>
                )}
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {(filters.q || activeFilterCount > 0) && (
                <button
                  type="button"
                  className="btn-icon-ghost text-danger"
                  onClick={handleClearFilters}
                  title={t('clearFilters')}
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filters for Admin */}
        {showAdvanced && (
          <div className="filter-drawer-card mb-4 animate-fade-in">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
              <div className="d-flex align-items-center gap-2">
                <SlidersHorizontal size={16} className="text-secondary" />
                <span className="fw-bold text-dark fs-6">{t('advancedFilters')}</span>
                {activeFilterCount > 0 && (
                  <span className="chip-tag chip-orange">
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
                  <RotateCcw size={14} />
                  <span>{t('clearFilters')}</span>
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('uniqueId')}</label>
                <input
                  type="text"
                  className="form-control-custom font-mono"
                  placeholder={t('uniqueId')}
                  value={filters.unique_id || ''}
                  onChange={(e) => handleFieldChange('unique_id', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('name')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('name')}
                  value={filters.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('fatherOrSpouseName')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('fatherOrSpouseName')}
                  value={filters.father_or_spouse_name || ''}
                  onChange={(e) => handleFieldChange('father_or_spouse_name', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label-custom">{t('age')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('age')}
                  value={filters.age || ''}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label-custom">{t('mobileNumber')}</label>
                <input
                  type="text"
                  className="form-control-custom font-mono"
                  placeholder={t('mobileNumber')}
                  value={filters.mobile_number || ''}
                  onChange={(e) => handleFieldChange('mobile_number', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label-custom">{t('dikshaGuru')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('dikshaGuru')}
                  value={filters.diksha_guru || ''}
                  onChange={(e) => handleFieldChange('diksha_guru', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label-custom">{t('dikshaDate')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('dikshaDate')}
                  value={filters.diksha_date || ''}
                  onChange={(e) => handleFieldChange('diksha_date', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('occupation')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('occupation')}
                  value={filters.occupation || ''}
                  onChange={(e) => handleFieldChange('occupation', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('education')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('education')}
                  value={filters.education || ''}
                  onChange={(e) => handleFieldChange('education', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('address')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('address')}
                  value={filters.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Records Table Card */}
        <div className="saas-table-container">
          <div className="p-3.5 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <h5 className="fw-bold text-dark mb-0 fs-6">{t('adminDashboard')}</h5>
            <button
              type="button"
              className="btn-rkm-primary btn-sm px-3.5"
              onClick={handleOpenAdd}
            >
              <Plus size={16} />
              <span>{t('addNewPerson')}</span>
            </button>
          </div>

          <div className="table-responsive">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : persons.length === 0 ? (
              <div className="text-center py-5 text-muted small">
                No records found matching the criteria.
              </div>
            ) : (
              <table className="saas-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>{t('uniqueId')}</th>
                    <th style={{ width: '200px' }}>{t('name')}</th>
                    <th style={{ width: '170px' }}>{t('fatherOrSpouseName')}</th>
                    <th style={{ width: '130px' }}>{t('mobileNumber')}</th>
                    <th style={{ width: '115px' }}>{t('dikshaDate')}</th>
                    <th style={{ width: '150px' }}>{t('dikshaGuru')}</th>
                    <th>{t('address')}</th>
                    <th style={{ width: '110px' }} className="text-end">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="badge-unique-id">
                          {p.unique_id}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{p.name}</div>
                      </td>
                      <td>
                        <span className="text-secondary small">{p.father_or_spouse_name || '—'}</span>
                      </td>
                      <td>
                        {p.mobile_number ? (
                          <span className="chip-tag chip-green font-mono">
                            <Phone size={11} />
                            <span>{p.mobile_number}</span>
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {p.diksha_date ? (
                          <span className="chip-tag chip-orange">
                            <Calendar size={11} />
                            <span>{p.diksha_date}</span>
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        {p.diksha_guru ? (
                          <span className="chip-tag chip-maroon">
                            <Award size={11} />
                            <span>{p.diksha_guru}</span>
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <div className="whitespace-pre-line small text-secondary text-truncate-2" style={{ maxWidth: '240px' }}>
                          {p.address}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn-icon-ghost primary"
                            onClick={() => setSelectedForDetail(p)}
                            title={t('viewDetails')}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-ghost warning"
                            onClick={() => handleOpenEdit(p)}
                            title={t('editPerson')}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-ghost danger"
                            onClick={() => setSelectedForDelete(p)}
                            title={t('deletePerson')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3 px-4 bg-white border-top d-flex align-items-center justify-content-between">
              <span className="small text-muted">
                Page {page} of {totalPages} ({total} total records)
              </span>

              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-light border px-2.5 rounded-2"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light border px-2.5 rounded-2"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  <ChevronRight size={16} />
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
