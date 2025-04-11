import React from 'react';
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    MusicalNoteIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    BookOpenIcon,
    VideoCameraIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const Resources: React.FC = () => {
    return (
        <div className="bg-binance-dark text-white py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                {/* Community Section */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-6">Community</h3>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <a href="#" className="text-gray-400 hover:text-white"><ChatBubbleLeftRightIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><PaperAirplaneIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><MusicalNoteIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><UserGroupIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><GlobeAltIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><ArrowPathIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><BookOpenIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><VideoCameraIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><ChatBubbleLeftRightIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><PaperAirplaneIcon className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><EllipsisHorizontalIcon className="h-6 w-6" /></a>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">English</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">USD-$</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">Theme</span>
                        </div>
                    </div>
                </div>

                {/* About Us Section */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-6">About Us</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Announcements</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">News</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Press</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Legal</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Building Trust</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Risk Warning</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Notices</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Downloads</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Desktop Application</a></li>
                    </ul>
                </div>

                {/* Products Section */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-6">Products</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-gray-400 hover:text-white">Exchange</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy Crypto</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Pay</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Academy</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Live</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Tax</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Gift Card</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Launchpool</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Auto-Invest</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">ETH Staking</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">NFT</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">BABT</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Research</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Charity</a></li>
                    </ul>
                </div>

                {/* Business Section */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-6">Business</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-gray-400 hover:text-white">P2P Merchant Application</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">P2Pro Merchant Application</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Listing Application</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Institutional & VIP Services</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Labs</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Binance Connect</a></li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-8 mb-6">Learn</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-gray-400 hover:text-white">Learn & Earn</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Browse Crypto Prices</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Bitcoin Price</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Ethereum Price</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Browse Crypto Price Predictions</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Bitcoin Price Prediction</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Ethereum Price Prediction</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Ethereum Upgrade (Pectra)</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy Bitcoin</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy BNB</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy XRP</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy Dogecoin</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy Ethereum</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Buy Tradable Altcoins</a></li>
                    </ul>
                </div>

                {/* Service Section */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-6">Service</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-gray-400 hover:text-white">Affiliate</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Referral</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">BNB</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">OTC Trading</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Historical Market Data</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Trading Insight</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Proof of Reserves</a></li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-8 mb-6">Support</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-gray-400 hover:text-white">24/7 Chat Support</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Support Center</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Product Feedback & Suggestions</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Fees</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">APIs</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Binance Verify</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Trading Rules</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Binance Airdrop Portal</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Law Enforcement Requests</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Resources;