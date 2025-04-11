import React, { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  context: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

const summaryDictionary: Record<string, string> = {
  Launchpool:
    "A platform where users stake crypto to earn new tokens before listing",
  Bitcoin: "The first and largest cryptocurrency by market cap",
  Ethereum: "A decentralized platform for smart contracts and DApps",
  BNB: "Binance's native cryptocurrency used for trading fee discounts",
  // Add more definitions as needed
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  context,
  position,
  onClose,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [offsetPosition, setOffsetPosition] = useState(position);
  const [messages, setMessages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");

  // Update position when scrolling to keep anchored to selection
  useEffect(() => {
    if (!position) return;

    const handleScroll = () => {
      if (position) {
        setOffsetPosition({
          x: position.x,
          y: position.y,
        });
      }
    };

    // Set initial position
    handleScroll();

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [position]);

  useEffect(() => {
    // Handler for clicks anywhere in the document
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click was outside the chat window
      if (
        windowRef.current &&
        !windowRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Add event listener when component mounts and chat window is open
    if (position) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener when component unmounts or chat window closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [position, onClose]);

  // Add new useEffect to handle auto-scrolling
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll whenever messages change

  // Add new useEffect for auto-focus
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [position]); // Focus when chat window opens (position changes from null)

  const handleSendMessage = () => {
    setMessages((prev) => [
      ...prev,
      "This is a sample response that will make the window grow taller...",
    ]);
  };

  if (!position || !offsetPosition) return null;

  return (
    <div
      ref={windowRef}
      className="absolute bg-binance-dark px-[30px] py-[20px] text-white rounded-[25px] shadow-xl z-[9999] border border-binance-yellow transition-[height] duration-300 ease-in-out"
      style={{
        top: `${offsetPosition.y - 10}px`,
        left: `${offsetPosition.x}px`,
        width: "400px",
        height: messages.length > 0 ? "400px" : "200px",
        transform: "translateY(-100%)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex flex-row justify-between items-start w-full mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/binance-logo.png"
              alt="Binance"
              className="w-[24px] h-[24px]"
            />
            IQ
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none hover:bg-[#2B2F36] rounded"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content Area - Added ref */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scroll-smooth"
        >
          <div className="text-white">
            {summaryDictionary[context] ||
              `No summary available for "${context}"`}
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className="text-gray-400 bg-light-gray p-3 rounded-[10px]"
            >
              {message}
            </div>
          ))}
        </div>

        {/* Fixed Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="flex flex-row w-full justify-between items-center text-sm mt-auto shrink-0"
        >
          <input
            ref={inputRef}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ask a follow up question"
            className="w-[80%] rounded-[10px] p-[10px] bg-binance-dark focus:outline-none border border-light-gray focus:border-gray"
          />
          <button
            type="submit"
            className="bg-binance-yellow text-binance-dark disabled:bg-binance-light-yellow rounded-[10px] p-[10px]"
            disabled={!textInput}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
