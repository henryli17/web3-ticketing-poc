const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: "jit",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter var", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
