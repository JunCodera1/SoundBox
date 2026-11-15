/** SoundBox design tokens live in src/index.css as CSS variables. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)", surface: "rgb(var(--surface) / <alpha-value>)", raised: "rgb(var(--raised) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)", ink: "rgb(var(--ink) / <alpha-value>)", mute: "rgb(var(--mute) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)", "accent-ink": "rgb(var(--accent-ink) / <alpha-value>)", danger: "rgb(var(--danger) / <alpha-value>)",
      },
      fontFamily: { display: ["'Bricolage Grotesque'", "ui-sans-serif", "system-ui", "sans-serif"], sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
};
