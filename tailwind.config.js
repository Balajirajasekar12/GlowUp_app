/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B1B22",
          soft: "#2A2A34",
        },
        porcelain: "#FBF7F2",
        brass: {
          DEFAULT: "#C9A227",
          light: "#E4C765",
        },
        rose: {
          DEFAULT: "#E8927C",
          light: "#F2B6A5",
        },
        sage: {
          DEFAULT: "#8A9A8E",
          light: "#B3C1B7",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
