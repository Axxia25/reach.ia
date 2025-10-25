/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#e5f3ff',
  				'100': '#b3d9ff',
  				'500': '#007aff',
  				'600': '#0056cc',
  				'700': '#004199',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#f3f0ff',
  				'500': '#5856d6',
  				'600': '#4a42c4',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			success: {
  				'50': '#e8f8f0',
  				'500': '#34c759',
  				'600': '#2da649'
  			},
  			danger: {
  				'50': '#ffeee8',
  				'500': '#ff3b30',
  				'600': '#d32f2f'
  			},
  			warning: {
  				'50': '#fff3e0',
  				'500': '#ff9500',
  				'600': '#e6850e'
  			},
  			gray: {
  				'50': '#fafafa',
  				'100': '#f2f2f7',
  				'200': '#e5e5ea',
  				'300': '#d1d1d6',
  				'400': '#c7c7cc',
  				'500': '#8e8e93',
  				'600': '#6d6d70',
  				'700': '#48484a',
  				'800': '#2c2c2e',
  				'900': '#1c1c1e'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'SF Pro Display',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			xl: '16px',
  			'2xl': '20px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			card: '0 1px 3px rgba(0,0,0,0.1)',
  			'card-hover': '0 4px 12px rgba(0,0,0,0.15)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
