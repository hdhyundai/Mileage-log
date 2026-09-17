import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ModalState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface NotificationModalProps {
  modal: ModalState;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ modal, onClose }) => {
  if (!modal.isOpen) return null;

  const isSuccess = modal.type === 'success';
  const isError = modal.type === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200 text-center relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-3">
          {isSuccess && (
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
          {isError && (
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
          )}
          {!isSuccess && !isError && (
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              <Info className="w-8 h-8" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{modal.title}</h3>
        <p className="text-sm text-slate-600 mb-6 whitespace-pre-line leading-relaxed">
          {modal.message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-95 ${
            isSuccess
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              : isError
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/30'
          }`}
        >
          확인
        </button>
      </div>
    </div>
  );
};
