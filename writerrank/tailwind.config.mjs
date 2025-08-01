/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'ow-orange-50': '#FFF8F2',
        'ow-orange-500': '#FF6B00',
        'ow-neutral-900': '#111827',
        'ow-neutral-50': '#FFFFFF',
      },
    },
  },
  plugins: [],
}

export default config
