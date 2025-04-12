import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import agentService from '../services/agentService';

// Import styles
import './scrollbar.css';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

interface AgentProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Agent: React.FC<AgentProps> = ({ isOpen, onClose, showToast }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState<{
    type: 'purchase' | 'currency' | 'orderType' | 'confirmation' | 'success' | null;
    options?: string[];
    coin?: string;
    amount?: string;
    price?: string;
  }>({ type: null });
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      
      // Reset state when reopening
      if (messages.length === 0) {
        setMessages([]);
        setInputValue('');
        setShowOptions({ type: null });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowOptions({ type: null });

    try {
      const response = await agentService.processMessage(userMessage.text);
      
      const agentMessage: Message = {
        sender: 'agent',
        text: response.text
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      if (response.options) {
        setShowOptions({
          type: response.options.type || null,
          options: response.options.choices,
          coin: response.options.data?.coin,
          amount: response.options.data?.amount,
          price: response.options.data?.price
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      setMessages(prev => [
        ...prev,
        { 
          sender: 'agent', 
          text: 'Sorry, I encountered an error processing your request. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  const handleOptionClick = async (option: string) => {
    const userMessage: Message = {
      sender: 'user',
      text: option
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Special handling for Execute Trade
    if (option === 'Execute Trade') {
      setTimeout(() => {
        const agentMessage: Message = {
          sender: 'agent',
          text: 'Congratulations! Your order is filled and you are now a proud owner of 0.006 BTC!'
        };
        
        setMessages(prev => [...prev, agentMessage]);
        setShowOptions({ type: 'success' });
        setIsLoading(false);
        
        // Show toast notification
        if (showToast) {
          showToast('Trade executed successfully! You purchased 0.006 BTC.', 'success');
        }
        
        // Close modal after delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 1000);
      
      return;
    }
    
    setTimeout(async () => {
      try {
        const response = await agentService.processMessage(option);
        
        const agentMessage: Message = {
          sender: 'agent',
          text: response.text
        };
        
        setMessages(prev => [...prev, agentMessage]);
        
        if (response.options) {
          setShowOptions({
            type: response.options.type || null,
            options: response.options.choices,
            coin: response.options.data?.coin,
            amount: response.options.data?.amount,
            price: response.options.data?.price
          });
        } else {
          setShowOptions({ type: null });
        }
      } catch (error) {
        console.error('Error processing option:', error);
        
        setMessages(prev => [
          ...prev,
          { 
            sender: 'agent', 
            text: 'Sorry, I encountered an error processing your selection. Please try again.' 
          }
        ]);
        setShowOptions({ type: null });
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const resetConversation = () => {
    setMessages([]);
    setInputValue('');
    setShowOptions({ type: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-24 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-black border-2 border-binance-yellow rounded-3xl w-[690px] z-10 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center">
            <img src="/binance-logo.svg" alt="Logo" className="h-7" />
            <span className="text-white text-2xl font-medium ml-3">Agent Mode</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Quick actions buttons */}
        {messages.length === 0 && (
          <div className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                onClick={() => handleQuickAction("Set up Recurring Buy")}
              >
                Set up Recurring Buy
              </button>
              <button 
                className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                onClick={() => handleQuickAction("Buy 1.20 BNB")}
              >
                Buy 1.20 BNB
              </button>
              <button 
                className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                onClick={() => handleQuickAction("Show me a newly listed project")}
              >
                Show me a newly listed project
              </button>
            </div>
          </div>
        )}
        
        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="px-5 pb-5 h-64 overflow-y-auto binance-scrollbar">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs p-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-binance-yellow text-black' 
                    : 'bg-gray-800 text-white'
                }`}>
                  {message.text}
                </div>
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
            
            {/* Purchase confirmation UI */}
            {showOptions.type === 'confirmation' && (
              <div className="bg-gray-800 p-3 rounded-lg text-white text-xs mb-4">
                <div className="font-semibold text-binance-yellow mb-1">Price: 81863.98 USDT</div>
                <div className="font-semibold text-binance-yellow mb-1">Amount: 0.0061 BTC</div>
                <div className="font-semibold text-binance-yellow">Total: 500 USDT</div>
                <div className="flex gap-2 mt-3">
                  <button 
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                    onClick={() => handleOptionClick('Cancel')}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                    onClick={() => handleOptionClick('Execute Trade')}
                  >
                    Execute Trade
                  </button>
                </div>
              </div>
            )}
            
            {/* Options buttons */}
            {(showOptions.type === 'purchase' || showOptions.type === 'currency' || showOptions.type === 'orderType') && showOptions.options && (
              <div className="flex gap-2 mb-4">
                {showOptions.options.map((option, idx) => (
                  <button 
                    key={idx}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded border border-gray-700"
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
        <div className="px-5 pb-5">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={messages.length > 0 ? "Ask anything" : "I want to buy 500 USD worth of BTC"}
              className="w-full bg-[#1E2026] text-white text-sm px-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-binance-yellow"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 ${
                isLoading || !inputValue.trim()
                  ? 'bg-gray-600 text-gray-400' 
                  : 'bg-binance-yellow text-black hover:bg-yellow-400'
              } rounded-full text-sm font-medium`}
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent; 