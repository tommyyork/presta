const path = require('path')
const fs = require('fs-extra')

const cwd = process.cwd()
const root = path.join(cwd, 'fixtures')

const fixtures = {
  config: {
    path: path.join(root, 'presta.config.js'),
    content: `
      export const pages = './src/**/*.js'
      export const output = './dist'
    `
  },
  runtime: {
    path: path.join(root, 'presta.runtime.js'),
    content: `
      export function render() {}
    `
  },
  pageA: {
    path: path.join(root, './pages/A.js'),
    content: `
      export function getPaths() {};export function Page() {}
    `
  }
}

for (const { path, content } of Object.values(fixtures)) {
  fs.outputFileSync(path, content)
}

console.log('fixtures complete')
