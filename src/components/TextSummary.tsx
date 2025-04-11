import React, { useState, useEffect } from "react";
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
          const x = Math.max(0, Math.min(rect.left + window.scrollX, window.innerWidth + window.scrollX - 200));
          const y = Math.max(50, rect.top + window.scrollY);

          setSelectedText(text);
          setPopupPosition({ x, y });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="text-summary-container select-text">{children}</div>
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
