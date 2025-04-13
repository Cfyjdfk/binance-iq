/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'binance': ['"Binance Plex"', 'sans-serif'],
            },
            colors: {
                'binance-yellow': '#FCD535',
                'binance-light-yellow': '#FFF1B8',
                'binance-dark': '#181a1f',            
                'binance-gray': '#1E2329',
                'black': '#000000',
                'white': '#FFFFFF',
                'gray': '#838383',
                'light-gray': '#2E2E2E',
            },
            boxShadow: {
                'glow': '0 0 15px 5px rgba(252, 213, 53, 0.7)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'fade-out': 'fadeOut 0.3s ease-in-out',
                'pulse-glow': 'pulseGlow 1.5s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                fadeOut: {
                    '0%': { opacity: 1, transform: 'translateY(0)' },
                    '100%': { opacity: 0, transform: 'translateY(10px)' },
                },
                pulseGlow: {
                    '0%': { boxShadow: '0 0 5px 0px rgba(252, 213, 53, 0.7)' },
                    '50%': { boxShadow: '0 0 20px 5px rgba(252, 213, 53, 0.7)' },
                    '100%': { boxShadow: '0 0 5px 0px rgba(252, 213, 53, 0.7)' },
                },
            },
        },
    },
    plugins: [],
} 