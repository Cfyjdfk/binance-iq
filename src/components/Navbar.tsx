import React from 'react';
import { MagnifyingGlassIcon, SunIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  openAgent: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openAgent }) => {
    const isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    
    return (
        <nav className="bg-binance-dark text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8">
                <img src="/binance-logo.svg" alt="Binance" className="h-8" />

                <div className="flex space-x-6">
                    <a href="#" className="hover:text-binance-yellow">Buy Crypto</a>
                    <a href="#" className="hover:text-binance-yellow">Markets</a>
                    <a href="#" className="hover:text-binance-yellow">Trade</a>
                    <a href="#" className="hover:text-binance-yellow">Futures</a>
                    <a href="#" className="hover:text-binance-yellow">Earn</a>
                    <a href="#" className="hover:text-binance-yellow">Square</a>
                    <div className="relative group">
                        <button className="hover:text-binance-yellow">More</button>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button 
                  onClick={openAgent}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded border border-gray-700 hover:border-binance-yellow hover:text-binance-yellow"
                >
                  <RocketLaunchIcon className="h-4 w-4" />
                  <span>Agent</span>
                  <span className="ml-1 text-xs text-gray-400">
                    {isMac ? '⌘K' : 'Ctrl+K'}
                  </span>
                </button>
                
                <button>
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
                <button>
                    <SunIcon className="h-5 w-5" />
                </button>
                <button className="px-4 py-1 text-sm hover:bg-gray-700 rounded">Log In</button>
                <button className="px-4 py-1 text-sm bg-binance-yellow text-black rounded hover:bg-yellow-400">
                    Sign Up
                </button>
            </div>
        </nav>
    );
};

export default Navbar; 