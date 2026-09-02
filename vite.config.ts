import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function apkMimePlugin() {
  return {
    name: 'apk-mime-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.includes('.apk')) {
          const apkPath = path.resolve(__dirname, 'public', 'ipra-avisos.apk')
          if (fs.existsSync(apkPath)) {
            const stat = fs.statSync(apkPath)
            res.writeHead(200, {
              'Content-Type': 'application/vnd.android.package-archive',
              'Content-Length': stat.size,
              'Content-Disposition': 'attachment; filename="ipra-avisos.apk"',
            })
            return fs.createReadStream(apkPath).pipe(res)
          }
        }
        next()
      })
    },
    configurePreviewServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.includes('.apk')) {
          const apkPath = path.resolve(__dirname, 'dist', 'ipra-avisos.apk')
          if (fs.existsSync(apkPath)) {
            const stat = fs.statSync(apkPath)
            res.writeHead(200, {
              'Content-Type': 'application/vnd.android.package-archive',
              'Content-Length': stat.size,
              'Content-Disposition': 'attachment; filename="ipra-avisos.apk"',
            })
            return fs.createReadStream(apkPath).pipe(res)
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apkMimePlugin()],
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
})
