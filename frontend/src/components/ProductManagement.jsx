import React, { useState } from 'react';
import { ProductAPI } from '../api/apiService';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

function ProductManagement({ products, onUpdate }) {
  const { addNotification } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
  const [loading, setLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null });

  const handleSave = async () => {
    if (!formData.name || isNaN(parseFloat(formData.price))) {
      return addNotification('Missing name or valid price', 'error');
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      };

      if (editingId) {
        await ProductAPI.update(editingId, payload);
        addNotification('Inventory updated successfully!');
      } else {
        await ProductAPI.create(payload);
        addNotification('Product registered successfully!');
      }
      resetForm();
      onUpdate();
    } catch (err) {
      addNotification(`System Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setEditingId(product.id);
    setShowForm(true);
    addNotification(`Modifying ${product.name}`, 'info');
  };

  const confirmDelete = (id) => {
    setModalConfig({ isOpen: true, id });
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await ProductAPI.delete(modalConfig.id);
      onUpdate();
      addNotification('Item removed from inventory.', 'success');
      setModalConfig({ isOpen: false, id: null });
    } catch (err) {
      addNotification('Access Denied: Could not remove item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-premium h-full border-t-2 border-orange-600/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-orange-600 tracking-tighter uppercase leading-none">Catalog</h2>
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em]">Inventory Management</span>
          </div>
        </div>
        <button
          onClick={editingId ? resetForm : () => setShowForm(!showForm)}
          className="p-2 bg-orange-600/10 hover:bg-orange-600/20 text-orange-600 rounded-lg transition-all border border-orange-600/30"
          title={showForm ? 'Cancel' : 'Register New Asset'}
        >
          {showForm ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl border border-orange-600/30 shadow-2xl animate-scale-in">
          <h3 className="text-orange-600 font-bold uppercase text-[10px] mb-4 tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
            {editingId ? 'Edit Mode: Active Asset' : 'System: Deploy New Asset'}
          </h3>
          <input
            type="text"
            placeholder="Asset Nomenclature"
            className="input-premium w-full mb-3 focus:border-orange-600 bg-black/40"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <textarea
            placeholder="Operational Description"
            className="input-premium w-full mb-3 focus:border-orange-600 min-h-[80px] bg-black/40"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="text-[10px] uppercase font-bold text-gray-600 mb-1 block">Value (USD)</label>
              <input
                type="number"
                placeholder="0.00"
                className="input-premium w-full focus:border-orange-600 bg-black/40"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="w-1/2">
              <label className="text-[10px] uppercase font-bold text-gray-600 mb-1 block">Volume</label>
              <input
                type="number"
                placeholder="0"
                className="input-premium w-full focus:border-orange-600 bg-black/40"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary w-full py-3 flex justify-center bg-orange-700 hover:bg-orange-600 shadow-xl shadow-orange-900/10 font-black tracking-widest uppercase border-b-4 border-orange-800"
          >
            {loading ? 'Transmitting...' : editingId ? 'Commit Changes' : 'Execute Registration'}
          </button>
        </div>
      )}

      <div className="overflow-x-auto flex-grow custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="pb-4 px-4 text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Serial</th>
              <th className="pb-4 text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Asset Class</th>
              <th className="pb-4 px-4 text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Metrics</th>
              <th className="pb-4 px-4 text-right text-gray-600 font-black uppercase text-[9px] tracking-[0.3em]">Cmd</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <div className="text-gray-700 animate-pulse uppercase text-[10px] font-bold tracking-widest">Inventory Null / No Records</div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr 
                  key={product.id} 
                  className={`group transition-all duration-300 ${
                    editingId === product.id 
                      ? 'bg-orange-600/10 border-l-4 border-orange-600 ring-1 ring-orange-600/30 shadow-[0_0_15px_rgba(234,88,12,0.1)]' 
                      : 'bg-black/20 hover:bg-orange-600/[0.03] border-l-4 border-transparent'
                  } border shadow-inner rounded-xl`}
                >
                  <td className="py-4 px-4 rounded-l-xl">
                    <span className={`font-mono text-[10px] ${editingId === product.id ? 'text-orange-400' : 'text-orange-600/60'} bg-[#1a1a1a] px-2 py-1 rounded border border-white/5`}>
                      SKU.{product.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className={`font-bold text-sm tracking-tight leading-tight uppercase transition-colors ${editingId === product.id ? 'text-orange-400' : 'text-gray-100 group-hover:text-orange-600'}`}>
                      {product.name}
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold truncate max-w-[150px]">{product.description || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={`font-black text-sm tracking-tighter ${editingId === product.id ? 'text-orange-400' : 'text-white'}`}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className={`text-[9px] font-black uppercase mt-0.5 ${product.stock > 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                        {product.stock > 0 ? `VOL: ${product.stock}` : 'DEPLETED'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right rounded-r-xl">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className={`p-2 rounded-lg transition-all ${
                          editingId === product.id ? 'bg-orange-600 text-black shadow-lg shadow-orange-600/20' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-600/10'
                        }`}
                        title="Edit Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(product.id)}
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
        title="Asset Purge Warning"
        message="This operation will permanently erase this operational asset from the core database. Proceed?"
        onConfirm={handleDelete}
        onCancel={() => setModalConfig({ isOpen: false, id: null })}
        isLoading={loading}
      />
    </section>
  );
}

export default ProductManagement;
