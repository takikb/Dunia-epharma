// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#450d6a",
        "primary-container": "#5d2a82",
        "primary-fixed": "#f3daff",
        "primary-fixed-dim": "#e2b6ff",
        "on-primary-fixed": "#2e004d",
        "on-primary-fixed-variant": "#612e86",
        "on-primary-container": "#d199f9",
        secondary: "#006876",
        "secondary-container": "#7de9fe",
        "on-secondary-container": "#006977",
        tertiary: "#2e2c32",
        "tertiary-container": "#444248",
        background: "#fff7fd",
        "on-background": "#1e1a20",
        surface: "#fff7fd",
        "on-surface": "#1e1a20",
        "on-surface-variant": "#4c4450",
        "surface-variant": "#e9e0e8",
        "surface-container-low": "#faf1f9",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#cfc3d1",
      },
      spacing: {
        "container-padding-desktop": "80px",
        "container-padding-mobile": "20px",
        "section-gap": "120px",
        gutter: "24px",
        base: "8px",
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
        "body-md": ["16px", { lineHeight: "24px" }],
        "body-lg": ["18px", { lineHeight: "28px" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
};