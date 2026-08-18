const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          powder: "#E9B7C5",
          blush: "#FFF5F8",
          plum: "#5B2A6E",
          mauve: "#8C5A9E",
          white: "#FFFFFF",
          ink: "#241B25",
          muted: "#6F626D",
          border: "#E8DDE5",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-serif)", ...defaultTheme.fontFamily.serif],
      },
      boxShadow: {
        soft: "0 16px 40px rgba(36, 27, 37, 0.08)",
        focus: "0 0 0 3px rgba(233, 183, 197, 0.55)",
      },
      borderRadius: {
        card: "0.5rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "slide-up": "slide-up 220ms ease-out",
      },
    },
  },
}
