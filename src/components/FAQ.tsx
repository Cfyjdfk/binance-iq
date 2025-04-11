import React, { useState } from 'react';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "What is a cryptocurrency exchange?",
        answer: "A cryptocurrency exchange is a digital platform where you can buy, sell, and trade cryptocurrencies. Binance is the world's largest crypto exchange, offering a secure and user-friendly platform for trading various digital assets."
    },
    {
        id: 2,
        question: "What products does Binance provide?",
        answer: "Binance offers a wide range of products including spot trading, margin trading, futures trading, staking, crypto loans, savings accounts, NFT marketplace, and more. Our platform caters to both beginners and advanced traders."
    },
    {
        id: 3,
        question: "How to buy Bitcoin and other cryptocurrencies on Binance",
        answer: "You can buy crypto on Binance using credit/debit cards, bank transfers, or P2P trading. Simply create an account, complete verification, choose your payment method, and make your purchase. We support multiple currencies and payment options."
    },
    {
        id: 4,
        question: "How to track cryptocurrency prices",
        answer: "You can track crypto prices on Binance through our real-time price charts, market overview pages, and price alerts. We provide comprehensive market data, technical analysis tools, and customizable watchlists."
    },
    {
        id: 5,
        question: "How to trade cryptocurrencies on Binance",
        answer: "To trade on Binance, deposit funds, navigate to the trading page, select your trading pair, analyze the market using our tools, and place your order. We offer spot, margin, and futures trading with advanced order types."
    },
    {
        id: 6,
        question: "How to earn from crypto on Binance",
        answer: "Binance offers multiple ways to earn from crypto including staking, savings accounts, liquidity pools, launchpool farming, and Binance Earn products. You can earn passive income by holding various cryptocurrencies."
    }
];

const FAQ: React.FC = () => {
    const [openItem, setOpenItem] = useState<number | null>(null);

    const toggleItem = (id: number) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <div className="bg-binance-dark py-16 px-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-white text-center mb-12">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {faqData.map((item) => (
                        <div key={item.id} className="bg-binance-gray rounded-lg overflow-hidden">
                            <button
                                className="w-full px-6 py-4 text-left flex items-center justify-between text-white hover:text-binance-yellow transition-colors duration-200"
                                onClick={() => toggleItem(item.id)}
                            >
                                <span className="flex items-center">
                                    <span className="mr-4 text-sm text-gray-400">{item.id}</span>
                                    <span className="text-lg font-medium">{item.question}</span>
                                </span>
                                <span className="text-2xl transform transition-transform duration-200">
                                    {openItem === item.id ? '−' : '+'}
                                </span>
                            </button>
                            {openItem === item.id && (
                                <div className="px-6 pb-4 text-gray-300">
                                    <p>{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ; 