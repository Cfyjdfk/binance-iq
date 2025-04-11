/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'binance-yellow': '#FCD535',
                'binance-dark': '#181a1f',
                'binance-gray': '#1E2329',
            },
        },
    },
    plugins: [],
} 