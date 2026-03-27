'use client';

import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { DiamondType } from '@/lib/types';
import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  X,
  Diamond,
  Edit3,
  Gem,
  Palette,
  Ruler,
  Award,
  Languages,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}

function SettingsContent() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [diamondTypes, setDiamondTypes] = useState<DiamondType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editType, setEditType] = useState<DiamondType | null>(null);

  const fetchTypes = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('diamond_types')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDiamondTypes(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(t('loading'));
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete') + '?')) return;
    try {
      const { error } = await supabase.from('diamond_types').delete().eq('id', id);
      if (error) throw error;
      toast.success(`${t('delete')} ${t('successful')}`);
      fetchTypes();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`${t('delete')} ${t('failed')}`);
    }
  };

  const shapeColors: Record<string, string> = {
    round: '#3b82f6',
    princess: '#8b5cf6',
    oval: '#ec4899',
    marquise: '#f59e0b',
    pear: '#10b981',
    emerald: '#06b6d4',
    cushion: '#6366f1',
    heart: '#ef4444',
    asscher: '#14b8a6',
    radiant: '#f97316',
  };

  const getShapeColor = (shape?: string) => {
    if (!shape) return 'var(--accent)';
    return shapeColors[shape.toLowerCase()] || 'var(--accent)';
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('settings')}</h1>
        <p className="page-subtitle">{t('manageDiamondTypes')}</p>
      </div>

      <div className="settings-grid">
        {/* Left Panel - Language */}
        <div className="card animate-fade-in-up">
          <div className="card-body">
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              color: 'var(--accent)',
            }}>
              <Languages size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t('language')}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {t('selectLanguage')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                className={`tab ${language === 'en' ? 'tab-active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button 
                className={`tab ${language === 'gu' ? 'tab-active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                onClick={() => setLanguage('gu')}
              >
                ગુજરાતી (Gujarati)
              </button>
              <button 
                className={`tab ${language === 'hi' ? 'tab-active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                onClick={() => setLanguage('hi')}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>
        </div>

        {/* Middle Panel - Info */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="card-body">
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              color: 'var(--accent)',
            }}>
              <Gem size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t('diamondTypes')}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {t('manageDiamondTypes')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Palette size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('defineShapeSize')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Ruler size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('trackGrades')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('usedInTransactions')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Diamond Types List */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="card-header">
            <h3 className="card-title">
              {t('diamondTypesCount')} ({diamondTypes.length})
            </h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              {t('addType')}
            </button>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
              </div>
            ) : diamondTypes.length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-icon">
                  <Diamond size={40} />
                </div>
                <p>{t('noDiamondTypesYet')}</p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="table-wrapper desktop-table-only">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('name') || 'Name'}</th>
                        <th>{t('shape')}</th>
                        <th>{t('size')}</th>
                        <th>{t('colorClarity')}</th>
                        <th>{t('count')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {diamondTypes.map((type) => (
                        <tr key={type.id}>
                          <td>
                            <span style={{ fontWeight: 600 }}>{type.name}</span>
                          </td>
                          <td>{type.shape || '—'}</td>
                          <td>{type.size || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {type.quality ? <span className="badge badge-accent">{type.quality}</span> : '—'}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-warning">
                              0 {t('uses')}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => setEditType(type)}>
                                <Edit3 size={14} />
                              </button>
                              <button className="delete-btn" onClick={() => handleDelete(type.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE LIST */}
                <div className="mobile-list-view mobile-list-only">
                  {diamondTypes.map((type) => (
                    <div key={type.id} className="mobile-card animate-fade-in-up">
                      <div className="mobile-card-header">
                        <div>
                          <div className="mobile-card-title">{type.name}</div>
                          <div className="mobile-card-subtitle">
                            {type.shape && <span>{type.shape}</span>}
                            {type.shape && type.size && <span> · </span>}
                            {type.size && <span>{type.size}</span>}
                          </div>
                        </div>
                        <span className="badge badge-warning">
                          0 {t('uses')}
                        </span>
                      </div>
                      <div className="mobile-card-body">
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {type.quality && <span className="badge badge-accent">{type.quality}</span>}
                        </div>
                      </div>
                      <div className="mobile-card-footer">
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t('id')}: {type.id.slice(0, 8)}</span>
                        <div className="table-actions">
                          <button onClick={() => setEditType(type)}>
                            <Edit3 size={16} />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(type.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Diamond Type Modal */}
      {(showAddModal || editType) && (
        <DiamondTypeModal
          diamondType={editType}
          userId={user?.id || ''}
          onClose={() => {
            setShowAddModal(false);
            setEditType(null);
          }}
          onSaved={() => {
            setShowAddModal(false);
            setEditType(null);
            fetchTypes();
          }}
        />
      )}
    </>
  );
}

// ——— Diamond Type Modal ———
function DiamondTypeModal({
  diamondType,
  userId,
  onClose,
  onSaved,
}: {
  diamondType: DiamondType | null;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(diamondType?.name || '');
  const [shape, setShape] = useState(diamondType?.shape || '');
  const [size, setSize] = useState(diamondType?.size || '');
  const [quality, setQuality] = useState(diamondType?.quality || '');
  const [description, setDescription] = useState(diamondType?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const shapes = ['Round', 'Princess', 'Oval', 'Marquise', 'Pear', 'Emerald', 'Cushion', 'Heart', 'Asscher', 'Radiant'];
  const qualities = ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(`${t('name')} ${t('requiredField')}`);
      return;
    }
    try {
      setIsSaving(true);
      if (diamondType) {
        const { error } = await supabase
          .from('diamond_types')
          .update({ name: name.trim(), shape, size, quality, description })
          .eq('id', diamondType.id);
        if (error) throw error;
        toast.success(`${t('save')} ${t('successful')}`);
      } else {
        const { error } = await supabase
          .from('diamond_types')
          .insert({ name: name.trim(), shape, size, quality, description, user_id: userId });
        if (error) throw error;
        toast.success(`${t('save')} ${t('successful')}`);
      }
      onSaved();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`${t('save')} ${t('failed')}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{diamondType ? `${t('edit')} ${t('diamond')} ${t('type')}` : `${t('add')} ${t('diamond')} ${t('type')}`}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('name') || 'Name'} *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Round Brilliant 0.5ct"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('shape')}</label>
                <select className="form-select" value={shape} onChange={(e) => setShape(e.target.value)}>
                  <option value="">{t('selectType')}</option>
                  {shapes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('colorClarity')}</label>
                <select className="form-select" value={quality} onChange={(e) => setQuality(e.target.value)}>
                  <option value="">{t('selectType')}</option>
                  {qualities.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('size')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 0.50 ct, 1.00 ct, Small, Medium"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('description')}</label>
              <textarea
                className="form-textarea"
                placeholder={t('optionalNote')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t('loading') : diamondType ? t('save') : t('addType')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
