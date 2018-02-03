'use strict'

const path = require('path')

const deepExtend = require('deep-extend')
const type = require('type-detect')

const projectRoot = path.join(__dirname, '..', '..')

let _config = {
  options: {
    server: {
      host: 'localhost',
      port: '8080'
    },
    lasso: {
      outputDir: path.join(projectRoot, 'static'),
      plugins: ['lasso-marko', 'lasso-less']
    },
    projectRoot,
    routesPath: [path.join(projectRoot, 'routes')],
    assetsPath: [path.join(projectRoot, 'assets')],
    ioPath: path.join(projectRoot, 'io')
  },
  errors: {
    options: {
      lasso: new Error('could not find `lasso` or `lasso.outputDir` attributes in `options`, need `lasso.outputDir` at a minimum')
    }
  }
}

module.exports = function (options) {
  if (type(options.routesPath) === 'string') {
    options.routesPath = [options.routesPath]
  }
  return deepExtend({}, _config, {options})
}
