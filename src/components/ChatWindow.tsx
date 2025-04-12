import React, { useEffect, useRef, useState } from "react";
import { chatService } from "../services/api";

interface ChatWindowProps {
  context: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

interface Message {
  source: "user" | "agent";
  content: string;
}

interface ChatWindowStyle extends React.CSSProperties {
  top?: string;
  bottom?: string;
  width: string;
  height: string;
  boxShadow: string;
  left?: string;
  right?: string;
  transform?: string;
}

const summaryDictionary: Record<string, string> = {
  Launchpool:
    "A platform where users stake crypto to earn new tokens before listing on Binance.",
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [alignRight, setAlignRight] = useState(false);
  const [alignBottom, setAlignBottom] = useState(false);

  // Update position when scrolling to keep anchored to selection
  useEffect(() => {
    if (!position) return;

    const handlePositioning = () => {
      if (position) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const chatWindowWidth = 400; // Width of our chat window
        const chatWindowHeight = messages.length > 0 ? 400 : 250; // Height of our chat window
        const minMargin = 20; // Minimum margin from edge

        // Check if there's enough space on the right
        const willOverflowRight = position.x + chatWindowWidth + minMargin > windowWidth;

        // Check if there's enough space at the top (when using transform: translateY(-100%))
        const willOverflowTop = position.y - chatWindowHeight - minMargin < 0;

        setAlignRight(willOverflowRight);
        setAlignBottom(willOverflowTop);
        setOffsetPosition({
          x: position.x,
          y: position.y,
        });
      }
    };

    // Set initial position
    handlePositioning();

    // Listen for scroll and resize events
    window.addEventListener("scroll", handlePositioning);
    window.addEventListener("resize", handlePositioning);

    return () => {
      window.removeEventListener("scroll", handlePositioning);
      window.removeEventListener("resize", handlePositioning);
    };
  }, [position, messages.length]);

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

  const handleSendMessage = async (overrideText?: string) => {
    const messageToSend = overrideText || textInput;

    if (!messageToSend.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        source: "user",
        content: messageToSend,
      }
    ]);

    // Clear input field
    setTextInput("");

    try {
      // Get response from backend
      const response = await chatService.sendMessage(messageToSend);

      // Add agent response
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          source: "agent",
          content: response,
        }
      ]);
    } catch (error) {
      // Add error message if API call fails
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          source: "agent",
          content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        }
      ]);
    }
  };

  if (!position || !offsetPosition) return null;

  // Create the style object with proper typing
  const style: ChatWindowStyle = {
    width: "400px",
    height: messages.length > 0 ? "400px" : "300px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  };

  // Handle horizontal positioning
  if (alignRight) {
    style.right = "40px";
    style.left = "auto";
  } else {
    style.left = `${offsetPosition.x}px`;
    style.right = "auto";
  }

  // Handle vertical positioning
  if (alignBottom) {
    style.bottom = `${window.innerHeight - offsetPosition.y + 10}px`;
    style.top = "auto";
    style.transform = "none"; // No transform needed when positioning from bottom
  } else {
    style.top = `${offsetPosition.y - 10}px`;
    style.bottom = "auto";
    style.transform = "translateY(-100%)"; // Move up by 100% of height
  }

  return (
    <div
      ref={windowRef}
      className="absolute bg-binance-dark px-[30px] py-[20px] text-white rounded-[25px] shadow-xl z-[9999] border border-binance-yellow transition-all duration-300 ease-in-out"
      style={style}
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

        {/* Scrollable Content Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scroll-smooth"
        >
          <div className="text-white text-base mb-4">
            {summaryDictionary[context] ||
              `No summary available for "${context}"`}
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full mb-4 ${message.source === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {message.source === "user" ? (
                <div className="bg-[#242731] text-white p-3 rounded-2xl inline-block max-w-[220px]">
                  {message.content}
                </div>
              ) : (
                <div className="text-white max-w-xs">
                  {message.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Suggestion Tags - Only show when messages.length === 0 */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => handleSendMessage("Where to buy?")}
              className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
            >
              Where to buy?
            </button>
            <button
              onClick={() => handleSendMessage("How much is the earnings?")}
              className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
            >
              How much is the earnings?
            </button>
            <button
              onClick={() => handleSendMessage("WCT?")}
              className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
            >
              WCT
            </button>
          </div>
        )}

        {/* Fixed Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex flex-row w-full gap-2 items-center text-sm mt-auto shrink-0"
        >
          <input
            ref={inputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ask a follow up question"
            className="w-full bg-[#1E2026] text-white text-sm px-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-binance-yellow"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-binance-yellow text-black hover:bg-yellow-400 rounded-full text-sm font-bold"
            disabled={!textInput}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
