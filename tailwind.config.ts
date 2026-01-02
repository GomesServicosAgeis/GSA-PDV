import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Adicionei os caminhos raiz já que você não usa a pasta 'src'
  ],
  theme: {
    extend: {
      colors: {
        gsa: {
          blue: '#3b82f6',
          black: '#050505',
          card: '#0f0f0f'
        }
      }
    },
  },
  plugins: [],
};
export default config;