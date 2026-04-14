import React, { useState } from 'react';
import { UserAPI } from '../api/apiService';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

function UserManagement({ users, onUpdate }) {
  const { addNotification } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null });

  const handleSave = async () => {
    if (!formData.name || !formData.email || (editingId === null && !formData.password)) {
      return addNotification('Please fill required fields', 'error');
    }

    setLoading(true);
    try {
      if (editingId) {
        await UserAPI.update(editingId, formData);
        addNotification('User updated successfully!');
      } else {
        await UserAPI.create(formData);
        addNotification('User created successfully!');
      }
      resetForm();
      onUpdate();
    } catch (err) {
      addNotification(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (user) => {
    setFormData({ name: user.name, email: user.email, password: '' });
    setEditingId(user.id);
    setShowForm(true);
    addNotification(`Editing ${user.name}`, 'info');
  };

  const confirmDelete = (id) => {
    setModalConfig({ isOpen: true, id });
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await UserAPI.delete(modalConfig.id);
      onUpdate();
      addNotification('User removed from system.', 'success');
      setModalConfig({ isOpen: false, id: null });
    } catch (err) {
      addNotification('Error deleting user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-premium h-full min-h-[500px] border-t-2 border-yellow-500/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-yellow-500 tracking-tighter uppercase leading-none">Users</h2>
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em]">Personnel Directory</span>
          </div>
        </div>
        <button
          onClick={editingId ? resetForm : () => setShowForm(!showForm)}
          className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition-all border border-yellow-500/30"
          title={showForm ? 'Cancel' : 'Register New User'}
        >
          {showForm ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-2xl border border-yellow-500/30 shadow-2xl animate-scale-in">
          <h3 className="text-yellow-500 font-bold uppercase text-[10px] mb-4 tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            {editingId ? 'Updating Resident' : 'New Registration'}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="input-premium w-full focus:border-yellow-500 bg-black/40"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Secure Email</label>
              <input
                type="email"
                placeholder="john@vault.com"
                className="input-premium w-full focus:border-yellow-500 bg-black/40"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {!editingId && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Access Key</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-premium w-full focus:border-yellow-500 bg-black/40"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary w-full mt-6 py-3 flex justify-center bg-yellow-600 hover:bg-yellow-500 shadow-xl shadow-yellow-900/10 font-black tracking-widest uppercase border-b-4 border-yellow-800"
          >
            {loading ? 'Processing...' : editingId ? 'Update Record' : 'Finalize Entry'}
          </button>
        </div>
      )}

      <div className="overflow-x-auto flex-grow custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="pb-4 px-4 text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Code</th>
              <th className="pb-4 text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Identity Details</th>
              <th className="pb-4 px-4 text-right text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Cmd</th>
            </tr>
          </thead>
          <tbody className="">
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-20 text-center">
                  <div className="text-gray-700 animate-pulse uppercase text-[10px] font-bold tracking-widest">Database Offline / Empty</div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.id} 
                  className={`group transition-all duration-300 ${
                    editingId === user.id 
                      ? 'bg-yellow-500/10 border-l-4 border-yellow-500 ring-1 ring-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                      : 'bg-black/20 hover:bg-yellow-500/[0.03] border-l-4 border-transparent'
                  } border shadow-inner rounded-xl`}
                >
                  <td className="py-4 px-4 rounded-l-xl">
                    <span className={`font-mono text-[10px] ${editingId === user.id ? 'text-yellow-400' : 'text-yellow-500/60'} bg-[#1a1a1a] px-2 py-1 rounded border border-white/5`}>
                      USR.{user.id.toString().padStart(3, '0')}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`font-bold text-sm tracking-tight leading-tight uppercase transition-colors ${editingId === user.id ? 'text-yellow-400' : 'text-gray-100 group-hover:text-yellow-500'}`}>
                      {user.name}
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold font-mono">{user.email}</div>
                  </td>
                  <td className="py-4 px-4 text-right rounded-r-xl">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        className={`p-2 rounded-lg transition-all ${
                          editingId === user.id ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10'
                        }`}
                        title="Edit Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(user.id)}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title="Terminal Warning"
        message="System termination requested. Delete this entry and all related node data permanently?"
        onConfirm={handleDelete}
        onCancel={() => setModalConfig({ isOpen: false, id: null })}
        isLoading={loading}
      />
    </section>
  );
}

export default UserManagement;
