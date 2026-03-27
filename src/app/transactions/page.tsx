'use client';

import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Person, DiamondType, MoneyTransaction, DiamondTransaction } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Diamond,
  Banknote,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function TransactionsPage() {
  return (
    <AppShell>
      <TransactionsContent />
    </AppShell>
  );
}

function TransactionsContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'money' | 'diamond'>('money');
  const [people, setPeople] = useState<Person[]>([]);
  const [diamondTypes, setDiamondTypes] = useState<DiamondType[]>([]);
  const [moneyTransactions, setMoneyTransactions] = useState<MoneyTransaction[]>([]);
  const [diamondTransactions, setDiamondTransactions] = useState<DiamondTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);

      const [peopleRes, typesRes, moneyRes, diamondRes] = await Promise.all([
        supabase.from('people').select('*').eq('user_id', user.id).order('name'),
        supabase.from('diamond_types').select('*').eq('user_id', user.id).order('name'),
        supabase.from('money_transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('diamond_transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      if (peopleRes.error) throw peopleRes.error;
      if (typesRes.error) throw typesRes.error;
      if (moneyRes.error) throw moneyRes.error;
      if (diamondRes.error) throw diamondRes.error;

      setPeople(peopleRes.data || []);
      setDiamondTypes(typesRes.data || []);
      setMoneyTransactions(moneyRes.data || []);
      setDiamondTransactions(diamondRes.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPersonName = (personId: string) => {
    return people.find((p) => p.id === personId)?.name || 'Unknown';
  };

  const getDiamondTypeName = (typeId: string) => {
    return diamondTypes.find((t) => t.id === typeId)?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteMoney = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      const { error } = await supabase.from('money_transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Transaction deleted');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const handleDeleteDiamond = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      const { error } = await supabase.from('diamond_transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Transaction deleted');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const filteredMoney = moneyTransactions.filter((t) => {
    const personName = getPersonName(t.person_id).toLowerCase();
    const matchesSearch = personName.includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPerson = !filterPerson || t.person_id === filterPerson;
    return matchesSearch && matchesPerson;
  });

  const filteredDiamonds = diamondTransactions.filter((t) => {
    const personName = getPersonName(t.person_id).toLowerCase();
    const matchesSearch = personName.includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPerson = !filterPerson || t.person_id === filterPerson;
    return matchesSearch && matchesPerson;
  });

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('transactions')}</h1>
        <p className="page-subtitle">{t('transactionSubtitle') || 'Record money and diamond transactions'}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'money' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('money')}
          >
            <Banknote size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {t('money')}
          </button>
          <button
            className={`tab ${activeTab === 'diamond' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('diamond')}
          >
            <Diamond size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {t('diamonds')}
          </button>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
          disabled={people.length === 0}
        >
          <Plus size={16} />
          {t('add')} {activeTab === 'money' ? t('money') : t('diamonds')} {t('transaction')}
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder={t('searchTransactions')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterPerson}
          onChange={(e) => setFilterPerson(e.target.value)}
        >
          <option value="">{t('allPeople')}</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>{t('loadingTransactions')}</p>
          </div>
        ) : activeTab === 'money' ? (
          <>
            {/* DESKTOP TABLE */}
            <div className="table-wrapper desktop-table-only">
              <table>
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('person')}</th>
                    <th>{t('type')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('description')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMoney.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="table-empty">
                          <Banknote size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                          <p>{t('noMoneyTransactions')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMoney.map((trans) => (
                      <tr key={trans.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} color="var(--text-tertiary)" />
                            {formatDate(trans.date)}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{getPersonName(trans.person_id)}</span>
                        </td>
                        <td>
                          {trans.type === 'receivable' ? (
                            <span className="badge badge-success">
                              <ArrowDownLeft size={12} style={{ marginRight: 4 }} />
                              {t('positiveBalance')}
                            </span>
                          ) : (
                            <span className="badge badge-danger">
                              <ArrowUpRight size={12} style={{ marginRight: 4 }} />
                              {t('negativeBalance')}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`amount ${trans.type === 'receivable' ? 'amount-positive' : 'amount-negative'}`}>
                            {formatCurrency(Number(trans.amount))}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          {trans.description || '—'}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="delete-btn" onClick={() => handleDeleteMoney(trans.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="mobile-list-view mobile-list-only">
              {filteredMoney.length === 0 ? (
                <div className="table-empty">
                  <Banknote size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p>{t('noMoneyTransactions')}</p>
                </div>
              ) : (
                filteredMoney.map((trans) => (
                  <div key={trans.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <div>
                        <div className="mobile-card-title">{getPersonName(trans.person_id)}</div>
                        <div className="mobile-card-subtitle">
                          <Calendar size={12} /> {formatDate(trans.date)}
                        </div>
                      </div>
                      {trans.type === 'receivable' ? (
                        <span className="badge badge-success">{t('positiveBalance')}</span>
                      ) : (
                        <span className="badge badge-danger">{t('negativeBalance')}</span>
                      )}
                    </div>
                    <div className="mobile-card-body">
                      <div>
                        <span className={`amount ${trans.type === 'receivable' ? 'amount-positive' : 'amount-negative'}`} style={{ fontSize: 18 }}>
                          {formatCurrency(Number(trans.amount))}
                        </span>
                        {trans.description && (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {trans.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mobile-card-footer">
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t('id')}: {trans.id.slice(0, 8)}</span>
                      <div className="table-actions">
                        <button className="delete-btn" onClick={() => handleDeleteMoney(trans.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="table-wrapper desktop-table-only">
              <table>
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('person')}</th>
                    <th>{t('type')}</th>
                    <th>{t('diamond')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('weight')}</th>
                    <th>{t('description')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiamonds.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="table-empty">
                          <Diamond size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                          <p>{t('noDiamondTransactions')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDiamonds.map((trans) => (
                      <tr key={trans.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} color="var(--text-tertiary)" />
                            {formatDate(trans.date)}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{getPersonName(trans.person_id)}</span>
                        </td>
                        <td>
                          {trans.type === 'given' ? (
                            <span className="badge badge-warning">
                              <ArrowUpRight size={12} style={{ marginRight: 4 }} />
                              {t('given')}
                            </span>
                          ) : (
                            <span className="badge badge-info">
                              <ArrowDownLeft size={12} style={{ marginRight: 4 }} />
                              {t('received')}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-accent">{getDiamondTypeName(trans.diamond_type_id)}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{trans.quantity}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{trans.weight ? `${trans.weight} ct` : '—'}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          {trans.description || '—'}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="delete-btn" onClick={() => handleDeleteDiamond(trans.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="mobile-list-view mobile-list-only">
              {filteredDiamonds.length === 0 ? (
                <div className="table-empty">
                  <Diamond size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p>{t('noDiamondTransactions')}</p>
                </div>
              ) : (
                filteredDiamonds.map((trans) => (
                  <div key={trans.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <div>
                        <div className="mobile-card-title">{getPersonName(trans.person_id)}</div>
                        <div className="mobile-card-subtitle">
                          <Calendar size={12} /> {formatDate(trans.date)}
                        </div>
                      </div>
                      {trans.type === 'given' ? (
                        <span className="badge badge-warning">{t('given')}</span>
                      ) : (
                        <span className="badge badge-info">{t('received')}</span>
                      )}
                    </div>
                    <div className="mobile-card-body">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                          {trans.quantity} {t('quantity')}
                          {trans.weight ? ` · ${trans.weight} ct` : ''}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <span className="badge badge-accent">{getDiamondTypeName(trans.diamond_type_id)}</span>
                        </div>
                        {trans.description && (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                            {trans.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mobile-card-footer">
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t('id')}: {trans.id.slice(0, 8)}</span>
                      <div className="table-actions">
                        <button className="delete-btn" onClick={() => handleDeleteDiamond(trans.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        activeTab === 'money' ? (
          <AddMoneyModal
            people={people}
            userId={user?.id || ''}
            onClose={() => setShowAddModal(false)}
            onSaved={() => {
              setShowAddModal(false);
              fetchData();
            }}
          />
        ) : (
          <AddDiamondModal
            people={people}
            diamondTypes={diamondTypes}
            userId={user?.id || ''}
            onClose={() => setShowAddModal(false)}
            onSaved={() => {
              setShowAddModal(false);
              fetchData();
            }}
          />
        )
      )}
    </>
  );
}

// ——— Add Money Transaction Modal ———
function AddMoneyModal({
  people,
  userId,
  onClose,
  onSaved,
}: {
  people: Person[];
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [personId, setPersonId] = useState('');
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) { toast.error(t('selectPersonToast')); return; }
    if (!amount || Number(amount) <= 0) { toast.error(t('enterAmountToast')); return; }

    try {
      setIsSaving(true);
      const { error } = await supabase.from('money_transactions').insert({
        person_id: personId,
        type,
        amount: Number(amount),
        description,
        date,
        user_id: userId,
      });
      if (error) throw error;
      toast.success('Money transaction added');
      onSaved();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to add transaction');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('add')} {t('money')} {t('transaction')}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('person')} *</label>
              <select className="form-select" value={personId} onChange={(e) => setPersonId(e.target.value)}>
                <option value="">{t('selectPerson')}</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('type')} *</label>
              <div className="tabs" style={{ width: '100%' }}>
                <button
                  type="button"
                  className={`tab ${type === 'receivable' ? 'tab-active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setType('receivable')}
                >
                  {t('positiveBalance')}
                </button>
                <button
                  type="button"
                  className={`tab ${type === 'payable' ? 'tab-active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setType('payable')}
                >
                  {t('negativeBalance')}
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('amountInRupees')} *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('date')} *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('description')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('optionalNote')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t('loading') : `${t('add')} ${t('transaction')}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ——— Add Diamond Transaction Modal ———
function AddDiamondModal({
  people,
  diamondTypes,
  userId,
  onClose,
  onSaved,
}: {
  people: Person[];
  diamondTypes: DiamondType[];
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [personId, setPersonId] = useState('');
  const [diamondTypeId, setDiamondTypeId] = useState('');
  const [type, setType] = useState<'given' | 'received'>('given');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) { toast.error(t('selectPersonToast')); return; }
    if (!diamondTypeId) { toast.error(t('selectDiamondTypeToast')); return; }
    if (!quantity || Number(quantity) <= 0) { toast.error(t('enterQuantityToast')); return; }

    try {
      setIsSaving(true);
      const { error } = await supabase.from('diamond_transactions').insert({
        person_id: personId,
        diamond_type_id: diamondTypeId,
        type,
        quantity: Number(quantity),
        weight: weight ? Number(weight) : null,
        description,
        date,
        user_id: userId,
      });
      if (error) throw error;
      toast.success('Diamond transaction added');
      onSaved();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to add transaction');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('add')} {t('diamond')} {t('transaction')}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('person')} *</label>
              <select className="form-select" value={personId} onChange={(e) => setPersonId(e.target.value)}>
                <option value="">{t('selectPerson')}</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('diamond')} {t('type')} *</label>
              <select className="form-select" value={diamondTypeId} onChange={(e) => setDiamondTypeId(e.target.value)}>
                <option value="">{t('selectType')}</option>
                {diamondTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.shape ? ` — ${t.shape}` : ''}{t.size ? ` (${t.size})` : ''}
                  </option>
                ))}
              </select>
              {diamondTypes.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>
                  {t('noDiamondTypesWarning') || 'No diamond types yet. Add them in Settings first.'}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">{t('type')} *</label>
              <div className="tabs" style={{ width: '100%' }}>
                <button
                  type="button"
                  className={`tab ${type === 'given' ? 'tab-active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setType('given')}
                >
                  {t('given')} ({t('theyHaveMine')})
                </button>
                <button
                  type="button"
                  className={`tab ${type === 'received' ? 'tab-active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setType('received')}
                >
                  {t('received')} ({t('iHaveTheirs')})
                </button>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('quantity')} *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('weightInCarats')}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={t('neutralBalance')}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('date')} *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('description')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('optionalNote')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t('loading') : `${t('add')} ${t('transaction')}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
