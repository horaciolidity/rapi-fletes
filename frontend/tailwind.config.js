/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#facc15',
                    dark: '#eab308',
                },
                secondary: '#18181b',
            }
        },
    },
    plugins: [],
}
