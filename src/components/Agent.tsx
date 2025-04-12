import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import agentService from '../services/agentService';

// Import styles
import './scrollbar.css';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  specialUI?: 'confirmation' | 'success';
  data?: {
    price?: string;
    amount?: string;
    total?: string;
    buttonPressed?: 'Cancel' | 'Execute Trade' | null;
  };
}

interface AgentProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info', subtitle?: string) => void;
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
    total?: string;
  }>({ type: null });
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus the input field
      inputRef.current.focus();
      
      // Reset state when reopening with empty messages
      if (messages.length === 0) {
        setMessages([]);
        setInputValue('');
        setShowOptions({ type: null });
      } 
      // Scroll to bottom when reopening with existing messages
      else if (messagesEndRef.current) {
        // Use setTimeout to ensure DOM is fully updated before scrolling
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isOpen, messages.length]);

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
        if (response.options.type === 'confirmation') {
          // Add confirmation UI as a message
          const price = response.options.data?.price || '81863.98';
          const amount = response.options.data?.amount || '0.00610';
          const total = '500'; // Default value

          setMessages(prev => [...prev, {
            sender: 'agent',
            text: 'Please confirm your order:',
            specialUI: 'confirmation',
            data: {
              price,
              amount,
              total
            }
          }]);
        } else {
          setShowOptions({
            type: response.options.type || null,
            options: response.options.choices,
            coin: response.options.data?.coin,
            amount: response.options.data?.amount,
            price: response.options.data?.price
          });
        }
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
    // Directly call handleSendMessage with the action
    const userMessage: Message = {
      sender: 'user',
      text: action
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowOptions({ type: null });

    try {
      // Use immediate invocation of async function
      (async () => {
        try {
          const response = await agentService.processMessage(userMessage.text);
          
          const agentMessage: Message = {
            sender: 'agent',
            text: response.text
          };
          
          setMessages(prev => [...prev, agentMessage]);
          
          if (response.options) {
            if (response.options.type === 'confirmation') {
              // Add confirmation UI as a message
              const price = response.options.data?.price || '81863.98';
              const amount = response.options.data?.amount || '0.00610';
              const total = '500'; // Default value

              setMessages(prev => [...prev, {
                sender: 'agent',
                text: 'Please confirm your order:',
                specialUI: 'confirmation',
                data: {
                  price,
                  amount,
                  total
                }
              }]);
            } else {
              setShowOptions({
                type: response.options.type || null,
                options: response.options.choices,
                coin: response.options.data?.coin,
                amount: response.options.data?.amount,
                price: response.options.data?.price
              });
            }
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
      })();
    } catch (error) {
      console.error('Error in handleQuickAction:', error);
      setIsLoading(false);
    }
  };

  const handleOptionClick = async (option: string) => {
    const userMessage: Message = {
      sender: 'user',
      text: option
    };
    
    // Only hide non-confirmation options
    if (showOptions.type !== 'confirmation') {
      setShowOptions({ type: null });
    }
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Mark the button as pressed in the confirmation UI
    if (option === 'Cancel' || option === 'Execute Trade') {
      setMessages(prev => 
        prev.map(msg => {
          if (msg.specialUI === 'confirmation') {
            return {
              ...msg,
              data: {
                ...msg.data,
                buttonPressed: option as 'Cancel' | 'Execute Trade'
              }
            };
          }
          return msg;
        })
      );
    }
    
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
        
        // Show toast notification with subtitle
        if (showToast) {
          showToast(
            'Limit Sell Order Partially Filled', 
            'success',
            'Partially filled exchange limit sell order for 66 BTC by using USDT'
          );
        }
        
        // Remove the automatic window close
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
          // Don't add another confirmation UI if we're already showing one
          if (response.options.type === 'confirmation') {
            const price = response.options.data?.price || '81863.98';
            const amount = response.options.data?.amount || '0.00610';
            const total = '500'; // Default value

            setMessages(prev => [...prev, {
              sender: 'agent',
              text: 'Please confirm your order:',
              specialUI: 'confirmation',
              data: {
                price,
                amount,
                total
              }
            }]);
          } else {
            setShowOptions({
              type: response.options.type || null,
              options: response.options.choices,
              coin: response.options.data?.coin,
              amount: response.options.data?.amount,
              price: response.options.data?.price
            });
          }
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
                onClick={() => handleQuickAction("Show me a newly listed project")}
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
              <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {message.specialUI === 'confirmation' ? (
                  <div className="inline-block bg-black p-3 rounded-lg border border-binance-yellow text-white text-sm">
                    <div className="text-left">
                      <div className="mb-1">
                        <span className="text-binance-yellow">Price:</span> {message.data?.price} USDT
                      </div>
                      <div className="mb-1">
                        <span className="text-binance-yellow">Amount:</span> {message.data?.amount} BTC
                      </div>
                      <div className="mb-2">
                        <span className="text-binance-yellow">Total:</span> {message.data?.total} USDT
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                          message.data?.buttonPressed === 'Cancel'
                            ? 'bg-binance-yellow text-black border-binance-yellow'
                            : 'bg-black text-white border-binance-yellow hover:bg-[#1E2026]'
                        }`}
                        onClick={() => message.data?.buttonPressed ? null : handleOptionClick('Cancel')}
                        disabled={message.data?.buttonPressed !== undefined}
                      >
                        Cancel
                      </button>
                      <button 
                        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                          message.data?.buttonPressed === 'Execute Trade'
                            ? 'bg-binance-yellow text-black border-binance-yellow'
                            : 'bg-black text-white border-binance-yellow hover:bg-[#1E2026]'
                        }`}
                        onClick={() => message.data?.buttonPressed ? null : handleOptionClick('Execute Trade')}
                        disabled={message.data?.buttonPressed !== undefined}
                      >
                        Execute Trade
                      </button>
                    </div>
                  </div>
                ) : message.sender === 'user' ? (
                  <div className="bg-[#242731] text-white p-3 rounded-2xl inline-block max-w-[220px]">
                    {message.text}
                  </div>
                ) : (
                  <div className="text-white max-w-xs">
                    {message.text}
                  </div>
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
            {(showOptions.type === 'purchase' || showOptions.type === 'currency' || showOptions.type === 'orderType') && showOptions.options && (
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
              placeholder={messages.length > 0 ? "Ask anything" : "Buy 500 USD worth of BTC"}
              className="w-full bg-[#1E2026] text-white text-sm px-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-binance-yellow"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`ml-2 px-6 py-3 ${
                isLoading || !inputValue.trim()
                  ? 'bg-gray-600 text-gray-400' 
                  : 'bg-binance-yellow text-black hover:bg-yellow-400'
              } rounded-full text-sm font-bold`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent; 