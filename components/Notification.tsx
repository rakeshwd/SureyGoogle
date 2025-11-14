import React from 'react';
import { CheckCircleIcon } from './icons';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div 
      className="fixed top-20 right-5 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 flex items-center border border-slate-200 dark:border-slate-600 animate-slide-in w-full max-w-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0">
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button 
          onClick={onClose} 
          className="bg-white dark:bg-slate-800 rounded-md inline-flex text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;
