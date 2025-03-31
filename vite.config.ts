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
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        decorator: resolve(__dirname, 'src/decorator/index.ts'),
        error: resolve(__dirname, 'src/error/index.ts'),
      },
      name: 'index'
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
