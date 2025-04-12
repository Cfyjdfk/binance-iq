import React, { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  subtitle?: string; // Optional subtitle for more details
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, subtitle }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-[#1A1E27] rounded-lg shadow-lg p-4 max-w-md animate-fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <p className="text-white font-medium">{message}</p>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white ml-3 flex-shrink-0"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {subtitle && (
            <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast; 