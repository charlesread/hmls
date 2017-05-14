'use strict'

const path = require('path')

module.exports = {
  options: {
    server: {
      host: 'localhost',
      port: '8080'
    },
    lasso: {
      outputDir: path.join(__dirname, '..', '..', 'static')
    },
    routesPath: path.join(__dirname, '..', '..', 'routes')
  },
  errors: {
    options: {
      lasso: new Error('could not find `lasso` or `lasso.outputDir` attributes in `options`, need `lasso.outputDir` at a minimum')
    }
  }
}