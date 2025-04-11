import React, { useState, useEffect } from 'react';

interface TextSummaryProps {
    children: React.ReactNode;
}

interface SummaryPopupProps {
    text: string;
    position: { x: number; y: number } | null;
    onClose: () => void;
}

const summaryDictionary: Record<string, string> = {
    'Launchpool': 'A platform where users stake crypto to earn new tokens before listing',
    'Bitcoin': 'The first and largest cryptocurrency by market cap',
    'Ethereum': 'A decentralized platform for smart contracts and DApps',
    'BNB': 'Binance\'s native cryptocurrency used for trading fee discounts',
    // Add more definitions as needed
};

const SummaryPopup: React.FC<SummaryPopupProps> = ({ text, position, onClose }) => {
    if (!position) return null;

    return (
        <div
            className="fixed bg-[#1E2026] text-white px-4 py-3 rounded-lg shadow-xl z-[9999] border border-[#FCD535]"
            style={{
                top: `${position.y - 50}px`,
                left: `${position.x}px`,
                minWidth: '200px',
                maxWidth: '400px',
                transform: 'translateY(-100%)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
        >
            <div className="flex justify-between items-center gap-2">
                <div className="flex-1 text-sm">
                    {summaryDictionary[text] || `No summary available for "${text}"`}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white text-xl leading-none hover:bg-[#2B2F36] p-1 rounded"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const TextSummary: React.FC<TextSummaryProps> = ({ children }) => {
    const [selectedText, setSelectedText] = useState('');
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection && selection.toString().trim()) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const text = selection.toString().trim();

                    const x = Math.max(0, Math.min(rect.left, window.innerWidth - 200));
                    const y = Math.max(50, rect.top);

                    setSelectedText(text);
                    setPopupPosition({
                        x: x + window.scrollX,
                        y: y + window.scrollY
                    });
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div className="text-summary-container select-text">
                {children}
            </div>
            {popupPosition && (
                <SummaryPopup
                    text={selectedText}
                    position={popupPosition}
                    onClose={() => setPopupPosition(null)}
                />
            )}
        </>
    );
};

export default TextSummary; 