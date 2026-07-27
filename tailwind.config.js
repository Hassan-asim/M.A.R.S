/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'agent-planner': '#6366F1',
        'agent-researcher-a': '#0EA5E9',
        'agent-researcher-b': '#8B5CF6',
        'agent-fact-checker': '#F59E0B',
        'agent-writer': '#EC4899',
        'agent-editor': '#10B981',
        'background': '#f8f9ff',
        'surface': '#f8f9ff',
        'surface-border': '#E2E8F0',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'primary': '#003342',
        'on-primary': '#ffffff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#40484c',
        'outline': '#71787c',
        'outline-variant': '#c0c8cc',
        'report-bg': '#FFFFFF',
        'error': '#ba1a1a',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      spacing: {
        'log-indent': '2.5rem',
        'gutter': '1rem',
        'stack-gap': '0.75rem',
        'report-max-width': '700px',
      },
      fontFamily: {
        'report-h1': ['Hanken Grotesk', 'sans-serif'],
        'report-h2': ['Hanken Grotesk', 'sans-serif'],
        'report-body': ['Inter', 'sans-serif'],
        'chat-bubble': ['Inter', 'sans-serif'],
        'status-label': ['JetBrains Mono', 'monospace'],
        'caption': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
