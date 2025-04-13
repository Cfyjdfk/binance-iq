import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextSummary from "./TextSummary";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: string;
  change: string;
  icon: string;
}

const cryptoPrices: CryptoPrice[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$80,875.71",
    change: "-1.09%",
    icon: "/btc.svg",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$1,546.55",
    change: "-4.06%",
    icon: "/eth.svg",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: "$580.40",
    change: "+0.85%",
    icon: "/bnb.svg",
  },
  {
    symbol: "XRP",
    name: "XRP",
    price: "$2.00",
    change: "+0.34%",
    icon: "/xrp.svg",
  },
];

const newsItems = [
  {
    title: "New York Attorney General Advocates for Federal Crypto Regulations",
    link: "#",
  },
  {
    title: "Ethereum Spot ETF Sees Significant Outflow in the U.S.",
    link: "#",
  },
  {
    title: "Morpho Labs Resolves Front-End Update Issue, Ensures...",
    link: "#",
  },
];

const Hero: React.FC = () => {
  const [userCount, setUserCount] = useState(268873677);
  const previousCountRef = useRef(268873677);
  const animationFrameRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Function to animate the counter
  const animateCounter = (
    startValue: number,
    endValue: number,
    duration: number
  ) => {
    const animationStep = (timestamp: number) => {
      if (!animationStartTimeRef.current) {
        animationStartTimeRef.current = timestamp;
      }

      const elapsed = timestamp - animationStartTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easedProgress
      );
      setUserCount(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animationStep);
      } else {
        animationStartTimeRef.current = null;
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animationStep);
  };

  useEffect(() => {
    // Function to update the counter with a random increment
    const updateCounter = () => {
      const randomIncrement = Math.floor(Math.random() * 3) + 3; // Random number between 3-5
      const newCount = userCount + randomIncrement;

      // Animate from previous to new value
      animateCounter(previousCountRef.current, newCount, 1200); // 800ms animation
      previousCountRef.current = newCount;
    };

    // Set up the interval with random timing between 5-10 seconds
    const randomDelay = Math.floor(Math.random() * 2000) + 2000; // 5000-10000ms
    const intervalId = setInterval(updateCounter, randomDelay);

    return () => {
      clearInterval(intervalId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [userCount]);

  // Function to format the number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-binance-dark min-h-screen text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-6">
        {/* Left column */}
        <div className="lg:col-span-6 pt-16 lg:pt-40">
          <div className="max-w-lg">
            <h1 className="text-5xl md:text-7xl font-bold mb-2 text-[#FCD535]">
              {formatNumber(userCount)}
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-12">
              USERS TRUST US
            </h2>

            <div className="mt-16 mb-16">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Email/Phone number"
                  className="w-full px-4 py-3 bg-binance-gray rounded text-white focus:outline-none focus:ring-2 focus:ring-binance-yellow"
                />
                <button className="absolute right-0 top-0 h-full px-6 bg-binance-yellow text-black rounded-r hover:bg-yellow-400 font-medium">
                  Sign Up
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-12">
              <p className="text-gray-400">Or Continue With</p>
              <div className="flex space-x-4">
                <button className="p-2 bg-binance-gray rounded-full hover:bg-gray-700">
                  <img src="/google.svg" alt="Google" className="h-6 w-6" />
                </button>
                <button className="p-2 bg-binance-gray rounded-full hover:bg-gray-700">
                  <img src="/apple.svg" alt="Apple" className="h-6 w-6" />
                </button>
                <button className="p-2 bg-binance-gray rounded-full hover:bg-gray-700">
                  <img src="/qr.svg" alt="QR Code" className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-6 pt-8 lg:pt-24">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <button className="text-white font-semibold border-b-2 border-binance-yellow pb-1">Popular</button>
              <button className="text-gray-400 hover:text-white pb-1 border-b-2 border-transparent hover:border-gray-400">
                New Listing
              </button>
            </div>
            <button className="text-gray-400 hover:text-binance-yellow flex items-center">
              View All 350+ Coins <span className="ml-1">→</span>
            </button>
          </div>

          {/* Crypto Prices Container */}
          <div className="bg-[#1E2026] rounded-lg p-4 mb-4">
            <div className="space-y-3">
              {cryptoPrices.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-3 bg-binance-gray rounded hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={crypto.icon}
                      alt={crypto.name}
                      className="h-8 w-8"
                    />
                    <div>
                      <span className="font-medium">{crypto.symbol}</span>
                      <span className="text-gray-400 ml-2">{crypto.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{crypto.price}</div>
                    <div
                      className={
                        crypto.change.startsWith("-")
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {crypto.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Container */}
          <div className="bg-[#1E2026] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">News</h3>
              <button className="text-gray-400 hover:text-binance-yellow flex items-center">
                View All News <span className="ml-1">→</span>
              </button>
            </div>
            <div className="space-y-3">
              {newsItems.map((news, index) => (
                <a
                  key={index}
                  href={news.link}
                  className="block text-gray-300 hover:text-white truncate py-1"
                >
                  {news.title}
                </a>
              ))}
            </div>
          </div>

          {/* Launchpool Container */}
          <div className="bg-[#1E2026] rounded-lg p-4">
            <TextSummary>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Launchpool</h3>
                  <img src="/wct.svg" alt="WCT" className="h-5 w-5" />
                  <span className="text-sm font-medium">WCT</span>
                  <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded">
                    Ongoing
                  </span>
                </div>
                <button className="text-gray-400 hover:text-binance-yellow">
                  →
                </button>
              </div>
              <div className="flex space-x-6 mt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">03</div>
                  <div className="text-xs text-gray-400">D</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">19</div>
                  <div className="text-xs text-gray-400">H</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">48</div>
                  <div className="text-xs text-gray-400">M</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">32</div>
                  <div className="text-xs text-gray-400">S</div>
                </div>
              </div>
            </TextSummary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
