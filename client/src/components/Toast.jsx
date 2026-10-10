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
    success: 'bg-[#18181B] text-white border-lime-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)]',
    error: 'bg-[#18181B] text-white border-rose-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)]',
    info: 'bg-[#18181B] text-white border-zinc-700 shadow-[0_10px_30px_rgba(0,0,0,0.6)]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-lime-400/80 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div className={`flex items-center gap-3.5 p-4 rounded-xl border backdrop-blur-md ${typeStyles[type] || typeStyles.info}`}>
        {icons[type] || icons.info}
        <p className="text-sm font-medium text-zinc-200 pr-2">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
