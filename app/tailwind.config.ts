import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#6366f1", // Vibrant Indigo
                "primary-hover": "#4f46e5",
                "primary-light": "#e0e7ff",
                "primary-dark": "#0284c7", // For detail page
                secondary: "#ec4899", // Vibrant Pink
                accent: "#facc15", // Yellow/Gold for detail page
                "background-light": "#f0f9ff", // Light blue tint for detail page
                "background-dark": "#0f172a", // Rich Slate 900
                "surface-dark": "#1e293b", // Slate 800
                "surface": "#ffffff",
                "input-dark": "#334155", // Slate 700
                "border-dark": "#334155",
                "border-subtle": "#e2e8f0", // Slate 200 for detail page
                "field-bg": "#F8FAFC",
                // iShop/iCard specific colors
                "bg-page": "#F8FAFC",
                "ishop": "#f97316",
                "ishop-bg": "#ffedd5",
                "icard": "#06b6d4",
                "icard-bg": "#cffafe",
                "text-main": "#0f172a",
                "text-sub": "#64748b",
                "text-secondary": "#64748b",
            },
            backgroundImage: {
                "primary-gradient": "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)", // Updated to match new theme
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)"],
                mono: ["var(--font-geist-mono)"],
                display: ["var(--font-inter)", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "1rem",
                lg: "1.5rem",
                xl: "2rem",
                full: "9999px",
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
                'soft': '0 4px 25px -5px rgba(0, 0, 0, 0.05), 0 0 10px -5px rgba(0,0,0,0.01)',
                'card': '0 2px 8px -2px rgba(99, 102, 241, 0.05), 0 0 0 1px rgba(241, 245, 249, 1)',
            }
        },
    },
    plugins: [],
};
export default config;
