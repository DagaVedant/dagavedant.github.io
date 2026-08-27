/** @type {import('tailwindcss').Config} */
module.exports = {
    // The site is dark-committed: there is one palette and no `.dark` class.
    // `darkMode: ["class"]` is kept deliberately so the `dark:` variants baked
    // into src/components/ui/* stay permanently inert. Switching this to
    // "media" would make them fire off the OS setting. Do not change it.
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                display: ['var(--font-display)'],
                inter: ['var(--font-inter)'],
                mono: ['var(--font-mono)'],
            },
            borderRadius: {
                // --radius is 4px (VS Code is nearly square). The stock shadcn
                // offsets of -2/-4 would make `sm` resolve to 0px, so they are
                // tightened to keep the scale non-degenerate.
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 1px)',
                sm: 'calc(var(--radius) - 2px)'
            },
            colors: {
                vs: {
                    chrome: 'var(--vs-chrome)',
                    editor: 'var(--vs-editor)',
                    widget: 'var(--vs-widget)',
                    quickinput: 'var(--vs-quickinput)',
                    border: 'var(--vs-border)',
                    contrast: 'var(--vs-contrast)',
                    text: 'var(--vs-text)',
                    descr: 'var(--vs-descr)',
                    breadcrumb: 'var(--vs-breadcrumb)',
                    linenum: 'var(--vs-linenum)',
                    accent: 'var(--vs-accent)',
                    statusbar: 'var(--vs-statusbar)',
                    'statusbar-fg': 'var(--vs-statusbar-fg)',
                    'list-hover': 'var(--vs-list-hover)',
                    'list-active': 'var(--vs-list-active)',
                    'list-inactive': 'var(--vs-list-inactive)',
                    badge: 'var(--vs-badge)',
                    keyword: 'var(--vs-keyword)',
                    type: 'var(--vs-type)',
                    function: 'var(--vs-function)',
                    variable: 'var(--vs-variable)',
                    string: 'var(--vs-string)',
                    number: 'var(--vs-number)',
                    comment: 'var(--vs-comment)',
                    constant: 'var(--vs-constant)',
                },
                term: {
                    ok: 'var(--term-ok)',
                    warn: 'var(--term-warn)',
                    error: 'var(--term-error)',
                    dim: 'var(--term-dim)',
                    path: 'var(--term-path)',
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
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
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
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}