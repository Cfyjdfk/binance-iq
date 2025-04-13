import React, { useState, useEffect, useRef, useContext } from "react";
import { ChatWindow } from "./ChatWindow";
import { IQContext } from "../AIContext";

interface TextSummaryProps {
  children: React.ReactNode;
}

const TextSummary: React.FC<TextSummaryProps> = ({ children }) => {
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const originalStateRef = useRef<Node[] | null>(null);
  const highlightedRangeRef = useRef<Range | null>(null);
  const scrollPositionRef = useRef<{ x: number; y: number } | null>(null);

  const { isIqOpen, setIsIqOpen, isAgentOpen, setIsAgentOpen } =
    useContext(IQContext);

  // Listen for text selection to show the tooltip
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() && !popupPosition) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Check if selection is near the top of the page
        const isNearTop = rect.top < 200;
        
        // Position tooltip based on selection position
        if (isNearTop) {
          // Position below the selection when near top
          setTooltipPosition({
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.bottom + window.scrollY + 5, // 5px below selection
          });
        } else {
          // Position above the selection (default)
          setTooltipPosition({
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.top + window.scrollY - 10,
          });
        }
      } else if (!selection || selection.toString().trim() === "") {
        // Hide tooltip when no text is selected
        setTooltipPosition(null);
      }
    };
    
    // Only set IqOpen when we have a popup position or selected text
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().trim();
    if (hasSelection || popupPosition) {
      setIsIqOpen(true);
    }

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      // Only reset if we were the one who set it
      if (hasSelection || popupPosition) {
        setIsIqOpen(false);
      }
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [popupPosition]);

  // Handle keyboard shortcut (Cmd+K/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        // First check if we're in a text selection scenario
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().trim();
        
        // Only handle the shortcut if we have text selected
        if (hasSelection) {
          e.preventDefault();
          e.stopPropagation();
          
          // Save current scroll position
          const currentScrollX = window.scrollX;
          const currentScrollY = window.scrollY;
          scrollPositionRef.current = {
            x: currentScrollX,
            y: currentScrollY
          };
          
          // If popup is already open, close it
          if (popupPosition) {
            setPopupPosition(null);
            // Restore scroll position after a short delay
            setTimeout(() => {
              window.scrollTo(currentScrollX, currentScrollY);
            }, 0);
            return;
          }
          
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const text = selection.toString().trim();

          // Check if text is selected near the top of the viewport (less than 200px from top)
          const isNearTop = rect.top < 200;
          
          // Calculate position relative to document to anchor to text
          const x = Math.max(
            0,
            Math.min(
              rect.left + window.scrollX,
              window.innerWidth + window.scrollX - 200
            )
          );
          
          // If text is near the top, position popup BELOW the selection instead of above
          const y = isNearTop 
            ? Math.max(50, rect.bottom + window.scrollY + 10) // Position below with 10px gap
            : Math.max(50, rect.top + window.scrollY); // Position at top (default behavior)

          // Store the text and position
          setSelectedText(text);
          setPopupPosition({ x, y });
          // Hide tooltip when chat window opens
          setTooltipPosition(null);

          // Use the surroundContents method instead of replacing
          highlightSelectedContent(range);
          
          // Ensure scroll position is maintained with more reliable timing
          setTimeout(() => {
            window.scrollTo(currentScrollX, currentScrollY);
          }, 50);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [popupPosition]);

  // Function to highlight the selected content
  const highlightSelectedContent = (range: Range) => {
    try {
      // Save original contents and range for restoration
      highlightedRangeRef.current = range.cloneRange();

      // Create a highlight span with only background color
      const highlightSpan = document.createElement("span");
      highlightSpan.style.backgroundColor = "#FCD535";

      // Use cloneContents to not disturb the original DOM
      const fragment = range.cloneContents();
      originalStateRef.current = Array.from(fragment.childNodes);

      // Apply highlighting
      if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        // Simple case: text node
        const surround = document.createElement("span");
        surround.style.backgroundColor = "#FCD535";
        range.surroundContents(surround);
      } else {
        // Complex case: multiple nodes
        // Store all ranges that need to be highlighted
        const ranges: Range[] = [];

        // Create temporary ranges for each text node
        const treeWalker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (range.intersectsNode(node)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            },
          }
        );

        let currentNode: Node | null = treeWalker.currentNode;
        while (currentNode) {
          if (range.intersectsNode(currentNode)) {
            const nodeRange = document.createRange();
            nodeRange.selectNode(currentNode);
            ranges.push(nodeRange);
          }
          currentNode = treeWalker.nextNode();
        }

        // Apply highlights to each range (in reverse to not invalidate other ranges)
        for (let i = ranges.length - 1; i >= 0; i--) {
          const nodeRange = ranges[i];
          const surround = document.createElement("span");
          surround.style.backgroundColor = "#FCD535";

          try {
            nodeRange.surroundContents(surround);
          } catch (e) {
            // If surroundContents fails (e.g., for partial node selections),
            // we could use a more complex approach but for now we'll just skip
            console.log("Could not highlight a segment", e);
          }
        }
      }
    } catch (e) {
      console.error("Error highlighting selection:", e);
    }
  };

  // Function to handle closing popup with scroll position preservation
  const handleClosePopup = () => {
    // Save current scroll position
    const currentScrollX = window.scrollX;
    const currentScrollY = window.scrollY;
    scrollPositionRef.current = {
      x: currentScrollX,
      y: currentScrollY
    };
    
    // Close the popup
    setPopupPosition(null);
    
    // Restore scroll position after state update
    setTimeout(() => {
      window.scrollTo(currentScrollX, currentScrollY);
    }, 0);
  };

  // Clean up highlight when popup closes
  useEffect(() => {
    const shouldCleanup = (!popupPosition && highlightedRangeRef.current) || 
                          (!isIqOpen && isAgentOpen && highlightedRangeRef.current);
    
    if (shouldCleanup) {
      // Save scroll position before cleanup
      const savedScrollX = window.scrollX;
      const savedScrollY = window.scrollY;
      
      // Remove all highlight spans we added
      const highlightSpans = document.querySelectorAll(
        'span[style*="background-color: rgb(252, 213, 53)"]'
      );

      highlightSpans.forEach((span) => {
        // Preserve the inner content when removing the span
        const parent = span.parentNode;
        if (parent) {
          // Move all children out of the span before removing it
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      });

      // Reset references
      highlightedRangeRef.current = null;
      originalStateRef.current = null;
      
      // Restore scroll position after DOM changes
      setTimeout(() => {
        window.scrollTo(savedScrollX, savedScrollY);
      }, 50);
    }
  }, [popupPosition, isIqOpen, isAgentOpen]);

  return (
    <>
      <div className="text-summary-container select-text">{children}</div>

      {/* Tooltip for keyboard shortcut */}
      {tooltipPosition && !popupPosition && (
        <div
          className="absolute bg-binance-gray text-white text-xs py-1 px-2 rounded pointer-events-none z-50 transform -translate-x-1/2"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transform: tooltipPosition.y > window.scrollY + 200 
              ? "translate(-50%, -100%)" // Position above when tooltip is not at top
              : "translate(-50%, 0)", // Position below when tooltip is at top
          }}
        >
          <span className="font-medium">⌘K / Ctrl+K to learn more</span>
          {/* Arrow pointing to the text */}
          <div 
            className="absolute w-2 h-2 bg-binance-gray rotate-45 left-1/2 -ml-1"
            style={{
              bottom: tooltipPosition.y > window.scrollY + 200 ? "-1px" : "auto",
              top: tooltipPosition.y > window.scrollY + 200 ? "auto" : "-1px",
            }}
          ></div>
        </div>
      )}

      {isIqOpen && popupPosition && (
        <ChatWindow
          context={selectedText}
          position={popupPosition}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default TextSummary;
