import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#111111',
          text: '#e0e0e0',
          primary: '#3498db',
          secondary: '#2ecc71',
        },
      },
    },
  },
  plugins: [],
};
export default config;
