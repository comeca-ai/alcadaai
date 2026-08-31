/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Alçada brand tokens (design-alcada/design.md — paleta SÉRIA, usar exatamente)
        al: {
          green: '#14563F', // marca/ação principal
          'green-hover': '#0E4331',
          teal: '#2E7D5B', // aprovação/sucesso
          'teal-soft': '#E7F1EA',
          'teal-ink': '#1E6B4F', // texto sobre teal-soft
          cream: '#F8F5EF', // papel
          dark: '#1F1B16', // tinta/escuro
          ink: '#1F1B16',
          border: '#E7DAC4',
          muted: '#6E5F4B',
          faint: '#A08A6B',
          sand: '#C9B99C', // areia escura
          rail: '#F1E8D8', // linhas internas de cards
          amber: '#D98E2B',
          'amber-ink': '#9A6410',
          'amber-soft': '#F6EEDC',
          red: '#C0392B',
          'red-ink': '#8F2B27',
          'red-soft': '#F7E9E7',
          gold: '#E8C98A', // marca em fundo escuro (ouro)
          mint: '#8FD4B2', // verde claro em fundo escuro
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(46,125,91,.45)" },
          "70%": { boxShadow: "0 0 0 8px rgba(46,125,91,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(46,125,91,0)" },
        },
        slidein: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "none" },
        },
        fadein: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.4s infinite",
        slidein: "slidein .45s ease",
        fadein: "fadein .3s ease",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
