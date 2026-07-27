import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function readJsonVersion(filePath: string): string {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw) as { version?: string; expo?: { version?: string; runtimeVersion?: string } }
    return data.version || data.expo?.version || '—'
  } catch {
    return '—'
  }
}

function readMobileVersions(appJsonPath: string, pkgPath: string): { version: string; runtime: string } {
  let version = readJsonVersion(pkgPath)
  let runtime = '—'
  try {
    const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as {
      expo?: { version?: string; runtimeVersion?: string }
    }
    if (app.expo?.version) version = app.expo.version
    if (typeof app.expo?.runtimeVersion === 'string') runtime = app.expo.runtimeVersion
  } catch {
    // keep pkg version
  }
  return { version, runtime }
}

const root = __dirname
const mobile = readMobileVersions(
  path.resolve(root, '../../mex-unified/app.json'),
  path.resolve(root, '../../mex-unified/package.json'),
)

const mexVersions = {
  admin: readJsonVersion(path.resolve(root, 'package.json')),
  mobile: mobile.version,
  mobileRuntime: mobile.runtime,
  connect: readJsonVersion(path.resolve(root, '../mex-connect/package.json')),
  landing: readJsonVersion(path.resolve(root, '../mex-landing/package.json')),
}

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  define: {
    __MEX_VERSIONS__: JSON.stringify(mexVersions),
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.mex.app.br',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
