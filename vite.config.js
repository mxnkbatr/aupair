import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Touch devices apply :hover on tap and keep it until the next tap elsewhere,
// so hover effects are limited to real pointers.
const hoverOnlyOnPointer = () => ({
  postcssPlugin: 'hover-only-on-pointer',
  Once(root, { AtRule }) {
    root.walkRules((rule) => {
      if (!rule.selector.includes(':hover')) return
      if (rule.parent?.type === 'atrule' && rule.parent.params === '(hover: hover) and (pointer: fine)') return
      const hover = rule.selectors.filter((s) => s.includes(':hover'))
      const rest = rule.selectors.filter((s) => !s.includes(':hover'))
      const media = new AtRule({ name: 'media', params: '(hover: hover) and (pointer: fine)' })
      media.append(rule.clone({ selectors: hover }))
      rule.after(media)
      if (rest.length) rule.selectors = rest
      else rule.remove()
    })
  },
})
hoverOnlyOnPointer.postcss = true

export default defineConfig({
  plugins: [react()],
  base: '/',
  css: {
    postcss: { plugins: [hoverOnlyOnPointer()] },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
