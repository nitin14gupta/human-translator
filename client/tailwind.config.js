/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          // Primary colors (40%)
          primary: {
            blue: "#007BFF",
            DEFAULT: "#007BFF", // Making blue the default primary color
            green: "#28A745",
          },
          // Secondary colors (30%)
          secondary: {
            orange: "#FF8800",
            DEFAULT: "#FF8800",
            lilac: "#C8A2C8",
          },
          // Accent colors
          accent: {
            yellow: "#FFC107",
            teal: "#20C997",
          },
          // Neutral colors
          neutral: {
            white: "#FFFFFF",
            gray: {
              100: "#F8F9FA",
              200: "#E9ECEF",
              300: "#DEE2E6",
              400: "#CED4DA",
              500: "#ADB5BD",
              600: "#6C757D",
              700: "#495057",
              800: "#343A40",
              900: "#212529",
            },
          },
          // Additional semantic colors
          success: "#28A745",
          error: "#DC3545",
          warning: "#FFC107",
          info: "#17A2B8",
        },
        fontFamily: {
          // Primary fonts
          'roboto': ['Roboto', 'sans-serif'],
          'open-sans': ['Open Sans', 'sans-serif'],
          'montserrat': ['Montserrat', 'sans-serif'],
          'poppins': ['Poppins', 'sans-serif'],
          // Secondary fonts for multilingual support
          'noto': ['Noto Sans', 'sans-serif'],
          'sofia': ['Sofia Pro', 'sans-serif'],
          // Set defaults
          'sans': ['Roboto', 'Noto Sans', 'sans-serif'],
          'body': ['Open Sans', 'Noto Sans', 'sans-serif'],
          'heading': ['Montserrat', 'Noto Sans', 'sans-serif'],
        },
        fontSize: {
          'xs': '0.75rem',
          'sm': '0.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
        },
      },
    },
    plugins: [],
  }