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
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'fade-out': 'fadeOut 0.3s ease-in-out',
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
            },
        },
    },
    plugins: [],
} 