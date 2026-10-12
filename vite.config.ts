import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Connect } from 'vite';
import { defineConfig, type Plugin } from 'vite';

function tepTinh(): Plugin {
  const fontPath = fs.existsSync('C:\\Windows\\Fonts\\arial.ttf')
    ? 'C:\\Windows\\Fonts\\arial.ttf'
    : path.resolve(__dirname, 'public/font/BeVietnamPro-Regular.ttf');
  const xlsxPath = path.resolve(__dirname, 'public/mau-test/CongNo_Demo_Test.xlsx');
  const serve: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url === '/api/font/arial.ttf') {
      if (!fs.existsSync(fontPath)) {
        res.statusCode = 404;
        res.end('missing');
        return;
      }
      res.setHeader('Content-Type', 'font/ttf');
      fs.createReadStream(fontPath).pipe(res);
      return;
    }
    if (url === '/mau-test/CongNo_Demo_Test.xlsx') {
      if (!fs.existsSync(xlsxPath)) {
        res.statusCode = 404;
        res.end('missing');
        return;
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      fs.createReadStream(xlsxPath).pipe(res);
      return;
    }
    next();
  };
  return {
    name: 'tep-tinh',
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), tepTinh()],
  server: {
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      allow: [path.resolve(__dirname)],
    },
    watch: {
      ignored: ['**/public/font/**', '**/public/mau-test/**'],
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
});
