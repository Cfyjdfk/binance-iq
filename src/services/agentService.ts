import axios from 'axios';

// Types
export interface AgentResponse {
  text: string;
  options?: {
    type: 'purchase' | 'currency' | 'orderType' | 'confirmation' | 'success' | null;
    choices?: string[];
    data?: {
      coin?: string;
      buyAmount?: string;
      price?: string;
    };
  };
}

// Backend API URL
const API_URL = 'http://localhost:8000';

// Mock data for different response types
const mockResponses: Record<string, AgentResponse> = {
  BTC_PURCHASE: {
    text: "Sure! I just checked your wallet and you have sufficient amounts of USDC and USDT to perform this transaction. Do you want to use USDC or USDT?",
    options: {
      type: 'purchase',
      choices: ['USDC', 'USDT'],
      data: {
        coin: 'BTC',
        buyAmount: '500'
      }
    }
  },
  PICOIN_NOT_FOUND: {
    text: "Sorry, Binance doesn't have PICOIN listed in any market. Would you like to explore something else?",
    options: {
      type: 'currency',
      choices: ['BNB', 'BTC']
    }
  },
  PAYMENT_SELECTED: {
    text: "Awesome! Let me take you there right now.",
    options: {
      type: null
    }
  },
  ORDER_TYPE_PROMPT: {
    text: "I'm assuming you want to trade on the Spot market. Would you want to make a Limit or Market order?",
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
        buyAmount: '0.0061'
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

// Helper function to check if message is a buy order for BTC
const isBTCBuyMessage = (message: string): boolean => {
  const lowerMsg = message.toLowerCase();
  return (
    lowerMsg.includes('buy') && 
    (lowerMsg.includes('bitcoin') || lowerMsg.includes('btc')) &&
    (lowerMsg.includes('500') || lowerMsg.includes('usd') || lowerMsg.includes('worth'))
  );
};

const agentService = {
  async processMessage(message: string): Promise<AgentResponse> {
    // Handle specific case for orderType, used when navigated to purchase page
    if (message === "orderType") {
      return mockResponses.ORDER_TYPE_PROMPT;
    }
    
    // Handle the hardcoded flow for buying BTC
    if (isBTCBuyMessage(message)) {
      return mockResponses.BTC_PURCHASE;
    }
    
    if (message.toLowerCase().includes('picoin')) {
      return mockResponses.PICOIN_NOT_FOUND;
    }
    
    if (message.toLowerCase() === 'usdc' || message.toLowerCase() === 'usdt' || message.toLowerCase() === 'btc')  {
      return mockResponses.PAYMENT_SELECTED;
    }
    
    if (message.toLowerCase() === 'limit' || message.toLowerCase() === 'market') {
      return mockResponses.ORDER_CONFIRMATION;
    }
    
    if (message.toLowerCase() === 'execute trade') {
      return mockResponses.ORDER_SUCCESS;
    }
    
    // For all other queries, use the RAG backend
    try {
      const response = await axios.post(`${API_URL}/chat`, { message });
      return {
        text: response.data.response,
        options: {
          type: null
        }
      };
    } catch (error) {
      console.error("Error fetching from RAG backend:", error);
      // Fallback response in case of API failure
      return {
        text: "I'm having trouble connecting to my knowledge base. Would you like to try asking something else?",
        options: {
          type: null
        }
      };
    }
  }
};

export default agentService; 