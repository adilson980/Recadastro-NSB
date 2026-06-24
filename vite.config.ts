import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'react-dom-compat',
        resolveId(id, importer) {
          if (id === 'react-dom' && importer && !importer.includes('react-dom-compat')) {
            return this.resolve('react-dom', importer, { skipSelf: true }).then(resolved => {
              if (resolved) {
                return path.resolve(__dirname, 'src/react-dom-compat.ts');
              }
              return null;
            });
          }
          return null;
        }
      }
    ],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
        { find: /^react-dom$/, replacement: path.resolve(__dirname, 'src/react-dom-compat.ts') }
      ]
    },
    optimizeDeps: {
      exclude: ['recharts', 'react-dom']
    },
    server: {
      cors: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
