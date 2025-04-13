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
  WCT: "The native token of WCT, a Binance Smart Chain-based project.",
  "Where to participate in WCT Launchpool?":
    "The WCT Launchpool is available on the Binance Smart Chain (BSC) network. Visit the page here <a style='color: #FFD700; text-decoration: underline;' href='/launchpool'>here</a>.",
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
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);
  const hasFetchedSummary = React.useRef(false);
  const hasFetchedSuggestions = React.useRef(false);

  // Fetch summary on mount
  useEffect(() => {
    const fetchSummary = async () => {
      if (!context) return;

      // Always set loading state first
      setIsLoading(true);

      try {
        // Check if we have a predefined summary
        if (summaryDictionary[context]) {
          // Simulate loading with setTimeout - reduced to 0.5 seconds
          await new Promise(resolve => setTimeout(resolve, 500));
          setSummary(summaryDictionary[context]);
        } else {
          // Fetch from service
          const query = `Please provide a brief summary about: ${context}. Limit your response to 10 words.`;
          const summaryResponse = await chatService.sendMessage(query);
          setSummary(summaryResponse);
        }
      } catch (error) {
        setSummary("Sorry, I couldn't generate a summary for this selection.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasFetchedSummary.current) {
      fetchSummary();
      hasFetchedSummary.current = true;
    }
  }, [context]);

  // Fetch suggested questions after summary is loaded
  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      // Exit if summary is not loaded yet
      if (summary === null) return;
      
      // Always set loading state for suggestions
      setIsSuggestionsLoading(true);
      
      try {
        // Always add a loading delay for ALL contexts including Launchpool
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For non-Launchpool contexts, fetch dynamic suggestions if we haven't already
        if (context !== "Launchpool" && !hasFetchedSuggestions.current) {
          const query = `Based on the topic "${context}", generate 3 short, specific questions of 3 words each a user might want to ask. Format as a JSON array of strings only, no explanations. Each question should be under 40 characters. Return only the JSON array, no markdown formatting.`;
          const response = await chatService.sendMessage(query);

          // Process the response to extract JSON
          let jsonString = response;

          // Check if response has markdown code block formatting
          if (response.includes("```")) {
            // Extract content between code block markers
            const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
              jsonString = codeBlockMatch[1].trim();
            }
          }

          // Try to parse the JSON
          try {
            const parsedQuestions = JSON.parse(jsonString);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              setSuggestedQuestions(parsedQuestions.slice(0, 3));
            } else {
              // Fallback if not valid array
              setSuggestedQuestions([
                `What is ${context}?`,
                `How to use ${context}?`,
                `${context} benefits?`,
              ]);
            }
          } catch (parseError) {
            // If can't parse as JSON, try to extract questions another way
            const questions = response
              .split(/\d+\.\s+/)
              .filter((q) => q.trim().length > 0)
              .slice(0, 3);

            if (questions.length > 0) {
              setSuggestedQuestions(questions);
            } else {
              setSuggestedQuestions([
                `What is ${context}?`,
                `How to use ${context}?`,
                `${context} benefits?`,
              ]);
            }
          }
          
          hasFetchedSuggestions.current = true;
        }
        // For Launchpool, we just wait the delay before setting isSuggestionsLoading to false
        // No need to set any suggestions as they're hardcoded in the render function
      } catch (error) {
        setSuggestedQuestions([
          `What is ${context}?`,
          `How to use ${context}?`,
          `${context} benefits?`,
        ]);
      } finally {
        // Always set loading to false after the delay, regardless of context
        setIsSuggestionsLoading(false);
      }
    };

    fetchSuggestedQuestions();
  }, [context, summary]);

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
        const willOverflowRight =
          position.x + chatWindowWidth + minMargin > windowWidth;

        // Check if there's enough space at the top (when using transform: translateY(-100%))
        const willOverflowTop = position.y - chatWindowHeight - minMargin < 0;

        // Check if position is below selected text (y value is at the bottom of selection)
        // This helps us identify when we should render below the text
        const isBelowSelection = position.y > 200 && position.y < window.scrollY + 250;

        setAlignRight(willOverflowRight);
        setAlignBottom(willOverflowTop || isBelowSelection);
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

    const lowerCaseMessage = messageToSend.toLowerCase();
    const summaryKey = Object.keys(summaryDictionary).find(
      (key) => key.toLowerCase() === lowerCaseMessage
    );

    if (!messageToSend.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        source: "user",
        content: messageToSend,
      },
    ]);

    // Clear input field
    setTextInput("");

    // Set loading state
    setIsLoading(true);

    try {
      if (summaryKey) {
        // Add a 0.5 second delay for hardcoded responses
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            source: "agent",
            content: summaryDictionary[summaryKey],
          },
        ]);
        setIsLoading(false);
        return;
      }
      // Get response from backend
      const response = await chatService.sendMessage(messageToSend);

      // Add agent response
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          source: "agent",
          content: response,
        },
      ]);
    } catch (error) {
      // Add error message if API call fails
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          source: "agent",
          content:
            "Sorry, I'm having trouble connecting to the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!position || !offsetPosition) return null;

  // Create the style object with proper typing
  const style: ChatWindowStyle = {
    width: "400px",
    height: messages.length > 0 ? "400px" : "300px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
    // When positioned below text, don't move it up from the bottom edge
    style.top = `${offsetPosition.y}px`;
    style.bottom = "auto";
    style.transform = "none"; // No transform needed when positioning below
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
            <span className="text-white text-xl font-bold">IQ</span>
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
          {/* Summary or Loading State */}
          <div className="text-white text-base mb-4">
            {isLoading && summary === null ? (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-800 text-white p-1 rounded-lg flex items-center">
                  <span className="animate-pulse text-sm">●</span>
                  <span className="animate-pulse delay-100 mx-1 text-sm">
                    ●
                  </span>
                  <span className="animate-pulse delay-200 text-sm">●</span>
                </div>
              </div>
            ) : (
              summary || `No summary available for "${context}"`
            )}
          </div>

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full mb-4 ${
                message.source === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.source === "user" ? (
                <div className="bg-[#242731] text-white p-3 rounded-2xl inline-block max-w-[220px]">
                  {message.content}
                </div>
              ) : (
                <div
                  className="text-white max-w-xs"
                  dangerouslySetInnerHTML={{
                    __html: message.content,
                  }}
                >                  
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator for message responses */}
          {isLoading && messages.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-gray-800 text-white p-1 rounded-lg flex items-center">
                <span className="animate-pulse text-sm">●</span>
                <span className="animate-pulse delay-100 mx-1 text-sm">●</span>
                <span className="animate-pulse delay-200 text-sm">●</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Tags - Only show when messages.length === 0 */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {isSuggestionsLoading ? (
              // Loading state for ALL suggestion types (always check loading first)
              <>
                <div className="px-4 py-2 bg-[#1E2026] text-gray-500 text-sm rounded-full flex items-center">
                  <span className="animate-pulse text-sm">●</span>
                  <span className="animate-pulse delay-100 mx-1 text-sm">●</span>
                  <span className="animate-pulse delay-200 text-sm">●</span>
                </div>
                <div className="px-4 py-2 bg-[#1E2026] text-gray-500 text-sm rounded-full flex items-center">
                  <span className="animate-pulse text-sm">●</span>
                  <span className="animate-pulse delay-100 mx-1 text-sm">●</span>
                  <span className="animate-pulse delay-200 text-sm">●</span>
                </div>
                <div className="px-4 py-2 bg-[#1E2026] text-gray-500 text-sm rounded-full flex items-center">
                  <span className="animate-pulse text-sm">●</span>
                  <span className="animate-pulse delay-100 mx-1 text-sm">●</span>
                  <span className="animate-pulse delay-200 text-sm">●</span>
                </div>
              </>
            ) : context === "Launchpool" ? (
              // Hardcoded questions for Launchpool - show only when not loading
              <>
                <button
                  onClick={() =>
                    handleSendMessage("Where to participate in WCT Launchpool?")
                  }
                  className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                >
                  Where to participate in WCT Launchpool?
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
              </>
            ) : (
              // Dynamically generated questions
              suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="px-4 py-2 bg-[#1E2026] hover:bg-gray-700 text-white text-sm rounded-full"
                >
                  {question}
                </button>
              ))
            )}
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
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-6 py-3 ${
              isLoading || !textInput.trim()
                ? "bg-gray-600 text-gray-400"
                : "bg-binance-yellow text-black hover:bg-yellow-400"
            } rounded-full text-sm font-bold`}
            disabled={isLoading || !textInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
