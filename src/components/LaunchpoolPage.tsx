import React, { useState, useEffect } from 'react';

interface PoolData {
    icon: string;
    tokenIcon: string;
    name: string;
    description: string;
    participants: string;
    totalLocked: string;
}

const pools: PoolData[] = [
    {
        icon: '/usdc.svg',
        tokenIcon: '/wct.svg',
        name: 'USDC Pool',
        description: 'Lock USDC, Get WCT Airdrop',
        participants: '45,645',
        totalLocked: '2B+ USDC'
    },
    {
        icon: '/fdusd.svg',
        tokenIcon: '/wct.svg',
        name: 'FDUSD Pool',
        description: 'Lock FDUSD, Get WCT Airdrop',
        participants: '24,351',
        totalLocked: '670M+ FDUSD'
    },
    {
        icon: '/bnb.svg',
        tokenIcon: '/wct.svg',
        name: 'BNB Pool',
        description: 'Lock BNB, Get WCT Airdrop',
        participants: '1,600,955',
        totalLocked: '18M+ BNB'
    }
];

const LaunchpoolPage: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 3,
        hours: 16,
        minutes: 6,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0E11] text-white">
            {/* Header Section */}
            <div className="pt-16 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-bold mb-4">Binance's Token Launch Platform</h1>
                    <p className="text-gray-400 text-lg mb-12">Lock tokens and get airdrops on Binance.</p>

                    <div className="grid grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold text-white">$ 15,486,466,586</div>
                            <div className="text-gray-400 mt-1">Currently Locked</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">$ 183,123,450</div>
                            <div className="text-gray-400 mt-1">Funds Raised</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">105</div>
                            <div className="text-gray-400 mt-1">Projects Launched</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">6,261,408</div>
                            <div className="text-gray-400 mt-1">All-time Unique Participants</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex space-x-8">
                        <button className="py-4 text-white border-b-2 border-[#FCD535] font-medium">
                            Launchpool
                        </button>
                        <button className="py-4 text-[#848E9C] hover:text-white">
                            HODLer Airdrops
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-4 gap-6">
                    {/* WCT Section */}
                    <div className="bg-[#1E2026] rounded-2xl p-6">
                        <div className="mb-4">
                            <span className="text-xs bg-[#02C076] text-white px-2 py-1 rounded">
                                ONGOING
                            </span>
                        </div>

                        <div className="flex items-center space-x-3 mb-4">
                            <img src="/wct.svg" alt="WCT" className="h-8 w-8" />
                            <span className="text-xl font-semibold">WCT</span>
                        </div>

                        <p className="text-[#848E9C] mb-8">
                            Walletconnect is an open-source network that connects users to decentralized apps through a secure and interoperable...
                        </p>

                        <div className="space-y-3 mb-8">
                            <div>
                                <div className="text-[#848E9C] text-sm mb-2">Total Airdrop</div>
                                <div className="text-xl">40,000,000.00</div>
                            </div>
                            <div>
                                <div className="text-[#848E9C] text-sm mb-2">Project Duration</div>
                                <div className="text-xl">4 day/s</div>
                            </div>
                        </div>

                        <div>
                            <div className="text-[#848E9C] text-sm mb-2">Ends in</div>
                            <div className="flex space-x-4">
                                <div>
                                    <div className="text-2xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</div>
                                    <div className="text-sm text-[#848E9C]">Days</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                                    <div className="text-sm text-[#848E9C]">Hours</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                                    <div className="text-sm text-[#848E9C]">Mins</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pools */}
                    {pools.map((pool, index) => (
                        <div key={index} className="bg-[#1E2026] rounded-2xl p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="relative">
                                    <img src={pool.icon} alt={pool.name} className="h-8 w-8" />
                                    <img
                                        src={pool.tokenIcon}
                                        alt="WCT"
                                        className="w-4 h-4 absolute -bottom-1 -right-1"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{pool.name}</h3>
                                    <p className="text-[#848E9C] text-sm">{pool.description}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-[#848E9C]">Participants:</span>
                                    <span className="text-white">{pool.participants}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#848E9C]">Total Locked</span>
                                    <span className="text-white">{pool.totalLocked}</span>
                                </div>
                            </div>

                            <button className="w-full bg-[#FCD535] text-black py-3 rounded-lg font-medium hover:bg-[#FCD535]/90 transition-colors">
                                Lock
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LaunchpoolPage; 