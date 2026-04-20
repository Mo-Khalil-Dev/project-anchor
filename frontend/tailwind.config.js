/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens from Bridge README
        accent: "oklch(52% 0.18 270)",
        "accent-bg": "oklch(96.5% 0.03 270)",
        "accent-dark": "oklch(40% 0.22 285)",
        green: "oklch(51% 0.17 145)",
        "green-bg": "oklch(96.5% 0.04 145)",
        amber: "oklch(62% 0.16 76)",
        "amber-bg": "oklch(96.5% 0.05 76)",
        red: "oklch(52% 0.18 25)",
        "red-bg": "oklch(97% 0.03 25)",
        text: "#0d0f14",
        sub: "#5a5f72",
        muted: "#9197ab",
        divider: "rgba(0,0,0,0.07)",
        border: "rgba(0,0,0,0.08)",
        card: "#ffffff",
        bg: "#f4f5f9",
        sidebar: "#160f2e",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "page-title": ["26px", { fontWeight: "800", letterSpacing: "-0.6px" }],
        "section-title": ["20px", { fontWeight: "700", letterSpacing: "-0.4px" }],
        "card-heading": ["15px", { fontWeight: "700" }],
        body: ["14px", { fontWeight: "400", lineHeight: "1.55" }],
        label: ["13.5px", { fontWeight: "400" }],
        "section-label": ["11px", { fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase" }],
        "stat-figure": ["28px", { fontWeight: "800", letterSpacing: "-1px" }],
      },
      spacing: {
        card: "20px",
        row: "11px",
      },
      borderRadius: {
        card: "18px",
        stat: "14px",
        button: "14px",
        "button-sm": "11px",
        input: "10px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06)",
        "card-elevated": "0 4px 20px oklch(52% 0.18 270 / 0.18)",
        "button-primary": "0 4px 18px oklch(52% 0.18 270 / 0.28)",
      },
    },
  },
  plugins: [],
};
