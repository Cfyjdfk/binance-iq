import React, { useState, useEffect, useRef } from "react";
import { useIQContext } from "../AIContext";

interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

// Define the interface for trading pairs
interface TradingPair {
  pair: string;
  price: string;
  change: string;
  leverage?: string;
}

interface PurchasePageProps {
  showToast?: (
    message: string,
    type: "success" | "error" | "info",
    subtitle?: string
  ) => void;
}

const PurchasePage: React.FC<PurchasePageProps> = ({ showToast }) => {
  // Get state from context
  const { 
    purchaseState, 
    setPurchaseState, 
    highlightBuyButton, 
    setHighlightBuyButton,
    highlightTotalInput,
    setHighlightTotalInput,
    highlightPriceInput,
    setHighlightPriceInput,
    highlightAmountInput,
    setHighlightAmountInput,
    highlightOrderTypes,
    setHighlightOrderTypes
  } = useIQContext();
  
  // Create local state that syncs with context
  const [buyPrice, setBuyPrice] = useState<string>(purchaseState.buyPrice);
  const [sellPrice, setSellPrice] = useState<string>(purchaseState.sellPrice);
  const [buyAmount, setBuyAmount] = useState<string>(purchaseState.buyAmount);
  const [sellAmount, setSellAmount] = useState<string>(purchaseState.sellAmount);
  const [buyTotal, setBuyTotal] = useState<string>(purchaseState.buyTotal);
  const [sellTotal, setSellTotal] = useState<string>(purchaseState.sellTotal);
  const [buySliderValue, setBuySliderValue] = useState<number>(purchaseState.buySliderValue);
  const [sellSliderValue, setSellSliderValue] = useState<number>(purchaseState.sellSliderValue);
  const [orderType, setOrderType] = useState<"limit" | "market" | "stop-limit" | null>(
    purchaseState.orderType
  );
  const [tpSl, setTpSl] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "spot" | "cross" | "isolated" | "grid"
  >("spot");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Add a flag to track if updates are from local or context changes
  const isUpdatingFromContext = useRef(false);
  const isCalculatingTotal = useRef(false);

  // Handle Buy BTC button click
  const handleBuyButtonClick = () => {
    // Show toast notification
    if (showToast) {
      showToast(
        "Limit Buy Order Filled",
        "success",
        `Successfully purchased ${buyAmount} BTC for ${buyTotal} USDT`
      );
    }
    
    // Turn off order type highlighting when completed
    setHighlightOrderTypes(false);
    
    // Reset all highlights
    setHighlightBuyButton(false);
    setHighlightTotalInput(false);
    setHighlightPriceInput(false);
    setHighlightAmountInput(false);
  };

  // Sync local state with context when context changes
  useEffect(() => {
    // Set the flag to indicate we're updating from context
    isUpdatingFromContext.current = true;
    
    // Update local state with context values
    setBuyPrice(purchaseState.buyPrice);
    setSellPrice(purchaseState.sellPrice);
    setBuyAmount(purchaseState.buyAmount);
    setSellAmount(purchaseState.sellAmount);
    setBuyTotal(purchaseState.buyTotal);
    setSellTotal(purchaseState.sellTotal);
    setBuySliderValue(purchaseState.buySliderValue);
    setSellSliderValue(purchaseState.sellSliderValue);
    setOrderType(purchaseState.orderType);
    
    // Reset the flag after a short delay to ensure all state updates have processed
    const timeoutId = setTimeout(() => {
      isUpdatingFromContext.current = false;
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [purchaseState]);

  // Sync context with local state when local state changes
  useEffect(() => {
    // Only update context if changes originated from local state (not from context sync)
    if (!isUpdatingFromContext.current && !isCalculatingTotal.current) {
      setPurchaseState(prev => ({
        ...prev,
        buyPrice,
        sellPrice,
        buyAmount,
        sellAmount,
        buyTotal,
        sellTotal,
        buySliderValue,
        sellSliderValue,
        orderType
      }));
    }
  }, [
    buyPrice, sellPrice, 
    buyAmount, sellAmount, 
    buyTotal, sellTotal, 
    buySliderValue, sellSliderValue, 
    orderType, 
    setPurchaseState
  ]);

  // Update buyTotal when buyPrice or buyAmount changes
  useEffect(() => {
    if (!isUpdatingFromContext.current && parseFloat(buyAmount) > 0 && parseFloat(buyPrice) > 0 && buyPrice !== "Market") {
      isCalculatingTotal.current = true;
      const calculatedTotal = (parseFloat(buyAmount) * parseFloat(buyPrice)).toFixed(2);
      setBuyTotal(calculatedTotal);
      
      // Reset calculation flag after state update
      setTimeout(() => {
        isCalculatingTotal.current = false;
      }, 0);
    }
  }, [buyPrice, buyAmount]);

  // Update sellTotal when sellPrice or sellAmount changes
  useEffect(() => {
    if (!isUpdatingFromContext.current && parseFloat(sellAmount) > 0 && parseFloat(sellPrice) > 0 && sellPrice !== "Market") {
      isCalculatingTotal.current = true;
      const calculatedTotal = (parseFloat(sellAmount) * parseFloat(sellPrice)).toFixed(2);
      setSellTotal(calculatedTotal);
      
      // Reset calculation flag after state update
      setTimeout(() => {
        isCalculatingTotal.current = false;
      }, 0);
    }
  }, [sellPrice, sellAmount]);

  // Update buyAmount when buyTotal or buyPrice changes
  const updateBuyAmountFromTotal = () => {
    if (parseFloat(buyTotal) > 0 && parseFloat(buyPrice) > 0 && buyPrice !== "Market") {
      isCalculatingTotal.current = true;
      const calculatedAmount = (parseFloat(buyTotal) / parseFloat(buyPrice)).toFixed(6);
      setBuyAmount(calculatedAmount);
      
      // Update slider position based on amount
      const maxAmount = 0.01;
      const amountValue = parseFloat(calculatedAmount);
      const newSliderValue = Math.min(Math.round((amountValue / maxAmount) * 100), 100);
      setBuySliderValue(newSliderValue);
      
      // Reset calculation flag after state update
      setTimeout(() => {
        isCalculatingTotal.current = false;
      }, 0);
    }
  };

  // Update sellAmount when sellTotal or sellPrice changes
  const updateSellAmountFromTotal = () => {
    if (parseFloat(sellTotal) > 0 && parseFloat(sellPrice) > 0 && sellPrice !== "Market") {
      isCalculatingTotal.current = true;
      const calculatedAmount = (parseFloat(sellTotal) / parseFloat(sellPrice)).toFixed(6);
      setSellAmount(calculatedAmount);
      
      // Update slider position based on amount
      const maxAmount = 0.01;
      const amountValue = parseFloat(calculatedAmount);
      const newSliderValue = Math.min(Math.round((amountValue / maxAmount) * 100), 100);
      setSellSliderValue(newSliderValue);
      
      // Reset calculation flag after state update
      setTimeout(() => {
        isCalculatingTotal.current = false;
      }, 0);
    }
  };

  // Handle buy price input change
  const handleBuyPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBuyPrice(value);
      
      // Turn off highlight when user interacts with the field
      if (highlightPriceInput) {
        setHighlightPriceInput(false);
      }
    }
  };

  // Handle sell price input change
  const handleSellPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSellPrice(value);
    }
  };

  // Handle buy amount input change
  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBuyAmount(value);
      
      // Update slider position based on amount
      if (value && parseFloat(value) > 0) {
        const maxAmount = 0.01;
        const amountValue = parseFloat(value);
        const newSliderValue = Math.min(Math.round((amountValue / maxAmount) * 100), 100);
        setBuySliderValue(newSliderValue);
      } else {
        setBuySliderValue(0);
      }
      
      // Turn off highlight when user interacts with the field
      if (highlightAmountInput) {
        setHighlightAmountInput(false);
      }
    }
  };

  // Handle sell amount input change
  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSellAmount(value);
      
      // Update slider position based on amount
      if (value && parseFloat(value) > 0) {
        const maxAmount = 0.01;
        const amountValue = parseFloat(value);
        const newSliderValue = Math.min(Math.round((amountValue / maxAmount) * 100), 100);
        setSellSliderValue(newSliderValue);
      } else {
        setSellSliderValue(0);
      }
    }
  };

  // Handle buy total input change
  const handleBuyTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBuyTotal(value);
      if (value && parseFloat(value) > 0) {
        updateBuyAmountFromTotal();
      } else {
        // If total is cleared or zero, reset amount and slider too
        setBuyAmount("0.00000");
        setBuySliderValue(0);
      }
      
      // Turn off highlight once user interacts with the field
      if (highlightTotalInput) {
        setHighlightTotalInput(false);
      }
    }
  };

  // Handle sell total input change
  const handleSellTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSellTotal(value);
      if (value && parseFloat(value) > 0) {
        updateSellAmountFromTotal();
      } else {
        // If total is cleared or zero, reset amount and slider too
        setSellAmount("0.00000");
        setSellSliderValue(0);
      }
    }
  };

  // Handle buy slider change
  const handleBuySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBuySliderValue(value);

    // Assuming the maximum amount is 0.01 BTC
    const maxAmount = 0.01;
    const newAmount = (maxAmount * (value / 100)).toFixed(6);
    isCalculatingTotal.current = true;
    
    // Update the amount in the buy side
    setBuyAmount(newAmount);
    
    // Also update the total based on the new amount
    if (parseFloat(newAmount) > 0 && parseFloat(buyPrice) > 0 && buyPrice !== "Market") {
      const calculatedTotal = (parseFloat(newAmount) * parseFloat(buyPrice)).toFixed(2);
      setBuyTotal(calculatedTotal);
    } else {
      setBuyTotal("0");
    }
    
    // Reset calculation flag after state update
    setTimeout(() => {
      isCalculatingTotal.current = false;
    }, 0);
  };

  // Handle sell slider change
  const handleSellSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSellSliderValue(value);

    // Assuming the maximum amount is 0.01 BTC
    const maxAmount = 0.01;
    const newAmount = (maxAmount * (value / 100)).toFixed(6);
    isCalculatingTotal.current = true;
    
    // Update the amount in the sell side
    setSellAmount(newAmount);
    
    // Also update the total based on the new amount
    if (parseFloat(newAmount) > 0 && parseFloat(sellPrice) > 0 && sellPrice !== "Market") {
      const calculatedTotal = (parseFloat(newAmount) * parseFloat(sellPrice)).toFixed(2);
      setSellTotal(calculatedTotal);
    } else {
      setSellTotal("0");
    }
    
    // Reset calculation flag after state update
    setTimeout(() => {
      isCalculatingTotal.current = false;
    }, 0);
  };

  // Generate more asks and bids for a longer list
  const generateMoreEntries = (
    base: OrderBookEntry[],
    count: number
  ): OrderBookEntry[] => {
    const result = [...base];
    for (let i = 0; i < count; i++) {
      const basePrice = parseFloat(base[i % base.length].price);
      const variance = (Math.random() * 10 - 5) / 10;
      const newPrice = (basePrice + variance).toFixed(2);
      const newAmount = (Math.random() * 0.1).toFixed(6);
      const newTotal = (Math.random() * 100).toFixed(2) + "K";
      result.push({ price: newPrice, amount: newAmount, total: newTotal });
    }
    return result;
  };

  // Mock data for order book (bids and asks)
  const baseAsks: OrderBookEntry[] = [
    { price: "81920.00", amount: "0.00642", total: "5.12K" },
    { price: "81918.52", amount: "0.02454", total: "2.01K" },
    { price: "81918.00", amount: "0.00247", total: "5.12K" },
    { price: "81917.83", amount: "0.04007", total: "3.28K" },
    { price: "81917.24", amount: "0.09577", total: "7.85K" },
    { price: "81916.17", amount: "0.34299", total: "29.73K" },
    { price: "81916.16", amount: "0.15683", total: "12.83K" },
    { price: "81916.15", amount: "0.00221", total: "17.202K" },
    { price: "81916.00", amount: "0.06254", total: "5.12K" },
    { price: "81915.99", amount: "0.00221", total: "17.202K" },
  ];

  const baseBids: OrderBookEntry[] = [
    { price: "81915.33", amount: "4.44999", total: "380.71K" },
    { price: "81915.32", amount: "1.19519", total: "97.90K" },
    { price: "81915.31", amount: "0.00079", total: "64.71K" },
    { price: "81914.87", amount: "0.00037", total: "30.30K" },
    { price: "81914.01", amount: "0.00221", total: "17.201K" },
    { price: "81914.00", amount: "0.00221", total: "5.12K" },
    { price: "81850.01", amount: "0.00041", total: "33.55K" },
    { price: "81850.00", amount: "0.00247", total: "5.11K" },
    { price: "81849.79", amount: "0.00221", total: "17.18K" },
    { price: "81849.78", amount: "0.23776", total: "19.44K" },
    { price: "81849.78", amount: "0.23776", total: "19.44K" },
    { price: "81849.78", amount: "0.23776", total: "19.44K" },
    { price: "81849.78", amount: "0.23776", total: "19.44K" },
    { price: "81849.78", amount: "0.23776", total: "19.44K" },
    { price: "81849.78", amount: "0.23776", total: "19.44K" },
  ];

  // Generate longer lists
  const asks = generateMoreEntries(baseAsks, 10);
  const bids = generateMoreEntries(baseBids, 10);

  // Trading history data
  const baseTrades = [
    { price: "81918.57", amount: "0.00139", time: "23:04:44" },
    { price: "81916.51", amount: "0.00030", time: "23:04:44" },
    { price: "81917.26", amount: "0.00007", time: "23:04:44" },
    { price: "81917.25", amount: "0.00037", time: "23:04:44" },
    { price: "81917.47", amount: "0.00007", time: "23:04:44" },
    { price: "81917.89", amount: "0.00007", time: "23:04:44" },
    { price: "81918.00", amount: "0.00007", time: "23:04:44" },
    { price: "81834.25", amount: "0.00021", time: "23:05:23" },
    { price: "81834.74", amount: "0.00021", time: "23:05:23" },
  ];

  // Generate more trades
  const trades = [...baseTrades];
  for (let i = 0; i < 20; i++) {
    const basePrice = parseFloat(baseTrades[i % baseTrades.length].price);
    const variance = (Math.random() * 10 - 5) / 10;
    const newPrice = (basePrice + variance).toFixed(2);
    const newAmount = (Math.random() * 0.01).toFixed(6);
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
    trades.push({ price: newPrice, amount: newAmount, time });
  }

  // Sample trading pairs data
  const tradingPairs: TradingPair[] = [
    {
      pair: "10CAT/USDT",
      price: "0.00592",
      change: "+18.40%",
      leverage: "5x",
    },
    {
      pair: "1000CH/USDT",
      price: "0.00502",
      change: "-5.24%",
      leverage: "5x",
    },
    { pair: "1000SATS/USDT", price: "0.000419", change: "+0.96%" },
    { pair: "1INCH/USDT", price: "0.1761", change: "+2.44%", leverage: "5x" },
    { pair: "AAVE/USDT", price: "144.94", change: "+4.37%", leverage: "5x" },
    { pair: "ACA/USDT", price: "0.0318", change: "+0.95%", leverage: "5x" },
    { pair: "ACE/USDT", price: "0.507", change: "+3.05%", leverage: "5x" },
    { pair: "ACH/USDT", price: "0.02197", change: "-0.77%", leverage: "5x" },
    { pair: "ACM/USDT", price: "0.801", change: "+2.43%", leverage: "5x" },
    { pair: "ACT/USDT", price: "0.0563", change: "-2.76%", leverage: "5x" },
    { pair: "ACX/USDT", price: "0.2045", change: "+2.40%", leverage: "5x" },
  ];

  // Update market trades data
  const marketTrades = [
    { price: "84,762.00", amount: "0.00007", time: "18:16:09", isUp: true },
    { price: "84,761.99", amount: "0.00014", time: "18:16:09", isUp: false },
    { price: "84,762.00", amount: "0.00021", time: "18:16:08", isUp: true },
    { price: "84,762.00", amount: "0.02898", time: "18:16:07", isUp: true },
    { price: "84,762.00", amount: "0.00059", time: "18:16:07", isUp: true },
    { price: "84,761.99", amount: "0.00122", time: "18:16:07", isUp: false },
    { price: "84,762.00", amount: "0.00059", time: "18:16:06", isUp: true },
    { price: "84,761.99", amount: "0.12298", time: "18:16:06", isUp: false },
    { price: "84,762.00", amount: "0.00034", time: "18:16:06", isUp: true },
    { price: "84,762.00", amount: "0.00051", time: "18:16:05", isUp: true },
    { price: "84,761.99", amount: "0.00122", time: "18:16:07", isUp: false },
    { price: "84,762.00", amount: "0.00059", time: "18:16:06", isUp: true },
    { price: "84,761.99", amount: "0.12298", time: "18:16:06", isUp: false },
    { price: "84,762.00", amount: "0.00034", time: "18:16:06", isUp: true },
    { price: "84,762.00", amount: "0.00051", time: "18:16:05", isUp: true },
    { price: "84,761.99", amount: "0.00122", time: "18:16:07", isUp: false },
    { price: "84,762.00", amount: "0.00059", time: "18:16:06", isUp: true },
    { price: "84,761.99", amount: "0.12298", time: "18:16:06", isUp: false },
  ];

  // Create CSS class for the glow effect
  const buyButtonClass = highlightBuyButton
    ? "w-full py-2.5 rounded text-sm font-medium bg-[#2DBD85] hover:bg-opacity-90 text-white animate-pulse-glow shadow-glow"
    : "w-full py-2.5 rounded text-sm font-medium bg-[#2DBD85] hover:bg-opacity-90 text-white";

  // Create a style for the glow effect
  const glowStyle = highlightBuyButton
    ? {
        boxShadow: "0 0 15px 5px rgba(252, 213, 53, 0.7)",
        transition: "all 0.3s ease-in-out"
      }
    : {};

  // Create CSS classes for glow effects
  const totalInputClass = highlightTotalInput
    ? "w-full bg-[#1E2026] border border-[#2B2F36] text-white py-1.5 px-3 rounded text-sm animate-pulse-glow shadow-glow"
    : "w-full bg-[#1E2026] border border-[#2B2F36] text-white py-1.5 px-3 rounded text-sm";

  const priceInputClass = highlightPriceInput
    ? "w-full bg-[#1E2026] text-white py-1.5 px-3 rounded-l text-sm animate-pulse-glow shadow-glow"
    : "w-full bg-[#1E2026] text-white py-1.5 px-3 rounded-l text-sm";
    
  const amountInputClass = highlightAmountInput
    ? "w-full bg-[#1E2026] text-white py-1.5 px-3 rounded-l text-sm animate-pulse-glow shadow-glow"
    : "w-full bg-[#1E2026] text-white py-1.5 px-3 rounded-l text-sm";

  // Create styles for glow effects
  const totalInputStyle = highlightTotalInput
    ? {
        boxShadow: "0 0 15px 5px rgba(252, 213, 53, 0.7)",
        transition: "all 0.3s ease-in-out"
      }
    : {};
    
  const priceInputStyle = highlightPriceInput
    ? {
        boxShadow: "0 0 15px 5px rgba(252, 213, 53, 0.7)",
        transition: "all 0.3s ease-in-out"
      }
    : {};
    
  const amountInputStyle = highlightAmountInput
    ? {
        boxShadow: "0 0 15px 5px rgba(252, 213, 53, 0.7)",
        transition: "all 0.3s ease-in-out"
      }
    : {};

  // Reset conversation state handler - Add this to clear states when needed
  const resetTradeForm = () => {
    setBuyPrice("81863.98");
    setBuyAmount("0.00000");
    setBuyTotal("0");
    setBuySliderValue(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E11] text-white">
      {/* Top info bar */}
      <div className="bg-[#0B0E11] py-2 px-4 border-b border-[#1E2026]">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold">BTC/USDT</h2>
            <span className="text-sm text-gray-400">Bitcoin</span>
          </div>
          <div className="flex ml-8 space-x-6">
            <div>
              <span className="text-sm text-gray-400">Price</span>
              <div className="font-bold text-green-500">$81,915.32</div>
            </div>
            <div>
              <span className="text-sm text-gray-400">24h Change</span>
              <div className="font-bold text-green-500">+1.18%</div>
            </div>
            <div>
              <span className="text-sm text-gray-400">24h High</span>
              <div className="font-bold">$83,333.00</div>
            </div>
            <div>
              <span className="text-sm text-gray-400">24h Low</span>
              <div className="font-bold">$79,769.58</div>
            </div>
            <div>
              <span className="text-sm text-gray-400">24h Volume(BTC)</span>
              <div className="font-bold">37,255.23</div>
            </div>
            <div>
              <span className="text-sm text-gray-400">24h Volume(USDT)</span>
              <div className="font-bold">3,009,882,093.74</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 bg-[#0B0E11]">
        {/* Left sidebar - Order book */}
        <div className="w-[240px] bg-[#0B0E11] overflow-y-auto border-r border-[#1E2026]">
          <div className="bg-[#0B0E11] p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Order Book</span>
              <div className="flex space-x-1">
                <button className="bg-[#2B3039] text-xs px-2 py-0.5 rounded">
                  0.1
                </button>
                <button className="bg-gray-700 text-xs px-2 py-0.5 rounded">
                  0.01
                </button>
                <button className="bg-[#2B3039] text-xs px-2 py-0.5 rounded">
                  0.001
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Price(USDT)</span>
              <span>Amount(BTC)</span>
              <span>Total</span>
            </div>
          </div>

          {/* Asks (sell orders) */}
          <div className="px-2">
            {asks.map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="flex justify-between text-xs py-0.5 text-[#F6475D]"
              >
                <span>{ask.price}</span>
                <span className="text-white">{ask.amount}</span>
                <span className="text-gray-500">{ask.total}</span>
              </div>
            ))}
          </div>

          {/* Current price */}
          <div className="bg-[#131722] py-1 px-2 text-center font-bold text-sm text-[#2DBD85]">
            {buyPrice}
          </div>

          {/* Bids (buy orders) */}
          <div className="px-2">
            {bids.map((bid, index) => (
              <div
                key={`bid-${index}`}
                className="flex justify-between text-xs py-0.5 text-[#2DBD85]"
              >
                <span>{bid.price}</span>
                <span className="text-white">{bid.amount}</span>
                <span className="text-gray-500">{bid.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Chart and trading form */}
        <div className="flex-1 flex flex-col bg-[#0B0E11]">
          {/* Tabs */}
          <div className="bg-[#0B0E11] p-2 flex justify-between border-b border-[#1E2026]">
            <div className="flex space-x-4">
              <button className="text-white border-b-2 border-[#FCD535]">
                Chart
              </button>
              <button className="text-gray-400 hover:text-white">Info</button>
              <button className="text-gray-400 hover:text-white">
                Trading Data
              </button>
              <button className="text-gray-400 hover:text-white">
                Trading Analysis
              </button>
              <button className="text-gray-400 hover:text-white">Square</button>
            </div>

            <div className="flex space-x-2">
              <button className="text-xs bg-[#1E2026] px-2 py-1 rounded">
                Original
              </button>
              <button className="text-xs bg-[#1E2026] px-2 py-1 rounded">
                Trading View
              </button>
              <button className="text-xs bg-[#1E2026] px-2 py-1 rounded">
                Depth
              </button>
            </div>
          </div>

          {/* Chart area with time controls */}
          <div className="p-2 border-b border-[#1E2026] flex space-x-2 text-xs bg-[#0B0E11]">
            <button className="bg-[#1E2026] px-2 py-1 rounded">Time</button>
            <button className="px-2 py-1">1s</button>
            <button className="px-2 py-1">15m</button>
            <button className="px-2 py-1">1H</button>
            <button className="px-2 py-1">4H</button>
            <button className="px-2 py-1">1D</button>
            <button className="px-2 py-1">1W</button>
          </div>

          {/* Main chart area */}
          <div className=" relative bg-[#0B0E11]">
            {/* Placeholder for chart - in a real app you'd use a charting library */}
            <div className="w-full h-[350px] flex items-center justify-center">
              <img
                src="/SS/btc-graph.png"
                alt="Chart placeholder"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Trading form - Updated to match screenshot */}
          <div className="bg-[#0B0E11] border-t border-[#1E2026]">
            {/* Main trading tabs */}
            <div className="flex border-b border-[#1E2026] text-sm">
              <button
                className={`py-2 px-4 ${
                  activeTab === "spot"
                    ? "text-white border-b-2 border-[#FCD535] font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("spot")}
              >
                Spot
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "cross"
                    ? "text-white border-b-2 border-[#FCD535] font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("cross")}
              >
                Cross
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "isolated"
                    ? "text-white border-b-2 border-[#FCD535] font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("isolated")}
              >
                Isolated
              </button>
              <button
                className={`py-2 px-4 ${
                  activeTab === "grid"
                    ? "text-white border-b-2 border-[#FCD535] font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("grid")}
              >
                Grid
              </button>
            </div>

            {/* Order type tabs with icons */}
            <div className="flex items-center justify-between py-2 px-4 border-b border-[#1E2026]">
              <div className="flex space-x-4">
                <button
                  className={`px-3 py-1 rounded-md ${
                    orderType === "limit" 
                      ? "text-binance-yellow" 
                      : "text-gray-400"
                  } ${
                    highlightOrderTypes ? "animate-pulse-glow" : ""
                  }`}
                  style={{
                    ...(highlightOrderTypes
                      ? {
                          boxShadow: "0 0 15px 5px rgba(252, 213, 53, 0.7)",
                          transition: "all 0.3s ease-in-out"
                        }
                      : {})
                  }}
                  onClick={() => {
                    setOrderType("limit");
                    if (buyPrice === "Market") {
                      setBuyPrice("81863.98");
                      // Reset total and amount if they're currently zero
                      if (buyTotal === "0" || parseFloat(buyTotal) === 0) {
                        setBuyTotal("0");
                        setBuyAmount("0.00000");
                        setBuySliderValue(0);
                      }
                    }
                  }}
                >
                  Limit
                </button>
                <button
                  className={`px-3 py-1 rounded-md ${
                    orderType === "market" 
                      ? "text-binance-yellow" 
                      : "text-gray-400"
                  } ${
                    highlightOrderTypes ? "animate-pulse-glow" : ""
                  }`}
                  style={{
                    ...(highlightOrderTypes
                      ? {
                          boxShadow: "0 0 15px 5px rgba(252, 213, 53, 0.7)",
                          transition: "all 0.3s ease-in-out"
                        }
                      : {})
                  }}
                  onClick={() => {
                    setOrderType("market");
                    setBuyPrice("Market");
                    // Reset total and amount if they're currently zero
                    if (buyTotal === "0" || parseFloat(buyTotal) === 0) {
                      setBuyTotal("0");
                      setBuyAmount("0.00000");
                      setBuySliderValue(0);
                    }
                  }}
                >
                  Market
                </button>
                <div className="flex items-center">
                  <button
                    className={`px-3 py-1 rounded-md ${
                      orderType === "stop-limit"
                        ? "text-binance-yellow"
                        : "text-gray-400"
                    } mr-1`}
                    onClick={() => {
                      setOrderType("stop-limit");
                      if (buyPrice === "Market") {
                        setBuyPrice("81863.98");
                        // Reset total and amount if they're currently zero
                        if (buyTotal === "0" || parseFloat(buyTotal) === 0) {
                          setBuyTotal("0");
                          setBuyAmount("0.00000");
                          setBuySliderValue(0);
                        }
                      }
                    }}
                  >
                    Stop Limit
                  </button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-gray-400 text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Auto-Invest
                </div>
                <div className="flex items-center text-gray-400 text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                  Buy with EUR
                </div>
              </div>
            </div>

            {/* Main trading form with buy and sell sides */}
            <div className="flex">
              {/* Buy side */}
              <div className="w-1/2 px-6 py-4 border-r border-[#1E2026]">
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-3">
                    <h3 className="text-[#2DBD85] font-medium">BUY BTC</h3>
                    <span className="text-gray-400 text-xs">
                      Available: 1,000 USDT
                    </span>
                  </div>

                  {/* Price input - Buy side with highlight */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-gray-400">Price</label>
                      <span className="text-gray-400">USDT</span>
                    </div>
                    <div className="relative flex">
                      <input
                        type="text"
                        className={priceInputClass}
                        style={priceInputStyle}
                        value={buyPrice}
                        onChange={handleBuyPriceChange}
                        readOnly={orderType === "market"}
                        placeholder={orderType === "market" ? "Market" : ""}
                      />
                      <div className="flex flex-col bg-[#1E2026] rounded-r border-l border-[#2B2F36] px-1">
                        <button 
                          className="text-gray-400 hover:text-white text-[8px] leading-3 pt-1"
                          disabled={orderType === "market"}
                        >
                          ▲
                        </button>
                        <button 
                          className="text-gray-400 hover:text-white text-[8px] leading-3 pb-1"
                          disabled={orderType === "market"}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amount input - Buy side with highlight */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-gray-400">Amount</label>
                      <span className="text-gray-400">BTC</span>
                    </div>
                    <div className="relative flex">
                      <input
                        type="text"
                        className={amountInputClass}
                        style={amountInputStyle}
                        value={buyAmount}
                        onChange={handleBuyAmountChange}
                      />
                      <div className="flex flex-col bg-[#1E2026] rounded-r border-l border-[#2B2F36] px-1">
                        <button className="text-gray-400 hover:text-white text-[8px] leading-3 pt-1">
                          ▲
                        </button>
                        <button className="text-gray-400 hover:text-white text-[8px] leading-3 pb-1">
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Slider for amount */}
                  <div className="mb-3 relative">
                    <div className="relative mt-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={buySliderValue}
                        onChange={handleBuySliderChange}
                        className="w-full appearance-none h-0.5 bg-[#1E2026] focus:outline-none"
                        style={{
                          background:
                            "linear-gradient(to right, #FCD535 0%, #FCD535 " +
                            buySliderValue +
                            "%, #1E2026 " +
                            buySliderValue +
                            "%, #1E2026 100%)",
                          WebkitAppearance: "none",
                        }}
                      />
                      {/* Render the diamond thumb separately */}
                      <div
                        className="absolute w-5 h-5 transform rotate-45 bg-[#0B0E11] border-2 border-white z-10"
                        style={{
                          top: "7px",
                          left: `calc(${buySliderValue}% - 9px)`,
                          pointerEvents: "none",
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-3">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Total input - Buy side with highlight */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-gray-400">Total</label>
                      <span className="text-gray-400">USDT</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className={totalInputClass}
                        style={totalInputStyle}
                        value={buyTotal}
                        onChange={handleBuyTotalChange}
                      />
                    </div>
                  </div>

                  {/* TP/SL checkbox */}
                  <div className="flex mb-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 bg-transparent border border-gray-600 text-[#FCD535]"
                      checked={tpSl}
                      onChange={() => setTpSl(!tpSl)}
                    />
                    <span className="ml-2 text-xs text-gray-400">TP/SL</span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avbl</span>
                      <span>0.00000000 USDT</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 border-b border-dashed border-gray-600">
                        Max Buy
                      </span>
                      <span>0.8 BTC</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Est. Fee</span>
                      <span>0.0000061 BTC</span>
                    </div>
                  </div>

                  {/* Buy button with highlight */}
                  <button 
                    className={buyButtonClass}
                    style={glowStyle}
                    onClick={handleBuyButtonClick}
                  >
                    Buy BTC
                  </button>
                </div>
              </div>

              {/* Sell side */}
              <div className="w-1/2 px-6 py-4">
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-3">
                    <h3 className="text-[#F6475D] font-medium">SELL BTC</h3>
                    <span className="text-gray-400 text-xs">
                      Available: 0.5 BTC
                    </span>
                  </div>

                  {/* Price input - Sell side (no highlight) */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-gray-400">Price</label>
                      <span className="text-gray-400">USDT</span>
                    </div>
                    <div className="relative flex">
                      <input
                        type="text"
                        className="w-full bg-[#1E2026] text-white py-1.5 px-3 rounded-l text-sm"
                        value={sellPrice}
                        onChange={handleSellPriceChange}
                        readOnly={orderType === "market"}
                        placeholder={orderType === "market" ? "Market" : ""}
                      />
                      <div className="flex flex-col bg-[#1E2026] rounded-r border-l border-[#2B2F36] px-1">
                        <button 
                          className="text-gray-400 hover:text-white text-[8px] leading-3 pt-1"
                          disabled={orderType === "market"}
                        >
                          ▲
                        </button>
                        <button 
                          className="text-gray-400 hover:text-white text-[8px] leading-3 pb-1"
                          disabled={orderType === "market"}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Amount input - Sell side (no highlight) */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-gray-400">Amount</label>
                      <span className="text-gray-400">BTC</span>
                    </div>
                    <div className="relative flex">
                      <input
                        type="text"
                        className="w-full bg-[#1E2026] text-white py-1.5 px-3 rounded-l text-sm"
                        value={sellAmount}
                        onChange={handleSellAmountChange}
                      />
                      <div className="flex flex-col bg-[#1E2026] rounded-r border-l border-[#2B2F36] px-1">
                        <button className="text-gray-400 hover:text-white text-[8px] leading-3 pt-1">
                          ▲
                        </button>
                        <button className="text-gray-400 hover:text-white text-[8px] leading-3 pb-1">
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Slider for amount */}
                  <div className="mb-3 relative">
                    <div className="relative mt-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sellSliderValue}
                        onChange={handleSellSliderChange}
                        className="w-full appearance-none h-0.5 bg-[#1E2026] focus:outline-none"
                        style={{
                          background:
                            "linear-gradient(to right, #FCD535 0%, #FCD535 " +
                            sellSliderValue +
                            "%, #1E2026 " +
                            sellSliderValue +
                            "%, #1E2026 100%)",
                          WebkitAppearance: "none",
                        }}
                      />
                      {/* Render the diamond thumb separately */}
                      <div
                        className="absolute w-5 h-5 transform rotate-45 bg-[#0B0E11] border-2 border-white z-10"
                        style={{
                          top: "7px",
                          left: `calc(${sellSliderValue}% - 9px)`,
                          pointerEvents: "none",
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-3">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Total input - Sell side (no highlight) */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <label className="text-gray-400">Total</label>
                      <span className="text-gray-400">USDT</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full bg-[#1E2026] border border-[#2B2F36] text-white py-1.5 px-3 rounded text-sm"
                        value={sellTotal}
                        onChange={handleSellTotalChange}
                      />
                    </div>
                  </div>

                  {/* TP/SL checkbox */}
                  <div className="flex mb-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 bg-transparent border border-gray-600 text-[#FCD535]"
                      checked={tpSl}
                      onChange={() => setTpSl(!tpSl)}
                    />
                    <span className="ml-2 text-xs text-gray-400">TP/SL</span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avbl</span>
                      <span>0.00000000 BTC</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 border-b border-dashed border-gray-600">
                        Max Sell
                      </span>
                      <span>839.39USDT</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Est. Fee</span>
                      <span>0.0000061 BTC</span>
                    </div>
                  </div>

                  {/* Sell button (no highlight) */}
                  <button className="w-full py-2.5 rounded text-sm font-medium bg-[#F6475D] hover:bg-opacity-90 text-white">
                    Sell BTC
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Market Trades and Trading Pairs */}
        <div className="w-[280px] bg-[#0B0E11] overflow-hidden flex flex-col border-l border-[#1E2026]">
          {/* Search bar and trading pairs section */}
          <div className="flex-none">
            <div className="bg-[#0B0E11] px-3 py-2 border-b border-[#1E2026]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="bg-[#1E2026] w-full py-2 pl-10 pr-4 rounded-md text-sm text-white focus:outline-none"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex py-2 space-x-4 text-sm">
                <div className="flex items-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span>New</span>
                </div>
                <button className="text-white font-medium border-b-2 border-[#FCD535]">
                  USDT
                </button>
                <button className="text-gray-400">USDC</button>
                <button className="text-gray-400">FDUSD</button>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 py-2">
                <div className="flex space-x-2">
                  <span className="flex items-center">
                    Pair
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                  <span className="flex items-center">
                    Last Price
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                  <span className="flex items-center">
                    24h
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Trading pairs list */}
            <div className="max-h-[300px] overflow-y-auto border-b border-[#1E2026]">
              {tradingPairs.map((pair, index) => (
                <div
                  key={`pair-${index}`}
                  className="flex items-center px-3 py-2 text-sm hover:bg-[#1E2026]"
                >
                  <div className="flex items-center w-2/5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{pair.pair}</span>
                    {pair.leverage && (
                      <span className="ml-2 bg-[#2B3039] text-xs px-1 py-0.5 rounded text-gray-400">
                        {pair.leverage}
                      </span>
                    )}
                  </div>
                  <div className="w-1/3 text-right">{pair.price}</div>
                  <div
                    className={`w-1/3 text-right ${
                      pair.change.startsWith("+")
                        ? "text-[#2DBD85]"
                        : "text-[#F6475D]"
                    }`}
                  >
                    {pair.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market trades section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Market trades tabs */}
            <div className="border-b border-[#1E2026]">
              <div className="flex">
                <button className="py-2 px-4 text-white border-b-2 border-[#FCD535] text-sm font-medium">
                  Market Trades
                </button>
                <button className="py-2 px-4 text-gray-400 text-sm">
                  My Trades
                </button>
                <button className="flex items-center justify-center w-12 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Market trades header */}
            <div className="flex justify-between text-xs text-gray-400 px-3 py-2 border-b border-[#1E2026]">
              <span>Price (USDT)</span>
              <span>Amount (BTC)</span>
              <span>Time</span>
            </div>

            {/* Market trades list */}
            <div className="overflow-y-auto flex-1">
              {marketTrades.map((trade, index) => (
                <div
                  key={`trade-${index}`}
                  className="flex justify-between text-xs px-3 py-1.5"
                >
                  <span
                    className={trade.isUp ? "text-[#2DBD85]" : "text-[#F6475D]"}
                  >
                    {trade.price}
                  </span>
                  <span className="text-white">{trade.amount}</span>
                  <span className="text-gray-500">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
