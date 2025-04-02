import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { coverageConfigDefaults } from 'vitest/config'


export default defineConfig({
  plugins: [
    dts({ 
      copyDtsFiles: true,
      rollupTypes: true,
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      exclude: [
        '**/index.ts',
        ...coverageConfigDefaults.exclude
      ],
    },
  },
  build: {
    minify: true,
    lib: {
      fileName: 'index',
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
