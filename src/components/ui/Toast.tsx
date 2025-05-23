import React from 'react';
import { LuX } from 'react-icons/lu';

interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const typeStyles = {
  success: 'bg-green-500/50 border-green-600',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  type = 'info',
  onClose,
}) => {
  if (!open) return null;
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] flex h-12 -translate-x-1/2 transform items-center justify-center rounded-md px-6 shadow-lg backdrop-blur-sm ${typeStyles[type]} border border-solid`}
      role="alert"
      onClick={onClose}
    >
      <span>{message}</span>
      <button
        className="ease-250 ml-2 -mr-2 rounded border border-solid border-black/20 p-1 text-black/40 hover:border-black/40 hover:text-black/80 active:scale-110"
        onClick={onClose}
      >
        <LuX />
      </button>
    </div>
  );
};

export default Toast;
