import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Elemental Colors
				air: {
					primary: 'hsl(var(--air-primary))',
					secondary: 'hsl(var(--air-secondary))',
					accent: 'hsl(var(--air-accent))'
				},
				water: {
					primary: 'hsl(var(--water-primary))',
					secondary: 'hsl(var(--water-secondary))',
					accent: 'hsl(var(--water-accent))'
				},
				earth: {
					primary: 'hsl(var(--earth-primary))',
					secondary: 'hsl(var(--earth-secondary))',
					accent: 'hsl(var(--earth-accent))'
				},
				fire: {
					primary: 'hsl(var(--fire-primary))',
					secondary: 'hsl(var(--fire-secondary))',
					accent: 'hsl(var(--fire-accent))'
				},
				health: {
					full: 'hsl(var(--health-full))',
					half: 'hsl(var(--health-half))',
					low: 'hsl(var(--health-low))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'element-switch': {
					'0%': { transform: 'scale(1) rotate(0deg)' },
					'50%': { transform: 'scale(1.2) rotate(180deg)' },
					'100%': { transform: 'scale(1) rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-in': 'slide-in 0.5s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'element-switch': 'element-switch 0.6s ease-in-out'
			},
			backgroundImage: {
				'air-gradient': 'var(--air-gradient)',
				'water-gradient': 'var(--water-gradient)',
				'earth-gradient': 'var(--earth-gradient)',
				'fire-gradient': 'var(--fire-gradient)'
			},
			boxShadow: {
				'glow-air': 'var(--glow-air)',
				'glow-water': 'var(--glow-water)',
				'glow-earth': 'var(--glow-earth)',
				'glow-fire': 'var(--glow-fire)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
