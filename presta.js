#!/usr/bin/env node

process.env.PRESTA_ENV = 'development'

require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  presets: ['@babel/preset-env']
})

try {
  require('./cli')
} catch (e) {
  console.error(e)
}
