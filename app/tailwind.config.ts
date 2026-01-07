import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
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
                // iCom specific colors
                "icom-teal": "#14B8A6",
                "icom-blue": "#3B82F6",
                "icom-purple": "#8B5CF6",
                "icom-green": "#10B981",
                "icom-orange": "#F97316",
                "icom-red": "#EF4444",
                // Rank badge colors
                "rank-platinum": "#E5E7EB",
                "rank-gold": "#FCD34D",
                "rank-silver": "#F3F4F6",
                "rank-bronze": "#FBBF24",
            },
            backgroundImage: {
                "primary-gradient": "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)", // Updated to match new theme
                // iCom gradients
                "icom-gradient": "linear-gradient(135deg, #14B8A6 0%, #3B82F6 100%)",
                "icom-gradient-purple": "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                "icom-gradient-green": "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
                "rank-platinum-gradient": "linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)",
                "rank-gold-gradient": "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                "rank-silver-gradient": "linear-gradient(135deg, #F3F4F6 0%, #D1D5DB 100%)",
                "rank-bronze-gradient": "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)"],
                mono: ["var(--font-geist-mono)"],
                display: ["var(--font-inter)", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "1rem",
                'sm': "0.5rem",  // 8px
                'md': "0.75rem", // 12px
                lg: "1rem",      // 16px
                xl: "1.5rem",    // 24px
                '2xl': "2rem",
                full: "9999px",
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
                'soft': '0 4px 25px -5px rgba(0, 0, 0, 0.05), 0 0 10px -5px rgba(0,0,0,0.01)',
                'card': '0 2px 8px -2px rgba(99, 102, 241, 0.05), 0 0 0 1px rgba(241, 245, 249, 1)',
                // iCom specific shadows
                'icom-sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
                'icom-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
                'icom-lg': '0 20px 60px rgba(0, 0, 0, 0.3)',
                'icom-glow-teal': '0 2px 8px rgba(20, 184, 166, 0.3)',
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
                '2xl': '48px',
                '3xl': '64px',
            }
        },
    },
    plugins: [],
};
export default config;
