import type { Config } from "tailwindcss"

import preset from "@bibajilbab/config/tailwind-preset"

const config = {
  presets: [preset],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/config/src/**/*.{ts,tsx}",
    "../../packages/types/src/**/*.{ts,tsx}",
  ],
} satisfies Config

export default config
