// src/pages/roles/PermissionListModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Lock, Pencil, Trash2, Plus, Save, Search, Loader2, AlertCircle } from 'lucide-react';
import { listPermissions, createPermission, updatePermission, deletePermission } from '../../services/rolePermissionService';
import { modalCss } from '../products/modalStyles';
import { roleCss } from './roleStyles';
import ConfirmDeleteModal from '../brands/ConfirmDeleteModal';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.permissions)) return res.permissions;
  return [];
};

export default function PermissionListModal({ isOpen, onClose, onSuccessRole }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');

  // Form Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deletingPerm, setDeletingPerm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (isOpen) { setQuery(''); setIsFormOpen(false); setErrorMsg(''); fetchPermissions(); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !deletingPerm) onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, deletingPerm]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await listPermissions();
      setPermissions(extractArray(res));
    } catch (err) {
      setErrorMsg('បរាជ័យក្នុងការទាញយកបញ្ជីសិទ្ធិ');
    } finally {
      setLoading(false);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? permissions.filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(q)) : permissions;
  }, [permissions, query]);

  const openCreate = () => { setEditingPerm(null); setFormName(''); setFormDesc(''); setErrorMsg(''); setIsFormOpen(true); };
  const openEdit = (p) => { setEditingPerm(p); setFormName(p.name || ''); setFormDesc(p.description || ''); setErrorMsg(''); setIsFormOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { name: formName.trim(), description: formDesc.trim() };
      if (editingPerm) await updatePermission(editingPerm.id, payload);
      else await createPermission(payload);
      setIsFormOpen(false);
      fetchPermissions();
      onSuccessRole?.(); // Refresh roles list
    } catch (err) {
      const first = err?.errors ? Object.values(err.errors)[0] : null;
      setErrorMsg(first ? (Array.isArray(first) ? first[0] : first) : err?.message || 'មានបញ្ហាបរាជ័យ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPerm?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deletePermission(deletingPerm.id);
      setDeletingPerm(null);
      fetchPermissions();
      onSuccessRole?.();
    } catch (err) {
      setDeleteError(err?.message || 'បរាជ័យក្នុងការលុបសិទ្ធិ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}{roleCss}</style>
      <div className="pm" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Permissions">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Lock size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}><h3>គ្រប់គ្រងសិទ្ធិទាំងអស់</h3><p>បញ្ជីសិទ្ធិដែលមានក្នុងប្រព័ន្ធ · អាចបន្ថែម កែប្រែ លុប</p></div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="rp-tools">
            <div className="rp-search"><Search size={15} /><input className="pm-in" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ស្វែងរកសិទ្ធិ…" aria-label="Search permissions" /></div>
            <span className="pm-chip">{permissions.length} permissions</span>
            <button type="button" className="pm-btn primary sm" onClick={openCreate}><Plus size={14} /> បង្កើតសិទ្ធិថ្មី</button>
          </div>

          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          {isFormOpen && (
            <form className="rp-form" onSubmit={handleSave}>
              <h5>{editingPerm ? '✏️ កែប្រែសិទ្ធិ' : '➕ បន្ថែមសិទ្ធិថ្មី'}</h5>
              <div className="pm-grid">
                <div>
                  <div className="pm-lab"><span>ឈ្មោះសិទ្ធិ (Name)<em>*</em></span></div>
                  <input className="pm-in" type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="ឧ. create-product" autoFocus />
                </div>
                <div>
                  <div className="pm-lab"><span>បរិយាយ (Description)</span></div>
                  <input className="pm-in" type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="ការពណ៌នា..." />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button type="button" className="pm-btn sm" onClick={() => setIsFormOpen(false)}>បោះបង់</button>
                <button type="submit" className="pm-btn sm primary" disabled={submitting}>{submitting ? <Loader2 size={14} className="pm-spin" /> : <Save size={14} />} {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</button>
              </div>
            </form>
          )}

          <div className="rp-list">
            {loading ? <div className="rp-empty">កំពុងទាញយកទិន្នន័យ...</div>
              : visible.length === 0 ? <div className="rp-empty">{permissions.length === 0 ? 'មិនមានទិន្នន័យសិទ្ធិទេ' : 'រកមិនឃើញសិទ្ធិ'}</div>
              : visible.map((p, i) => (
                <div className="rp-prow" key={p.id ?? i} style={{ '--i': i }}>
                  <div style={{ minWidth: 0 }}><code>{p.name}</code></div>
                  <span title={p.description || ''}>{p.description || '-'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="rp-ib e" onClick={() => openEdit(p)} aria-label="Edit permission" title="កែប្រែ"><Pencil size={14} /></button>
                    <button type="button" className="rp-ib d" onClick={() => { setDeleteError(''); setDeletingPerm(p); }} aria-label="Delete permission" title="លុប"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="pm-foot"><button type="button" className="pm-btn" onClick={onClose}>បិទ</button></div>
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(deletingPerm)}
        title="បញ្ជាក់ការលុបសិទ្ធិ"
        message={<>តើអ្នកពិតជាចង់លុបសិទ្ធិ <b>“{deletingPerm?.name}”</b> នេះមែនទេ? តួនាទីដែលប្រើសិទ្ធិនេះនឹងបាត់សិទ្ធិនោះ។</>}
        busy={isDeleting}
        error={deleteError}
        onCancel={() => setDeletingPerm(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}