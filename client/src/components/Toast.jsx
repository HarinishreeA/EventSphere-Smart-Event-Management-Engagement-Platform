import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const { type, message } = toast;

  const typeStyles = {
    success: 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40',
    error: 'bg-rose-950/90 text-rose-200 border-rose-500/40',
    info: 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-md">
      <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${typeStyles[type] || typeStyles.info}`}>
        {icons[type] || icons.info}
        <p className="text-sm font-medium pr-2">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
