'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import BulkDeleteConfirmModal from '@/components/admin/BulkDeleteConfirmModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import PersonFormModal from '@/components/admin/PersonFormModal';
import { useLanguage } from '@/components/LanguageProvider';
import Pagination from '@/components/Pagination';
import PersonDetailModal from '@/components/PersonDetailModal';
import { PersonFilterOptions, PersonRecord } from '@/types';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Edit3,
  Eye,
  MinusSquare,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Square,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const router = useRouter();

  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(15);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<PersonFilterOptions>({ q: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

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
      if (filters.diksha_venue?.trim()) params.set('diksha_venue', filters.diksha_venue.trim());
      if (filters.diksha_ceremony_serial?.trim()) params.set('diksha_ceremony_serial', filters.diksha_ceremony_serial.trim());

      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

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
  }, [filters, page, limit, sortBy, sortOrder, router]);

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
    'diksha_venue',
    'diksha_ceremony_serial',
  ];

  const activeFilterCount = specificFilterKeys.reduce((acc, key) => {
    return filters[key] && filters[key]?.trim() ? acc + 1 : acc;
  }, 0);

  const handleGlobalQueryChange = (val: string) => {
    setFilters((prev) => ({ ...prev, q: val }));
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleFieldChange = (key: keyof PersonFilterOptions, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
    setSelectedIds(new Set());
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
      diksha_venue: '',
      diksha_ceremony_serial: '',
    });
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleSortColumn = (columnField: string) => {
    if (sortBy === columnField) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnField);
      // For dates and timestamps, default to descending (newest first)
      if (columnField === 'created_at' || columnField === 'diksha_date') {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    }
    setPage(1);
  };

  const renderSortIndicator = (columnField: string) => {
    if (sortBy === columnField) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={14} className="text-primary th-sort-arrow" />
      ) : (
        <ArrowDown size={14} className="text-primary th-sort-arrow" />
      );
    }
    return <ArrowUpDown size={13} className="th-sort-arrow opacity-40" />;
  };

  // Row Selection logic
  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllOnPageSelected =
    persons.length > 0 && persons.every((p) => selectedIds.has(p.id));
  const isSomeOnPageSelected =
    persons.some((p) => selectedIds.has(p.id)) && !isAllOnPageSelected;

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllOnPageSelected) {
        persons.forEach((p) => next.delete(p.id));
      } else {
        persons.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const selectedPersonsList = persons.filter((p) => selectedIds.has(p.id));

  const handleBulkDeleteSuccess = () => {
    setSelectedIds(new Set());
    checkAuthAndFetch();
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
                <h2 className="display-6 fw-bold text-dark mb-0 tracking-tight font-mono">
                  {total.toLocaleString()}
                </h2>
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
              {/* Comma-separated Unique IDs */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label-custom">{t('uniqueId')}</label>
                <input
                  type="text"
                  className="form-control-custom font-mono"
                  placeholder={t('uniqueIdPlaceholder')}
                  value={filters.unique_id || ''}
                  onChange={(e) => handleFieldChange('unique_id', e.target.value)}
                />
                <span className="extra-small text-muted mt-1 d-block" style={{ fontSize: '0.7rem' }}>
                  {language === 'bn' ? 'কমা (,) দিয়ে একাধিক নম্বর খুঁজুন' : 'Separate multiple IDs with commas'}
                </span>
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
                <label className="form-label-custom">{t('dikshaVenue')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('dikshaVenue')}
                  value={filters.diksha_venue || ''}
                  onChange={(e) => handleFieldChange('diksha_venue', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label-custom">{t('dikshaCeremonySerial')}</label>
                <input
                  type="text"
                  className="form-control-custom font-mono"
                  placeholder={t('dikshaCeremonySerial')}
                  value={filters.diksha_ceremony_serial || ''}
                  onChange={(e) => handleFieldChange('diksha_ceremony_serial', e.target.value)}
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
                <label className="form-label-custom">{t('occupation')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('occupation')}
                  value={filters.occupation || ''}
                  onChange={(e) => handleFieldChange('occupation', e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label-custom">{t('education')}</label>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder={t('education')}
                  value={filters.education || ''}
                  onChange={(e) => handleFieldChange('education', e.target.value)}
                />
              </div>

              <div className="col-12">
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

        {/* Floating / Sticky Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div
            className="p-3 px-4 mb-3 bg-dark text-white rounded-3 shadow-lg d-flex flex-wrap align-items-center justify-content-between gap-3 animate-fade-in"
            style={{ borderLeft: '4px solid #ef4444' }}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="badge rounded-pill bg-danger px-3 py-1.5 fw-bold font-mono fs-6">
                {selectedIds.size}
              </span>
              <span className="fw-semibold">
                {language === 'bn'
                  ? `${selectedIds.size} টি রেকর্ড নির্বাচন করা হয়েছে`
                  : `${selectedIds.size} records selected`}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 px-3 py-1.5"
                onClick={() => setSelectedIds(new Set())}
              >
                <X size={14} />
                <span>{t('clearSelection')}</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-danger d-flex align-items-center gap-1.5 px-3.5 py-1.5 fw-bold shadow-sm"
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                <Trash2 size={15} />
                <span>
                  {language === 'bn'
                    ? `নির্বাচিত ${selectedIds.size} টি মুছুন`
                    : `Delete Selected (${selectedIds.size})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Records Table Card */}
        <div className="saas-table-container">
          <div className="p-3.5 px-4 bg-white border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <h5 className="fw-bold text-dark mb-0 fs-6">{t('adminDashboard')}</h5>
              <span className="badge-unique-id" style={{ fontSize: '0.75rem' }}>
                {total.toLocaleString()} {t('records')}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                >
                  <Trash2 size={14} />
                  <span>
                    {language === 'bn'
                      ? `মুছুন (${selectedIds.size})`
                      : `Delete (${selectedIds.size})`}
                  </span>
                </button>
              )}

              <button
                type="button"
                className="btn-rkm-primary btn-sm px-3.5"
                onClick={handleOpenAdd}
              >
                <Plus size={16} />
                <span>{t('addNewPerson')}</span>
              </button>
            </div>
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
                    {/* Master Checkbox Column */}
                    <th style={{ width: '45px' }} className="text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-dark border-0 d-inline-flex align-items-center justify-content-center"
                        onClick={toggleSelectAllOnPage}
                        title={isAllOnPageSelected ? t('deselectAll') : t('selectAll')}
                      >
                        {isAllOnPageSelected ? (
                          <CheckSquare size={18} className="text-primary" />
                        ) : isSomeOnPageSelected ? (
                          <MinusSquare size={18} className="text-primary" />
                        ) : (
                          <Square size={18} className="text-muted" />
                        )}
                      </button>
                    </th>

                    {/* Sortable Initiation Number */}
                    <th
                      style={{ width: '135px' }}
                      className={`th-sortable ${sortBy === 'unique_id' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('unique_id')}
                      title={`Click to sort by ${t('uniqueId')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('uniqueId')}</span>
                        {renderSortIndicator('unique_id')}
                      </div>
                    </th>

                    {/* Sortable Name */}
                    <th
                      style={{ width: '180px' }}
                      className={`th-sortable ${sortBy === 'name' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('name')}
                      title={`Click to sort by ${t('name')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('name')}</span>
                        {renderSortIndicator('name')}
                      </div>
                    </th>

                    {/* Sortable Father / Spouse */}
                    <th
                      style={{ width: '160px' }}
                      className={`th-sortable ${sortBy === 'father_or_spouse_name' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('father_or_spouse_name')}
                      title={`Click to sort by ${t('fatherOrSpouseName')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('fatherOrSpouseName')}</span>
                        {renderSortIndicator('father_or_spouse_name')}
                      </div>
                    </th>

                    {/* Sortable Diksha Date */}
                    <th
                      style={{ width: '125px' }}
                      className={`th-sortable ${sortBy === 'diksha_date' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('diksha_date')}
                      title={`Click to sort by ${t('dikshaDate')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('dikshaDate')}</span>
                        {renderSortIndicator('diksha_date')}
                      </div>
                    </th>

                    {/* Sortable Diksha Guru */}
                    <th
                      style={{ width: '150px' }}
                      className={`th-sortable ${sortBy === 'diksha_guru' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('diksha_guru')}
                      title={`Click to sort by ${t('dikshaGuru')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('dikshaGuru')}</span>
                        {renderSortIndicator('diksha_guru')}
                      </div>
                    </th>

                    {/* Sortable Diksha Venue (Added in place of Address and Mobile Number) */}
                    <th
                      style={{ width: '160px' }}
                      className={`th-sortable ${sortBy === 'diksha_venue' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('diksha_venue')}
                      title={`Click to sort by ${t('dikshaVenue')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('dikshaVenue')}</span>
                        {renderSortIndicator('diksha_venue')}
                      </div>
                    </th>

                    {/* Sortable Entry Date */}
                    <th
                      style={{ width: '130px' }}
                      className={`th-sortable ${sortBy === 'created_at' ? 'active text-primary' : ''}`}
                      onClick={() => handleSortColumn('created_at')}
                      title={`Click to sort by ${t('entryDate')}`}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{t('entryDate')}</span>
                        {renderSortIndicator('created_at')}
                      </div>
                    </th>

                    <th style={{ width: '110px' }} className="text-end">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map((p) => {
                    const isSelected = selectedIds.has(p.id);
                    const formattedEntryDate = p.created_at
                      ? new Date(p.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={p.id} className={isSelected ? 'table-active' : ''}>
                        {/* Row Checkbox */}
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-link p-0 text-dark border-0 d-inline-flex align-items-center justify-content-center"
                            onClick={() => toggleSelectRow(p.id)}
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-primary" />
                            ) : (
                              <Square size={18} className="text-muted" />
                            )}
                          </button>
                        </td>

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

                        {/* Diksha Venue Cell */}
                        <td>
                          {p.diksha_venue ? (
                            <div className="d-flex align-items-center gap-1.5 small text-dark fw-medium text-truncate" style={{ maxWidth: '170px' }} title={p.diksha_venue}>
                              <Compass size={13} className="text-primary flex-shrink-0" />
                              <span className="text-truncate">{p.diksha_venue}</span>
                            </div>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        {/* Entry Date */}
                        <td>
                          <div className="d-flex align-items-center gap-1.5 text-secondary small font-mono" title={p.created_at ? new Date(p.created_at).toLocaleString() : ''}>
                            <Clock size={12} className="text-muted flex-shrink-0" />
                            <span>{formattedEntryDate}</span>
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Full Pagination Footer */}
          <div className="p-3 bg-white border-top">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={total}
              limit={limit}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
                setSelectedIds(new Set());
              }}
              limitOptions={[15, 30, 50, 100]}
            />
          </div>
        </div>
      </div>

      {/* Single Delete Modal */}
      <DeleteConfirmModal
        person={selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onSuccess={checkAuthAndFetch}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteConfirmModal
        selectedPersons={selectedPersonsList}
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onSuccess={handleBulkDeleteSuccess}
      />

      {/* Add / Edit Form Modal */}
      <PersonFormModal
        person={selectedForEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={checkAuthAndFetch}
      />

      {/* View Details Modal */}
      <PersonDetailModal
        person={selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
      />
    </div>
  );
}
