import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, SunIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  openAgent: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openAgent }) => {
  const isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;

  return (
    <nav className="bg-binance-dark text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <Link to="/">
          <img src="/binance-logo.svg" alt="Binance" className="h-7" />
        </Link>

        <div className="flex space-x-4 font-bold text-md">
          <Link to="/purchase" className="hover:text-binance-yellow">Buy Crypto</Link>
          <a href="#" className="hover:text-binance-yellow">Markets</a>
          <a href="#" className="hover:text-binance-yellow">Trade</a>
          <a href="#" className="hover:text-binance-yellow">Futures</a>
          <Link to="/launchpool" className="hover:text-binance-yellow">Launchpool</Link>
          <a href="#" className="hover:text-binance-yellow">Square</a>
          <div className="relative group">
            <button className="hover:text-binance-yellow">More</button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 font-bold text-sm">
        <button
          onClick={openAgent}
          className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm rounded border border-gray-700 hover:border-binance-yellow hover:text-binance-yellow mt-2"
        >
          <RocketLaunchIcon className="h-4 w-4" />
          <span>Agent</span>
          <span className="ml-1 text-xs text-gray-400">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </span>
        </button>
        <img src="/SS/nav.png" alt="Navigation" className="h-12" />
      </div>
    </nav>
  );
};

export default Navbar; 