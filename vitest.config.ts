import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
      coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // types.ts contains only type aliases and constants — exclude from coverage
      include: ['src/engine/gameLogic.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
