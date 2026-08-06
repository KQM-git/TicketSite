import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      "prefer-const": "warn",
      "no-trailing-spaces": "error",
      "spaced-comment": "warn",
      "quotes": ["warn", "double"],
      "no-multiple-empty-lines": ["error", {
        max: 2,
        maxBOF: 0,
        maxEOF: 0,
      }],
      "semi": ["warn", "never"],
      "eol-last": "error",
      "no-useless-escape": "error",
      "object-curly-spacing": ["warn", "always"],
      "comma-spacing": "warn",
    },
  },
]

export default config
