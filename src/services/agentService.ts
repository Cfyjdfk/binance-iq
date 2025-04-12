import axios from 'axios';

// Types
export interface AgentResponse {
  text: string;
  options?: {
    type: 'purchase' | 'currency' | 'orderType' | 'confirmation' | 'success' | null;
    choices?: string[];
    data?: {
      coin?: string;
      amount?: string;
      price?: string;
    };
  };
}

// Mock data for different response types
const mockResponses: Record<string, AgentResponse> = {
  BTC_PURCHASE: {
    text: "Sure! I just checked your wallet and you have sufficient amounts of USDC and USDT to perform this transaction. Do you want to use USDC or USDT?",
    options: {
      type: 'purchase',
      choices: ['USDC', 'USDT'],
      data: {
        coin: 'BTC',
        amount: '500'
      }
    }
  },
  TRUMPCOIN_NOT_FOUND: {
    text: "Sorry, Binance doesn't have TRUMPCOIN listed in any market. Would you like to explore something else?",
    options: {
      type: 'currency',
      choices: ['BNB', 'USDT']
    }
  },
  PAYMENT_SELECTED: {
    text: "Awesome! Let me take you there right now.\n\nI'm assuming you want to trade on the Spot market. Would you want to make a Limit or Market order?",
    options: {
      type: 'orderType',
      choices: ['Limit', 'Market']
    }
  },
  ORDER_CONFIRMATION: {
    text: "Okay! I've filled in a suggested limit price based on market data, and entered 500 USDT as the total. Please review:",
    options: {
      type: 'confirmation',
      data: {
        price: '81863.98',
        coin: 'BTC',
        amount: '0.0061'
      }
    }
  },
  ORDER_SUCCESS: {
    text: "Congratulations! Your order is filled and you are now a proud owner of 0.006 BTC!",
    options: {
      type: 'success'
    }
  }
};

const agentService = {
  async processMessage(message: string): Promise<AgentResponse> {
    // In a real app, this would call an API endpoint
    // For demo purposes, we'll simulate responses based on the message content
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate response based on message content
    if (message.toLowerCase().includes('buy') && message.toLowerCase().includes('bitcoin') || 
        message.toLowerCase().includes('buy') && message.toLowerCase().includes('btc')) {
      return mockResponses.BTC_PURCHASE;
    }
    
    if (message.toLowerCase().includes('trumpcoin')) {
      return mockResponses.TRUMPCOIN_NOT_FOUND;
    }
    
    if (message.toLowerCase() === 'usdc' || message.toLowerCase() === 'usdt') {
      return mockResponses.PAYMENT_SELECTED;
    }
    
    if (message.toLowerCase() === 'limit' || message.toLowerCase() === 'market') {
      return mockResponses.ORDER_CONFIRMATION;
    }
    
    if (message.toLowerCase() === 'execute trade') {
      return mockResponses.ORDER_SUCCESS;
    }
    
    // Default fallback response
    return {
      text: "I'm not sure how to help with that. Would you like to know about Binance's trading features or current crypto prices?",
      options: {
        type: null
      }
    };
  }
};

export default agentService; 