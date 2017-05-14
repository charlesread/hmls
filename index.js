'use strict'

require('require-self-ref')
const Promise = require('bluebird')
const Hapi = require('hapi')
const dir = require('node-dir')
require('marko/node-require').install()
require('marko/compiler').defaultOptions.writeToDisk = false
const EventEmitter = require('events')
const deepAssign = require('deep-assign')

const config = require('~/config')

function HMLS(options) {
  this._options = deepAssign({}, config.options, options)
  if (!this._options.lasso || !this._options.lasso.outputDir) {
    throw config.errors.options.lasso
  }
  this._options.lasso.plugins = ['lasso-marko']
  this.server = new Hapi.Server()
  this.lasso = require('lasso')
  this.initialized = false
}

HMLS.prototype = Object.create(EventEmitter.prototype)
HMLS.prototype.constructor = HMLS
HMLS.prototype.init = function () {
  return new Promise((resolve, reject) => {
    try {
      this.server.connection(this._options.server)
      this.lasso.configure(this._options.lasso)
      this.server.register(require('inert'), (err) => {
        if (err) {
          return reject(err)
        }
        if (this._options.staticPath || this.lasso.defaultConfig.outputDir) {
          this.server.route({
            method: 'GET',
            path: '/static/{param*}',
            handler: {
              directory: {
                path: this._options.staticPath || this.lasso.defaultConfig.outputDir
              }
            }
          })
        }
        if (this._options.assetsPath) {
          this.server.route({
            method: 'GET',
            path: '/assets/{param*}',
            handler: {
              directory: {
                path: this._options.assetsPath
              }
            }
          })
        }
      })
      if (this._options.routesPath) {
        dir.files(this._options.routesPath, (err, files) => {
          if (err) {
            return reject(err)
          }
          for (let i = 0; i < files.length; i++) {
            this.server.route(require(files[i]))
          }
        })
      }
      this.initialized = true
      this.emit('initialized')
      resolve(this)
    } catch (err) {
      reject(err)
    }
  })
}
HMLS.prototype.start = function () {
  return new Promise((resolve, reject) => {
    if (!this.initialized) {
      return reject(new Error('not yet initialized, call HMLS.init() before HMLS.start()'))
    }
    this.server.start((err) => {
      if (err) {
        return reject(err)
      }
      this.emit('started')
      resolve(this)
    })
  })
}

module.exports = HMLS