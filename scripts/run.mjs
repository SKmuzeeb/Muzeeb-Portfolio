// Build runner: executes a command and writes combined output to a UTF-8 file
// so results can be read reliably (PowerShell redirection mangles encoding).
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'

const [cmd, ...args] = process.argv.slice(2)
if (!cmd) {
  console.error('usage: node scripts/run.mjs <cmd> [args...]')
  process.exit(1)
}

mkdirSync('tmp-renders', { recursive: true })

const child = spawn(cmd, args, {
  shell: true,
  cwd: process.cwd(),
  env: process.env,
})

let out = ''
child.stdout.on('data', (d) => { out += d.toString() })
child.stderr.on('data', (d) => { out += d.toString() })

child.on('close', (code) => {
  writeFileSync('tmp-renders/run.txt', out, 'utf8')
  process.stdout.write(out.split(/\r?\n/).slice(-40).join('\n'))
  process.stdout.write(`\nEXIT=${code}\n`)
  process.exit(code)
})
