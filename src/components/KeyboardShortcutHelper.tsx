import React, { useState, useEffect } from 'react';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

interface KeyboardShortcutHelperProps {
  openAgent: () => void;
}

const KeyboardShortcutHelper: React.FC<KeyboardShortcutHelperProps> = ({ openAgent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
  const location = useLocation();
  
  useEffect(() => {
    // Always show the helper on homepage immediately
    // Only show on homepage
    if (location.pathname === '/') {
      setIsVisible(true);
    }
    
    return () => {};
  }, [location.pathname]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-40 bg-binance-dark border border-binance-yellow rounded-lg shadow-lg p-4 animate-fade-in">
      <div className="flex items-center space-x-4">
        <RocketLaunchIcon className="h-6 w-6 text-binance-yellow" />
        <div>
          <h3 className="text-white font-medium text-sm">Try the new Agent feature!</h3>
          <p className="text-gray-400 text-xs mt-1">
            Press <span className="text-binance-yellow font-mono">{isMac ? '⌘K' : 'Ctrl+K'}</span> anytime to get help or execute trades.
          </p>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            openAgent();
          }}
          className="px-3 py-1 bg-binance-yellow text-black text-xs rounded-full hover:bg-yellow-400"
        >
          Try it
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          <span className="text-xs">✕</span>
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcutHelper; 