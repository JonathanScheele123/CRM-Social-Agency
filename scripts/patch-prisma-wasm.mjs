import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const loaderPath = resolve(__dirname, '../node_modules/prisma-wasm-edge/wasm-worker-loader.mjs')

const patched = `/* patched for Cloudflare Workers: static import instead of dynamic */
import wasmModule from './query_engine_bg.wasm'
export default Promise.resolve({ default: wasmModule })
`

writeFileSync(loaderPath, patched)
console.log('✓ Patched wasm-worker-loader.mjs for Cloudflare Workers')
