/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: '#f4a029',
                    dark: '#d88a1f',
                    light: '#f6b550',
                },
                dark: {
                    900: '#000000',
                    800: '#0a0a0a',
                    700: '#141414',
                    600: '#1f1f1f',
                    500: '#2a2a2a',
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            fontSize: {
                '5xl': '3rem',
                '6xl': '3.75rem',
                '7xl': '4.5rem',
            },
            aspectRatio: {
                '2/3': '2 / 3',
                '16/9': '16 / 9',
            },
        },
    },
    plugins: [],
};
