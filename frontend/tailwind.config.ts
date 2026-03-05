import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // OpenWave brand palette — driven by CSS vars so themes can swap colors
        brand: {
          50:  'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        // Dark theme surface colors
        surface: {
          950: '#050507',
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#22222f',
          500: '#2a2a3a',
          400: '#35354a',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'wave': {
          '0%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200px 0' },
          to: { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        // ── New premium animations ─────────────────────────
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'blob': {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20,184,166,0.3), 0 0 60px rgba(20,184,166,0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(20,184,166,0.6), 0 0 80px rgba(20,184,166,0.25)' },
        },
        'glow-pulse-lg': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(20,184,166,0.4), 0 0 120px rgba(20,184,166,0.15)' },
          '50%':      { boxShadow: '0 0 80px rgba(20,184,166,0.8), 0 0 160px rgba(20,184,166,0.3)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-16px)', opacity: '0' },
          to:   { transform: 'translateX(0)',     opacity: '1' },
        },
        'slide-in-bottom': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.92)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
        'orbit': {
          from: { transform: 'rotate(0deg) translateX(24px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(24px) rotate(-360deg)' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'music-bar': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1.0)' },
        },
        'ticker': {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'wave': 'wave 1.2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
        // ── New ──────────────────────────────────────────────
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'blob':            'blob 10s ease-in-out infinite',
        'blob-slow':       'blob 14s ease-in-out infinite',
        'float':           'float 4s ease-in-out infinite',
        'float-slow':      'float 6s ease-in-out infinite',
        'glow-pulse':      'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-lg':   'glow-pulse-lg 3s ease-in-out infinite',
        'slide-in-left':   'slide-in-left 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-bottom': 'slide-in-bottom 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':        'scale-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        'orbit':           'orbit 3s linear infinite',
        'ping-slow':       'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'music-bar':       'music-bar 0.8s ease-in-out infinite',
        'ticker':          'ticker 20s linear infinite',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-lg': '0 0 40px rgba(20, 184, 166, 0.4)',
        'glow-xl': '0 0 80px rgba(20, 184, 166, 0.6)',
        'glow-brand': '0 0 30px rgba(20,184,166,0.5), 0 0 60px rgba(20,184,166,0.2)',
        'player': '0 -4px 60px rgba(0, 0, 0, 0.8)',
        'card-hover': '0 20px 60px -10px rgba(0,0,0,0.8), 0 0 30px rgba(20,184,166,0.1)',
        'float': '0 32px 80px -16px rgba(0,0,0,0.9)',
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
