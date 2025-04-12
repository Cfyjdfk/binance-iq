import React, { useState, useEffect, useRef } from "react";
import { ChatWindow } from "./ChatWindow";

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

  // Listen for text selection to show the tooltip
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() && !popupPosition) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position tooltip above the selection
        setTooltipPosition({
          x: rect.left + (rect.width / 2) + window.scrollX,
          y: rect.top + window.scrollY - 10
        });
      } else if (!selection || selection.toString().trim() === "") {
        // Hide tooltip when no text is selected
        setTooltipPosition(null);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [popupPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const text = selection.toString().trim();

          // Calculate position relative to document to anchor to text
          const x = Math.max(
            0,
            Math.min(
              rect.left + window.scrollX,
              window.innerWidth + window.scrollX - 200
            )
          );
          const y = Math.max(50, rect.top + window.scrollY);

          // Store the text and position
          setSelectedText(text);
          setPopupPosition({ x, y });
          // Hide tooltip when chat window opens
          setTooltipPosition(null);

          // Use the surroundContents method instead of replacing
          highlightSelectedContent(range);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Clean up highlight when popup closes
  useEffect(() => {
    if (!popupPosition && highlightedRangeRef.current) {
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
    }
  }, [popupPosition]);

  return (
    <>
      <div className="text-summary-container select-text">{children}</div>
      
      {/* Tooltip for keyboard shortcut */}
      {tooltipPosition && !popupPosition && (
        <div 
          className="absolute bg-binance-gray text-white text-xs py-1 px-2 rounded pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <span className="font-medium">⌘K / Ctrl+K to learn more</span>
          <div className="absolute w-2 h-2 bg-binance-gray rotate-45 left-1/2 -bottom-1 -ml-1"></div>
        </div>
      )}
      
      {popupPosition && (
        <ChatWindow
          context={selectedText}
          position={popupPosition}
          onClose={() => setPopupPosition(null)}
        />
      )}
    </>
  );
};

export default TextSummary;
