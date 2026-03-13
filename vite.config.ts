import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VueSvelteGantt',
      formats: ['es'],
      fileName: 'vue-svelte-gantt',
    },
    rollupOptions: {
      external: ['vue', 'svelte-gantt'],
      output: {
        globals: {
          vue: 'Vue',
          'svelte-gantt': 'SvelteGantt',
        },
      },
    },
  },
});
