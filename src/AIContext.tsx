import React, { createContext, useState, useContext, useEffect } from "react";

// Message interface for chat messages
export interface Message {
  sender: "user" | "agent";
  text: string;
  specialUI?: "confirmation" | "success";
  data?: {
    price?: string;
    buyAmount?: string;
    buyTotal?: string;
    buttonPressed?: "Cancel" | "Execute Trade" | "Review" | null;
  };
}

// Options interface for chat options
export interface ChatOptions {
  type: "purchase" | "currency" | "orderType" | "confirmation" | "success" | null;
  options?: string[];
  coin?: string;
  amount?: string;
  price?: string;
  total?: string;
}

// Purchase state interface
export interface PurchaseState {
  // Buy side
  buyPrice: string;
  buyAmount: string;
  buyTotal: string;
  buySliderValue: number;
  // Sell side
  sellPrice: string;
  sellAmount: string;
  sellTotal: string;
  sellSliderValue: number;
  // Shared
  orderType: "limit" | "market" | "stop-limit";
}

interface AIContextType {
  isIqOpen: boolean;
  setIsIqOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAgentOpen: boolean;
  setIsAgentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showOptions: ChatOptions;
  setShowOptions: React.Dispatch<React.SetStateAction<ChatOptions>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigatedFromCurrency: boolean;
  setNavigatedFromCurrency: React.Dispatch<React.SetStateAction<boolean>>;
  // Purchase page state
  purchaseState: PurchaseState;
  setPurchaseState: React.Dispatch<React.SetStateAction<PurchaseState>>;
  // Highlight buy button flag
  highlightBuyButton: boolean;
  setHighlightBuyButton: React.Dispatch<React.SetStateAction<boolean>>;
  // Highlight input fields flags
  highlightTotalInput: boolean;
  setHighlightTotalInput: React.Dispatch<React.SetStateAction<boolean>>;
  highlightPriceInput: boolean;
  setHighlightPriceInput: React.Dispatch<React.SetStateAction<boolean>>;
  highlightAmountInput: boolean;
  setHighlightAmountInput: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context with a default value matching the expected shape
export const IQContext = createContext<AIContextType>({
  isIqOpen: false,
  setIsIqOpen: () => {},
  isAgentOpen: false,
  setIsAgentOpen: () => {},
  messages: [],
  setMessages: () => {},
  showOptions: { type: null },
  setShowOptions: () => {},
  isLoading: false,
  setIsLoading: () => {},
  navigatedFromCurrency: false,
  setNavigatedFromCurrency: () => {},
  purchaseState: {
    buyPrice: "81863.98",
    buyAmount: "0.00000",
    buyTotal: "0",
    buySliderValue: 0,
    sellPrice: "81863.98",
    sellAmount: "0.00000",
    sellTotal: "0",
    sellSliderValue: 0,
    orderType: "limit",
  },
  setPurchaseState: () => {},
  highlightBuyButton: false,
  setHighlightBuyButton: () => {},
  highlightTotalInput: false,
  setHighlightTotalInput: () => {},
  highlightPriceInput: false,
  setHighlightPriceInput: () => {},
  highlightAmountInput: false,
  setHighlightAmountInput: () => {},
});

interface AIProviderProps {
  children: React.ReactNode;
}

export const AIProvider = ({ children }: AIProviderProps) => {
  const [isIqOpen, setIsIqOpen] = useState<boolean>(false);
  const [isAgentOpen, setIsAgentOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showOptions, setShowOptions] = useState<ChatOptions>({ type: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [navigatedFromCurrency, setNavigatedFromCurrency] = useState<boolean>(false);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    buyPrice: "81863.98",
    buyAmount: "0.00000",
    buyTotal: "0",
    buySliderValue: 0,
    sellPrice: "81863.98",
    sellAmount: "0.00000",
    sellTotal: "0",
    sellSliderValue: 0,
    orderType: "limit",
  });
  const [highlightBuyButton, setHighlightBuyButton] = useState<boolean>(false);
  const [highlightTotalInput, setHighlightTotalInput] = useState<boolean>(false);
  const [highlightPriceInput, setHighlightPriceInput] = useState<boolean>(false);
  const [highlightAmountInput, setHighlightAmountInput] = useState<boolean>(false);

  // Only one can be open at a time
  useEffect(() => {
    if (isIqOpen) {
      setIsAgentOpen(false);
    }
  }, [isIqOpen]);

  useEffect(() => {
    if (isAgentOpen) {
      setIsIqOpen(false);
    }
  }, [isAgentOpen]);

  return (
    <IQContext.Provider
      value={{
        isIqOpen,
        setIsIqOpen,
        isAgentOpen,
        setIsAgentOpen,
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
        highlightBuyButton,
        setHighlightBuyButton,
        highlightTotalInput,
        setHighlightTotalInput,
        highlightPriceInput,
        setHighlightPriceInput,
        highlightAmountInput,
        setHighlightAmountInput,
      }}
    >
      {children}
    </IQContext.Provider>
  );
};

export const useIQContext = () => useContext(IQContext);
