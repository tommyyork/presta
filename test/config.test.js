const path = require('path')

const fixtures = require('./fixtures')
const { create, unmerge } = require('../lib/config')

module.exports = async function (test, assert) {
  test('config - defaults', async () => {
    const pages = 'app/**/*.js'
    const cli = { pages }
    const config = create(cli)

    assert(Array.isArray(config._cli.pages))
    assert.deepEqual(config._config, {})

    assert(config.pages[0].includes(pages))
    assert(path.isAbsolute(config.output))
    assert(path.isAbsolute(config.assets))
    assert(path.isAbsolute(config.cwd))
    assert(config.configFilepath === undefined)
    assert(config.dynamicEntryFilepath.includes(config.output))
  })

  test('config - no pages', async () => {
    const cli = {}
    const config = create(cli)

    assert.deepEqual(config.pages, [])
  })

  test('config - output', async () => {
    const pages = 'app/**/*.js'
    const output = 'dist'
    const cli = { pages, output }
    const config = create(cli)

    assert(config.output.includes(output))
    assert(path.isAbsolute(config.output))
  })

  test('config - assets', async () => {
    const pages = 'app/**/*.js'
    const output = 'dist'
    const assets = 'assets'
    const cli = { pages, output, assets }
    const config = create(cli)

    assert(config.assets.includes(assets))
    assert(path.isAbsolute(config.assets))
  })

  test('config - picks up default file if present', async () => {
    const pages = 'pages/*.js'
    const output = 'output'
    const fsx = fixtures.create({
      config: {
        url: 'presta.config.js',
        content: `export const pages = '${pages}'; export const output = '${output}'`
      }
    })

    const config = create({})

    assert(path.isAbsolute(config.configFilepath))
    assert(config.pages[0].includes(pages))
    assert(config.output.includes(output))

    fsx.cleanup()
  })

  test('config - picks up custom file if present', async () => {
    const pages = 'pages/*.js'
    const output = 'output'
    const fsx = fixtures.create({
      config: {
        url: 'presta-config.js',
        content: `export const pages = '${pages}'; export const output = '${output}'`
      }
    })

    const config = create({
      config: fsx.files.config
    })

    assert(config.configFilepath.includes(fsx.files.config))
    assert(path.isAbsolute(config.configFilepath))
    assert(config.pages[0].includes(pages))
    assert(config.output.includes(output))

    fsx.cleanup()
  })

  test('config - overriden by CLI args', async () => {
    const fsx = fixtures.create({
      config: {
        url: 'presta.config.js',
        content: `export const pages = './pages/*.js'; export const output = './output'`
      }
    })

    const config = create({
      pages: 'foo',
      output: 'dist'
    })

    assert(config.pages.find(p => p.includes('foo')))
    assert(config.output.includes('dist'))

    // should merge pages
    assert(config.pages.find(p => p.includes('pages/*.js')))

    fsx.cleanup()
  })

  test('config - file is merged with internal config', async () => {
    const fsx = fixtures.create({
      config: {
        url: 'presta.merged.config.js',
        content: `export function createContent(context) {}`
      }
    })

    const config = create({
      pages: 'foo',
      output: 'dist',
      config: fsx.files.config
    })

    assert(!!config.createContent)
    assert(config.dynamicEntryFilepath.includes(config.output))

    fsx.cleanup()
  })

  test('config - unmerge', async () => {
    const fsx = fixtures.create({
      config: {
        url: 'presta.unmerged.config.js',
        content: `
          export const pages = 'foo'
          export const output = 'output'
          export function createContent(context) {}
        `
      }
    })

    const curr = create({
      pages: 'bar',
      config: 'presta.unmerged.config.js'
    })
    const prev = require(fsx.files.config)

    assert(curr.pages.length === 2) // merged
    assert(curr.output.includes('output'))
    assert(curr.dynamicEntryFilepath.includes(curr.output))

    const unmerged = unmerge(curr, prev)

    assert(unmerged.pages.length === 1)
    assert(unmerged.pages[0].includes('bar'))
    assert(unmerged.output.includes('build'))
    assert(unmerged.dynamicEntryFilepath.includes(unmerged.output))

    fsx.cleanup()
  })
}
