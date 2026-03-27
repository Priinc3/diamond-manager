'use client';

import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Person, MoneyTransaction, DiamondTransaction } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Diamond,
  Plus,
  Search,
  Phone,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PersonWithSummary extends Person {
  total_receivable: number;
  total_payable: number;
  net_balance: number;
  diamonds_given: number;
  diamonds_received: number;
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

import { useLanguage } from '@/context/LanguageContext';

function DashboardContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [people, setPeople] = useState<PersonWithSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: peopleData, error: pErr } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (pErr) throw pErr;

      const { data: moneyData, error: mErr } = await supabase
        .from('money_transactions')
        .select('*')
        .eq('user_id', user.id);

      if (mErr) throw mErr;

      const { data: diamondData, error: dErr } = await supabase
        .from('diamond_transactions')
        .select('*')
        .eq('user_id', user.id);

      if (dErr) throw dErr;

      const enrichedPeople: PersonWithSummary[] = (peopleData || []).map((person: Person) => {
        const personMoney = (moneyData || []).filter((t: MoneyTransaction) => t.person_id === person.id);
        const personDiamonds = (diamondData || []).filter((t: DiamondTransaction) => t.person_id === person.id);

        const totalReceivable = personMoney
          .filter((t: MoneyTransaction) => t.type === 'receivable')
          .reduce((sum: number, t: MoneyTransaction) => sum + Number(t.amount), 0);

        const totalPayable = personMoney
          .filter((t: MoneyTransaction) => t.type === 'payable')
          .reduce((sum: number, t: MoneyTransaction) => sum + Number(t.amount), 0);

        const diamondsGiven = personDiamonds
          .filter((t: DiamondTransaction) => t.type === 'given')
          .reduce((sum: number, t: DiamondTransaction) => sum + Number(t.quantity), 0);

        const diamondsReceived = personDiamonds
          .filter((t: DiamondTransaction) => t.type === 'received')
          .reduce((sum: number, t: DiamondTransaction) => sum + Number(t.quantity), 0);

        return {
          ...person,
          total_receivable: totalReceivable,
          total_payable: totalPayable,
          net_balance: totalReceivable - totalPayable,
          diamonds_given: diamondsGiven,
          diamonds_received: diamondsReceived,
        };
      });

      setPeople(enrichedPeople);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalReceivable = people.reduce((s, p) => s + p.total_receivable, 0);
  const totalPayable = people.reduce((s, p) => s + p.total_payable, 0);
  const totalDiamondsGiven = people.reduce((s, p) => s + p.diamonds_given, 0);
  const totalDiamondsReceived = people.reduce((s, p) => s + p.diamonds_received, 0);

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = people
    .filter((p) => p.net_balance !== 0)
    .sort((a, b) => Math.abs(b.net_balance) - Math.abs(a.net_balance))
    .slice(0, 8)
    .map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      balance: p.net_balance,
    }));

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('Delete this person and all their transactions?')) return;
    try {
      await supabase.from('money_transactions').delete().eq('person_id', personId);
      await supabase.from('diamond_transactions').delete().eq('person_id', personId);
      const { error } = await supabase.from('people').delete().eq('id', personId);
      if (error) throw error;
      toast.success('Person deleted');
      fetchDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete person');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('dashboard')}</h1>
        <p className="page-subtitle">Overview of your diamond business</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total People</span>
            <div className="stat-card-icon accent">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-card-value">{people.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{t('positiveBalance')}</span>
            <div className="stat-card-icon success">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalReceivable)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{t('negativeBalance')}</span>
            <div className="stat-card-icon danger">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalPayable)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{t('totalDiamondsOut')}</span>
            <div className="stat-card-icon info">
              <Diamond size={20} />
            </div>
          </div>
          <div className="stat-card-value">{totalDiamondsGiven}</div>
          <div className="stat-card-change neutral" style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
            {t('totalDiamondsIn')}: {totalDiamondsReceived} {t('quantity')}
          </div>
        </div>
      </div>

      {/* Chart + People */}
      <div className="two-col-grid" style={{ marginBottom: 24 }}>
        <div className="card" style={{ animationDelay: '200ms' }}>
          <div className="card-header">
            <h3 className="card-title">Net Balance by Person</h3>
          </div>
          <div className="card-body">
            {chartData.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#9ca3af' }} 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), t('netBalanceByPerson')]}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.balance >= 0 ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="table-empty">
                <p>{t('noBalanceData')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ animationDelay: '260ms' }}>
          <div className="card-header">
            <h3 className="card-title">{t('quickSummary')}</h3>
          </div>
          <div className="card-body">
            <div className="net-balance-row" style={{ marginTop: 0 }}>
              <span className="net-balance-label">Net Balance (They owe − I owe)</span>
              <span
                className={`net-balance-value ${
                  totalReceivable - totalPayable >= 0 ? 'amount-positive' : 'amount-negative'
                }`}
              >
                {formatCurrency(totalReceivable - totalPayable)}
              </span>
            </div>
            <div className="net-balance-row">
              <span className="net-balance-label">Diamonds Out (with others)</span>
              <span className="net-balance-value" style={{ color: 'var(--info)' }}>
                {totalDiamondsGiven} pcs
              </span>
            </div>
            <div className="net-balance-row">
              <span className="net-balance-label">Diamonds In (with me)</span>
              <span className="net-balance-value" style={{ color: 'var(--accent)' }}>
                {totalDiamondsReceived} pcs
              </span>
            </div>
            <div className="net-balance-row">
              <span className="net-balance-label">Net Diamond Position</span>
              <span
                className={`net-balance-value ${
                  totalDiamondsGiven - totalDiamondsReceived > 0 ? 'amount-negative' : 'amount-positive'
                }`}
              >
                {totalDiamondsGiven - totalDiamondsReceived > 0 ? '-' : '+'}
                {Math.abs(totalDiamondsGiven - totalDiamondsReceived)} pcs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* People Section */}
      <div className="card" style={{ animationDelay: '320ms' }}>
        <div className="card-header">
          <h3 className="card-title">{t('peopleDirectory')} ({filteredPeople.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddPerson(true)}>
            <Plus size={16} />
            {t('addPerson')}
          </button>
        </div>
        <div className="card-body">
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading people...</p>
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon">
                <Users size={40} />
              </div>
              <p>{searchQuery ? 'No people match your search' : t('noBalanceData')}</p>
            </div>
          ) : (
            <div className="people-grid">
              {filteredPeople.map((person, index) => (
                <div
                  key={person.id}
                  className="person-card"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="person-card-header">
                    <div className="person-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="person-name">{person.name}</div>
                      {person.phone && (
                        <div className="person-phone">
                          <Phone size={10} style={{ display: 'inline', marginRight: 4 }} />
                          {person.phone}
                        </div>
                      )}
                    </div>
                    <div className="table-actions">
                      <button
                        onClick={() => setEditPerson(person)}
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePerson(person.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="person-stats">
                    <div className="person-stat">
                      <div className="person-stat-label">They Owe Me</div>
                      <div className="person-stat-value positive">
                        {formatCurrency(person.total_receivable)}
                      </div>
                    </div>
                    <div className="person-stat">
                      <div className="person-stat-label">I Owe Them</div>
                      <div className="person-stat-value negative">
                        {formatCurrency(person.total_payable)}
                      </div>
                    </div>
                    <div className="person-stat">
                      <div className="person-stat-label">💎 Out</div>
                      <div className="person-stat-value neutral">{person.diamonds_given}</div>
                    </div>
                    <div className="person-stat">
                      <div className="person-stat-label">💎 In</div>
                      <div className="person-stat-value neutral">{person.diamonds_received}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Person Modal */}
      {(showAddPerson || editPerson) && (
        <PersonModal
          person={editPerson}
          userId={user?.id || ''}
          onClose={() => {
            setShowAddPerson(false);
            setEditPerson(null);
          }}
          onSaved={() => {
            setShowAddPerson(false);
            setEditPerson(null);
            fetchDashboardData();
          }}
        />
      )}
    </>
  );
}

// ——— Person Modal Component ———
function PersonModal({
  person,
  userId,
  onClose,
  onSaved,
}: {
  person: Person | null;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(person?.name || '');
  const [phone, setPhone] = useState(person?.phone || '');
  const [email, setEmail] = useState(person?.email || '');
  const [notes, setNotes] = useState(person?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setIsSaving(true);
      if (person) {
        const { error } = await supabase
          .from('people')
          .update({ name: name.trim(), phone, email, notes })
          .eq('id', person.id);
        if (error) throw error;
        toast.success('Person updated');
      } else {
        const { error } = await supabase
          .from('people')
          .insert({ name: name.trim(), phone, email, notes, user_id: userId });
        if (error) throw error;
        toast.success('Person added');
      }
      onSaved();
    } catch (error) {
      console.error('Save person error:', error);
      toast.error('Failed to save person');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{person ? `${t('edit')} ${t('person')}` : `${t('addPerson')}`}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('person')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t('loading') : person ? t('save') : t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
