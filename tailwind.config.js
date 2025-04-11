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
        },
    },
    plugins: [],
} 