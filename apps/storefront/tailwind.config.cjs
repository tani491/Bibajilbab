const preset = require("@bibajilbab/config/tailwind-preset")

module.exports = {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
}
