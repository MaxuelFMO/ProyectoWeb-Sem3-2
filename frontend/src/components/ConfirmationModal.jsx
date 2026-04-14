import React from 'react';

function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card-premium w-full max-w-md animate-scale-in">
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{title}</h3>
        <p className="text-[var(--text-muted)] mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
