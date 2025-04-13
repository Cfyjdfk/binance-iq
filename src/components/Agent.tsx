import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import agentService from "../services/agentService";
import { useIQContext, Message, ChatOptions } from "../AIContext";

// Import styles
import "./scrollbar.css";
import "./Agent.css";

interface AgentProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (
    message: string,
    type: "success" | "error" | "info",
    subtitle?: string
  ) => void;
}

const Agent: React.FC<AgentProps> = ({ isOpen, onClose, showToast }) => {
  const navigate = useNavigate();
  const { 
    messages, 
    setMessages, 
    showOptions, 
    setShowOptions, 
    isLoading, 
    setIsLoading,
    navigatedFromCurrency,
    setNavigatedFromCurrency,
    purchaseState,
    setPurchaseState,
    setHighlightBuyButton,
    setHighlightTotalInput,
    setHighlightPriceInput,
    setHighlightAmountInput
  } = useIQContext();
  
  const [inputValue, setInputValue] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [isPurchasePage, setIsPurchasePage] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);
  const [morphDirection, setMorphDirection] = useState<"to-floating" | "to-modal" | null>(null);
  
  // State for draggable floating window
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 320, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 320, height: 500 });
  
  const floatingWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef<string | null>(null);

  // Check if we're on the purchase page and handle morphing animations
  useEffect(() => {
    const onPurchasePage = window.location.pathname.includes("/purchase");
    
    // If we're changing page types and the agent is open, trigger morphing animation
    if (previousPageRef.current !== null && isOpen) {
      const wasOnPurchasePage = previousPageRef.current.includes("/purchase");
      
      if (onPurchasePage && !wasOnPurchasePage) {
        // Morphing from modal to floating
        setMorphDirection("to-floating");
        setIsMorphing(true);
        
        // After animation completes, update the state
        setTimeout(() => {
          setIsMorphing(false);
          setIsPurchasePage(true);
        }, 800); // Match animation duration
      } 
      else if (!onPurchasePage && wasOnPurchasePage) {
        // Morphing from floating to modal
        setMorphDirection("to-modal");
        setIsMorphing(true);
        
        // After animation completes, update the state
        setTimeout(() => {
          setIsMorphing(false);
          setIsPurchasePage(false);
        }, 800); // Match animation duration
      }
      else {
        // No morphing needed, just update the state
        setIsPurchasePage(onPurchasePage);
      }
    } else {
      // First render or closed agent, just update the state
      setIsPurchasePage(onPurchasePage);
    }
    
    // Remember current page for next time
    previousPageRef.current = window.location.pathname;
  }, [window.location.pathname, isOpen]);

  // Reset exiting state when component opens
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false);
    }
  }, [isOpen]);

  // Setup drag event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && floatingWindowRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Get window bounds to ensure it stays visible on screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const floatingWindowWidth = floatingWindowRef.current.offsetWidth;
        const floatingWindowHeight = floatingWindowRef.current.offsetHeight;
        
        // Limit position so window doesn't go off-screen
        const limitedX = Math.max(0, Math.min(newX, windowWidth - floatingWindowWidth));
        const limitedY = Math.max(0, Math.min(newY, windowHeight - 100));
        
        setPosition({ x: limitedX, y: limitedY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Setup resize event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate new width and height
        const newWidth = Math.max(280, resizeStartSize.width + (e.clientX - resizeStartPos.x));
        const newHeight = Math.max(400, resizeStartSize.height + (e.clientY - resizeStartPos.y));
        
        // Update window size
        setWindowSize({
          width: newWidth,
          height: newHeight
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartPos, resizeStartSize]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (floatingWindowRef.current) {
      const rect = floatingWindowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizeStartPos({
      x: e.clientX,
      y: e.clientY
    });
    
    setResizeStartSize({
      width: windowSize.width,
      height: windowSize.height
    });
    
    setIsResizing(true);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus the input field
      inputRef.current.focus();

      // Reset state when reopening with empty messages
      if (messages.length === 0) {
        setInputValue("");
        setShowOptions({ type: null });
      }
      // Scroll to bottom when reopening with existing messages
      else if (messagesEndRef.current) {
        // Use setTimeout to ensure DOM is fully updated before scrolling
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [isOpen, messages.length]);

  // Handle close with animation
  const handleClose = () => {
    setIsExiting(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // Effect to check if we need to show order type options after navigation
  useEffect(() => {
    const checkPathAndShowOptions = async () => {
      if (window.location.pathname.includes("/purchase") && navigatedFromCurrency) {
        // Reset the flag
        setNavigatedFromCurrency(false);
        
        // Add a small delay to make it feel natural
        setTimeout(async () => {
          try {
            const response = await agentService.processMessage("orderType");
            
            const agentMessage: Message = {
              sender: "agent",
              text: response.text,
            };
            
            setMessages(prev => [...prev, agentMessage]);
            
            if (response.options) {
              setShowOptions({
                type: response.options.type || null,
                options: response.options.choices,
                coin: response.options.data?.coin,
                amount: response.options.data?.buyAmount,
                price: response.options.data?.price,
              });
            }
          } catch (error) {
            console.error("Error processing order type options:", error);
          }
        }, 500);
      }
    };
    
    checkPathAndShowOptions();
  }, [navigatedFromCurrency, window.location.pathname]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      sender: "user",
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowOptions({ type: null });

    try {
      const response = await agentService.processMessage(userMessage.text);

      const agentMessage: Message = {
        sender: "agent",
        text: response.text,
      };

      setMessages((prev) => [...prev, agentMessage]);

      if (response.options) {
        if (response.options.type === "confirmation") {
          // Add confirmation UI as a message
          const price = response.options.data?.price || "81863.98";
          const amount = response.options.data?.buyAmount || "0.00610";
          const total = "500"; // Default value

          setMessages((prev) => [
            ...prev,
            {
              sender: "agent",
              text: "Please confirm your order:",
              specialUI: "confirmation",
              data: {
                price,
                buyAmount: amount,
                buyTotal: total,
              },
            },
          ]);
        } else {
          setShowOptions({
            type: response.options.type || null,
            options: response.options.choices,
            coin: response.options.data?.coin,
            amount: response.options.data?.buyAmount,
            price: response.options.data?.price,
          });
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    // Directly call handleSendMessage with the action
    const userMessage: Message = {
      sender: "user",
      text: action,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowOptions({ type: null });

    try {
      // Use immediate invocation of async function
      (async () => {
        try {
          const response = await agentService.processMessage(userMessage.text);

          const agentMessage: Message = {
            sender: "agent",
            text: response.text,
          };

          setMessages((prev) => [...prev, agentMessage]);

          if (response.options) {
            if (response.options.type === "confirmation") {
              // Add confirmation UI as a message
              const price = response.options.data?.price || "81863.98";
              const amount = response.options.data?.buyAmount || "0.00610";
              const total = "500"; // Default value

              setMessages((prev) => [
                ...prev,
                {
                  sender: "agent",
                  text: "Please confirm your order:",
                  specialUI: "confirmation",
                  data: {
                    price,
                    buyAmount: amount,
                    buyTotal: total,
                  },
                },
              ]);
            } else {
              setShowOptions({
                type: response.options.type || null,
                options: response.options.choices,
                coin: response.options.data?.coin,
                amount: response.options.data?.buyAmount,
                price: response.options.data?.price,
              });
            }
          }
        } catch (error) {
          console.error("Error processing message:", error);

          setMessages((prev) => [
            ...prev,
            {
              sender: "agent",
              text: "Sorry, I encountered an error processing your request. Please try again.",
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      })();
    } catch (error) {
      console.error("Error in handleQuickAction:", error);
      setIsLoading(false);
    }
  };

  // Special handler for the Limit/Market selection
  const handleOrderTypeSelection = (orderType: "limit" | "market") => {
    // Update the purchaseState with the selected order type
    setPurchaseState(prev => {
      // For market orders, we need to handle the price field differently
      if (orderType === "market") {
        return {
          ...prev,
          orderType: orderType,
          buyPrice: "Market", // Special text value for market orders
          sellPrice: "Market",
          buyAmount: "0.00000",
          sellAmount: prev.sellAmount, // Keep sellAmount unchanged
          buyTotal: "0",  // Default total is 0
          sellTotal: prev.sellTotal, // Keep sellTotal unchanged
          buySliderValue: 0,
          sellSliderValue: prev.sellSliderValue, // Keep sellSliderValue unchanged
        };
      } else {
        // For limit orders, we use a numeric price
        return {
          ...prev,
          orderType: orderType,
          buyPrice: "81863.98",
          sellPrice: "81863.98",
          buyAmount: "0.00000",
          sellAmount: prev.sellAmount, // Keep sellAmount unchanged
          buyTotal: "0",
          sellTotal: prev.sellTotal, // Keep sellTotal unchanged
          buySliderValue: 0,
          sellSliderValue: prev.sellSliderValue, // Keep sellSliderValue unchanged
        };
      }
    });
  };

  // When an order amount is set or confirmed, this handles updating with the real value
  const setOrderAmount = (price: string, amount: string, total: string) => {
    // Calculate slider value based on amount (assuming max is 0.01 BTC)
    const maxAmount = 0.01;
    const amountValue = parseFloat(amount);
    const buySliderValue = Math.min(Math.round((amountValue / maxAmount) * 100), 100);
    
    setPurchaseState(prev => {
      return {
        ...prev,
        // Only update buy side values, leave sell side unchanged
        buyPrice: price,
        buyAmount: amount,
        buyTotal: total,
        buySliderValue,
        // Keep sell side values unchanged
        sellPrice: prev.sellPrice,
        sellAmount: prev.sellAmount,
        sellTotal: prev.sellTotal,
        sellSliderValue: prev.sellSliderValue
      };
    });
    
    // Highlight input fields when setting non-zero values
    // Only highlight the buy side inputs
    if (total && parseFloat(total) > 0) {
      setHighlightTotalInput(true);
    }
    
    if (amount && parseFloat(amount) > 0) {
      setHighlightAmountInput(true);
    }
    
    if (price && price !== "Market") {
      setHighlightPriceInput(true);
    }
  };

  const handleOptionClick = async (option: string) => {
    const userMessage: Message = {
      sender: "user",
      text: option,
    };

    // Only hide non-confirmation options
    if (showOptions.type !== "confirmation") {
      setShowOptions({ type: null });
    }

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Mark the button as pressed in the confirmation UI
    if (option === "Cancel" || option === "Review") {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.specialUI === "confirmation") {
            return {
              ...msg,
              data: {
                ...msg.data,
                buttonPressed: option as "Cancel" | "Execute Trade",
              },
            };
          }
          return msg;
        })
      );
    }

    // Special handling for Review (formerly Execute Trade)
    if (option === "Review") {
      setTimeout(() => {
        const agentMessage: Message = {
          sender: "agent",
          text: "Great! Let's review your order on the purchase page. Click the highlighted 'Buy BTC' button to complete your purchase.",
        };

        setMessages((prev) => [...prev, agentMessage]);
        setIsLoading(false);
        
        // Set the highlight flags for the buy button and input fields (buy side only)
        setHighlightBuyButton(true);
        setHighlightTotalInput(true);
        setHighlightPriceInput(true);
        setHighlightAmountInput(true);
        
        // Close the agent window after a short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      }, 500);

      return;
    }

    // Special handling for Cancel button in confirmation UI
    if (option === "Cancel") {
      setTimeout(() => {
        const agentMessage: Message = {
          sender: "agent",
          text: "No problem. I've canceled the transaction. Is there anything else you'd like to do?",
        };

        setMessages((prev) => [...prev, agentMessage]);
        setIsLoading(false);
        
        // Reset all highlight flags
        setHighlightBuyButton(false);
        setHighlightTotalInput(false);
        setHighlightPriceInput(false);
        setHighlightAmountInput(false);
      }, 500);

      return;
    }

    // Special handling for USDC or USDT
    if (option === "USDC" || option === "USDT") {
      try {
        const response = await agentService.processMessage(option);

        const agentMessage: Message = {
          sender: "agent",
          text: response.text,
        };

        setMessages((prev) => [...prev, agentMessage]);
        setIsLoading(false);
        
        // Set the flag that we navigated from currency selection
        setNavigatedFromCurrency(true);
        
        // If not already on the purchase page, start morphing transition
        if (!window.location.pathname.includes("/purchase")) {
          setMorphDirection("to-floating");
          setIsMorphing(true);
          
          // Navigate to the purchase page after a delay to allow animation to start
          setTimeout(() => {
            navigate("/purchase");
          }, 100);
        } else {
          // Already on purchase page, no need to morph
          navigate("/purchase");
        }
        
        return;
      } catch (error) {
        console.error("Error processing currency option:", error);
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: "Sorry, I encountered an error processing your selection. Please try again.",
          },
        ]);
        setIsLoading(false);
        return;
      }
    }

    // Handle Limit/Market options
    if (option === "Limit" || option === "Market") {
      // Set order type in purchase state
      handleOrderTypeSelection(option.toLowerCase() as "limit" | "market");
      
      // Then continue with regular processing
      setTimeout(async () => {
        try {
          const response = await agentService.processMessage(option);

          const agentMessage: Message = {
            sender: "agent",
            text: response.text,
          };

          setMessages((prev) => [...prev, agentMessage]);

          if (response.options) {
            // Don't add another confirmation UI if we're already showing one
            if (response.options.type === "confirmation") {
              const price = response.options.data?.price || "81863.98";
              const amount = response.options.data?.buyAmount || "0.00610";
              const total = "500"; // Set to 500 for confirmation

              // Update the purchase state with the confirmation values
              if (option === "Market") {
                setOrderAmount("Market", amount, total);
              } else {
                setOrderAmount(price, amount, total);
              }

              setMessages((prev) => [
                ...prev,
                {
                  sender: "agent",
                  text: "Please confirm your order:",
                  specialUI: "confirmation",
                  data: {
                    price,
                    buyAmount: amount,
                    buyTotal: total,
                  },
                },
              ]);
            } else {
              setShowOptions({
                type: response.options.type || null,
                options: response.options.choices,
                coin: response.options.data?.coin,
                amount: response.options.data?.buyAmount,
                price: response.options.data?.price,
              });
            }
          }
        } catch (error) {
          console.error("Error processing option:", error);

          setMessages((prev) => [
            ...prev,
            {
              sender: "agent",
              text: "Sorry, I encountered an error processing your selection. Please try again.",
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
      
      return;
    }

    setTimeout(async () => {
      try {
        const response = await agentService.processMessage(option);

        const agentMessage: Message = {
          sender: "agent",
          text: response.text,
        };

        setMessages((prev) => [...prev, agentMessage]);

        if (response.options) {
          // Don't add another confirmation UI if we're already showing one
          if (response.options.type === "confirmation") {
            const price = response.options.data?.price || "81863.98";
            const amount = response.options.data?.buyAmount || "0.00610";
            const total = "500"; // Default value

            setMessages((prev) => [
              ...prev,
              {
                sender: "agent",
                text: "Please confirm your order:",
                specialUI: "confirmation",
                data: {
                  price,
                  buyAmount: amount,
                  buyTotal: total,
                },
              },
            ]);
          } else {
            setShowOptions({
              type: response.options.type || null,
              options: response.options.choices,
              coin: response.options.data?.coin,
              amount: response.options.data?.buyAmount,
              price: response.options.data?.price,
            });
          }
        }
      } catch (error) {
        console.error("Error processing option:", error);

        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: "Sorry, I encountered an error processing your selection. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const resetConversation = () => {
    setMessages([]);
    setInputValue("");
    setShowOptions({ type: null });
  };

  if (!isOpen) return null;

  // If we're in the morphing state, render the morphing component
  if (isMorphing) {
    return (
      <>
        {/* Fading overlay (only for to-floating transition) */}
        {morphDirection === "to-floating" && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 fading-overlay"
            onClick={(e) => e.preventDefault()}
          ></div>
        )}
        
        {/* Morphing container */}
        <div 
          className={`bg-black border-2 border-binance-yellow overflow-hidden morphing-active ${
            morphDirection === "to-floating" ? "morphing-to-floating" : "morphing-to-modal"
          }`}
          style={{ 
            borderColor: morphDirection === "to-floating" ? 'rgba(252, 213, 53, 0.9)' : 'rgba(252, 213, 53, 1)'
          }}
        >
          {/* Same content structure as both components with smoother transitions */}
          <div className={`flex items-center justify-between border-b border-gray-800 ${
            morphDirection === "to-floating" ? "p-3" : "p-4"
          } transition-all duration-800 ease-in-out`}>
            <div className="flex items-center gap-2">
              <img 
                src="/binance-logo.png" 
                alt="Logo" 
                className={`transition-all duration-800 ease-in-out ${
                  morphDirection === "to-floating" ? "h-5" : "h-6"
                }`} 
              />
              <span className={`text-white font-bold transition-all duration-800 ease-in-out ${
                morphDirection === "to-floating" ? "text-base" : "text-lg"
              }`}>Agent</span>
            </div>
            <button className="text-gray-400">
              <XMarkIcon className={`transition-all duration-800 ease-in-out ${
                morphDirection === "to-floating" ? "h-5 w-5" : "h-6 w-6"
              }`} />
            </button>
          </div>
          
          {/* Simplified content area during morphing with smoother animations */}
          <div className="flex-1 overflow-hidden">
            <div className={`px-4 py-3 transition-all duration-800 ease-in-out ${
              morphDirection === "to-floating" ? "scale-95" : "scale-100"
            }`} style={{ transformOrigin: "center top" }}>
              {messages.length > 0 ? (
                <div className="text-white">
                  {messages[messages.length - 1].text}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="px-3 py-2 bg-[#1E2026] text-white rounded-full">
                    Buy 500 USD worth of BTC
                  </div>
                </div>
              )}
            </div>
            
            {/* Show options if they exist */}
            {showOptions.type && showOptions.options && (
              <div className={`flex flex-wrap gap-2 px-4 transition-all duration-800 ease-in-out ${
                morphDirection === "to-floating" ? "scale-95 opacity-90" : "scale-100 opacity-100"
              }`} style={{ transformOrigin: "center center" }}>
                {showOptions.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className="px-3 py-1 bg-[#1E2026] text-white rounded-lg border border-binance-yellow"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Simplified input area with smoother animation */}
          <div className={`border-t border-gray-800 transition-all duration-800 ease-in-out ${
            morphDirection === "to-floating" ? "px-3 py-2" : "px-4 py-3"
          }`}>
            <div className={`relative flex items-center transition-all duration-800 ease-in-out ${
              morphDirection === "to-floating" ? "scale-95" : "scale-100"
            }`} style={{ transformOrigin: "center center" }}>
              <div className="w-full bg-[#1E2026] rounded-full" style={{ 
                height: morphDirection === "to-floating" ? "32px" : "40px",
                transition: "height 0.8s ease-in-out"
              }}></div>
              <div className={`ml-2 bg-binance-yellow rounded-full ${
                morphDirection === "to-floating" ? "px-3 py-1.5" : "px-4 py-2.5"
              } transition-all duration-800 ease-in-out`}></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Otherwise, render either floating window or modal based on the page
  if (isPurchasePage) {
    // Floating window style with animation (for purchase page)
    return (
      <div 
        ref={floatingWindowRef}
        className={`fixed z-40 shadow-lg ${isExiting ? 'agent-sidebar-exit' : 'agent-sidebar'}`}
        style={{
          width: `${windowSize.width}px`,
          height: `${windowSize.height}px`,
          top: `${position.y}px`,
          left: `${position.x}px`,
          borderRadius: "1rem"
        }}
      >
        {/* Agent floating window */}
        <div className="h-full bg-black border border-binance-yellow flex flex-col overflow-hidden rounded-xl">
          {/* Header - Draggable */}
          <div 
            className="flex items-center justify-between p-3 cursor-move"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <img src="/binance-logo.png" alt="Logo" className="h-5" />
              <span className="text-white text-base font-bold">Agent</span>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Quick actions buttons */}
          {messages.length === 0 && (
            <div className="px-3 py-2">
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-2 py-1 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                  onClick={() => handleQuickAction("Buy 500 USD worth of BTC")}
                >
                  Buy 500 USD worth of BTC
                </button>
                <button
                  className="px-2 py-1 bg-[#1E2026] hover:bg-gray-700 text-white text-xs rounded-full"
                  onClick={() => handleQuickAction("Set up Recurring Buy")}
                >
                  Set up Recurring Buy
                </button>
                <button
                  className="px-2 py-1 bg-[#1E2026] hover:bg-gray-700 text-white text-xs rounded-full"
                  onClick={() =>
                    handleQuickAction("Show me a newly listed project")
                  }
                >
                  Show me a newly listed project
                </button>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.length > 0 && (
            <div className="flex-1 px-3 py-2 overflow-y-auto binance-scrollbar">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {message.specialUI === "confirmation" ? (
                    <div className="inline-block bg-black p-2 rounded-lg border border-binance-yellow text-white text-xs">
                      <div className="text-left">
                        <div className="mb-1">
                          <span className="text-binance-yellow">Price:</span>{" "}
                          {message.data?.price} USDT
                        </div>
                        <div className="mb-1">
                          <span className="text-binance-yellow">Amount:</span>{" "}
                          {message.data?.buyAmount} BTC
                        </div>
                        <div className="mb-2">
                          <span className="text-binance-yellow">Total:</span>{" "}
                          {message.data?.buyTotal} USDT
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
                            message.data?.buttonPressed === "Cancel"
                              ? "bg-binance-yellow text-black border-binance-yellow"
                              : "bg-black text-white border-binance-yellow hover:bg-[#1E2026]"
                          }`}
                          onClick={() =>
                            message.data?.buttonPressed
                              ? null
                              : handleOptionClick("Cancel")
                          }
                          disabled={message.data?.buttonPressed !== undefined}
                        >
                          Cancel
                        </button>
                        <button
                          className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
                            message.data?.buttonPressed === "Review"
                              ? "bg-binance-yellow text-black border-binance-yellow"
                              : "bg-black text-white border-binance-yellow hover:bg-[#1E2026]"
                          }`}
                          onClick={() =>
                            message.data?.buttonPressed
                              ? null
                              : handleOptionClick("Review")
                          }
                          disabled={message.data?.buttonPressed !== undefined}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ) : message.sender === "user" ? (
                    <div className="bg-[#242731] text-white p-2 rounded-2xl inline-block max-w-[180px] text-xs">
                      {message.text}
                    </div>
                  ) : (
                    <div className="text-white max-w-[220px] text-xs">{message.text}</div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2 mb-3">
                  <div className="bg-gray-800 text-white p-1 rounded-lg flex items-center">
                    <span className="animate-pulse text-xs">●</span>
                    <span className="animate-pulse delay-100 mx-1 text-xs">●</span>
                    <span className="animate-pulse delay-200 text-xs">●</span>
                  </div>
                </div>
              )}

              {/* Options buttons */}
              {(showOptions.type === "purchase" ||
                showOptions.type === "currency" ||
                showOptions.type === "orderType") &&
                showOptions.options && (
                  <div className="flex gap-1 flex-wrap mb-3 mt-2">
                    {showOptions.options.map((option, idx) => (
                      <button
                        key={idx}
                        className="px-2 py-1 bg-black text-white text-xs font-medium rounded-lg border border-binance-yellow hover:bg-[#1E2026] transition-colors"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="px-3 py-2 border-t border-gray-800">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  messages.length > 0
                    ? "Ask anything"
                    : "Buy 500 USD worth of BTC"
                }
                className="w-full bg-[#1E2026] text-white text-xs px-3 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-binance-yellow"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`ml-2 px-3 py-1 ${
                  isLoading || !inputValue.trim()
                    ? "bg-gray-600 text-gray-400"
                    : "bg-binance-yellow text-black hover:bg-yellow-400"
                } rounded-full text-xs font-bold`}
              >
                Send
              </button>
            </div>
          </div>
          
          {/* Resize handle */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeStart}
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(252,213,53,0.8) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
              backgroundPosition: 'bottom right',
              bottom: '3px',
              right: '3px'
            }}
          />
        </div>
      </div>
    );
  } else {
    // Modal style with animation (for other pages)
    return (
      <div className="fixed inset-0 flex items-start justify-center pt-24 z-50">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        ></div>

        {/* Modal with animation */}
        <div className={`bg-black border-2 border-binance-yellow rounded-3xl w-[690px] z-10 relative overflow-hidden ${isExiting ? 'modal-exit' : 'modal-enter'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-2">
              <img src="/binance-logo.png" alt="Logo" className="h-7" />
              <span className="text-white text-xl font-bold">Agent</span>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Quick actions buttons */}
          {messages.length === 0 && (
            <div className="px-5 pb-5">
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                  onClick={() => handleQuickAction("Buy 500 USD worth of BTC")}
                >
                  Buy 500 USD worth of BTC
                </button>
                <button
                  className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                  onClick={() => handleQuickAction("Set up Recurring Buy")}
                >
                  Set up Recurring Buy
                </button>
                <button
                  className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                  onClick={() =>
                    handleQuickAction("Show me a newly listed project")
                  }
                >
                  Show me a newly listed project
                </button>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.length > 0 && (
            <div className="px-[30px] pb-5 h-64 overflow-y-auto binance-scrollbar">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {message.specialUI === "confirmation" ? (
                    <div className="inline-block bg-black p-3 rounded-lg border border-binance-yellow text-white text-sm">
                      <div className="text-left">
                        <div className="mb-1">
                          <span className="text-binance-yellow">Price:</span>{" "}
                          {message.data?.price} USDT
                        </div>
                        <div className="mb-1">
                          <span className="text-binance-yellow">Amount:</span>{" "}
                          {message.data?.buyAmount} BTC
                        </div>
                        <div className="mb-2">
                          <span className="text-binance-yellow">Total:</span>{" "}
                          {message.data?.buyTotal} USDT
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                            message.data?.buttonPressed === "Cancel"
                              ? "bg-binance-yellow text-black border-binance-yellow"
                              : "bg-black text-white border-binance-yellow hover:bg-[#1E2026]"
                          }`}
                          onClick={() =>
                            message.data?.buttonPressed
                              ? null
                              : handleOptionClick("Cancel")
                          }
                          disabled={message.data?.buttonPressed !== undefined}
                        >
                          Cancel
                        </button>
                        <button
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                            message.data?.buttonPressed === "Review"
                              ? "bg-binance-yellow text-black border-binance-yellow"
                              : "bg-black text-white border-binance-yellow hover:bg-[#1E2026]"
                          }`}
                          onClick={() =>
                            message.data?.buttonPressed
                              ? null
                              : handleOptionClick("Review")
                          }
                          disabled={message.data?.buttonPressed !== undefined}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ) : message.sender === "user" ? (
                    <div className="bg-[#242731] text-white p-3 rounded-2xl inline-block max-w-[280px]">
                      {message.text}
                    </div>
                  ) : (
                    <div className="text-white max-w-xs">{message.text}</div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-gray-800 text-white p-2 rounded-lg flex items-center">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-100 mx-1">●</span>
                    <span className="animate-pulse delay-200">●</span>
                  </div>
                </div>
              )}

              {/* Options buttons */}
              {(showOptions.type === "purchase" ||
                showOptions.type === "currency" ||
                showOptions.type === "orderType") &&
                showOptions.options && (
                  <div className="flex gap-3 mb-4 mt-2">
                    {showOptions.options.map((option, idx) => (
                      <button
                        key={idx}
                        className="px-5 py-2 min-w-[90px] bg-black text-white text-sm font-medium rounded-lg border border-binance-yellow hover:bg-[#1E2026] transition-colors"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="px-[30px] pb-5">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  messages.length > 0
                    ? "Ask anything"
                    : "Buy 500 USD worth of BTC"
                }
                className="w-full bg-[#1E2026] text-white text-sm px-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-binance-yellow"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`ml-2 px-6 py-3 ${
                  isLoading || !inputValue.trim()
                    ? "bg-gray-600 text-gray-400"
                    : "bg-binance-yellow text-black hover:bg-yellow-400"
                } rounded-full text-sm font-bold`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Agent;
