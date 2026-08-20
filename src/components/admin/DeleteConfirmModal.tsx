import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: string;
  warningMessage?: string;
  associatedCounts?: { label: string; count: number }[];
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  warningMessage,
  associatedCounts,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg leading-tight">
                {title || `Delete ${itemType}`}
              </h3>
              <p className="text-xs text-rose-600 font-medium mt-0.5">
                Destructive action
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 font-semibold font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">
              {itemName}
            </strong>
            ? This action cannot be undone.
          </p>

          {associatedCounts && associatedCounts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1.5 text-xs text-amber-900">
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <span>⚠️ This {itemType.toLowerCase()} currently contains:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-amber-800 font-medium">
                {associatedCounts.map((c, i) => (
                  <li key={i}>
                    <strong>{c.count}</strong> {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warningMessage && (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {warningMessage}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            {isDeleting ? 'Deleting...' : `Delete ${itemType}`}
          </button>
        </div>
      </div>
    </div>
  );
};
