import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, width = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-content w-full ${width} mx-4`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
