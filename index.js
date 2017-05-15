'use strict'

require('require-self-ref')
const Promise = require('bluebird')
const Hapi = require('hapi')
const dir = require('node-dir')
require('marko/node-require').install()
require('marko/compiler').defaultOptions.writeToDisk = false
const lasso = require('lasso')
const EventEmitter = require('events')
const deepAssign = require('deep-assign')
const debug = require('debug')('HMLS')

const config = require('~/config')

function HMLS (options) {
  this._options = deepAssign({}, config.options, options)
  if (!this._options.lasso || !this._options.lasso.outputDir) {
    throw config.errors.options.lasso
  }
  this.server = new Hapi.Server()
  this.lasso = lasso
  this.initialized = false
}

HMLS.prototype = Object.create(EventEmitter.prototype)
HMLS.prototype.constructor = HMLS
HMLS.prototype.init = function () {
  debug('1 - starting init()')
  return new Promise((resolve, reject) => {
    try {
      debug('2 - server.connection()')
      this.server.connection(this._options.server)
      debug('3 - rigging socket.io')
      this.io = require('socket.io')(this.server.listener)
      debug('4 - configuring lasso')
      this.lasso.configure(this._options.lasso)
      debug('5 - registering inert')
      this.server.register(require('inert'), (err) => {
        if (err) {
          return reject(err)
        }
        debug('6 - static folder, start')
        // serve static folder
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
          debug('7 - static folder, end')
        }
        debug('8 - assets folder, start')
        // serve assets folder
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
          debug('9 - assets folder, end')
        }
      })
      debug('10 - registering routes')
      // if a routes path is specified add all routes
      if (this._options.routesPath) {
        dir.files(this._options.routesPath, (err, files) => {
          if (err) {
            return reject(err)
          }
          for (let i = 0; i < files.length; i++) {
            debug(' registering route at %s', files[i])
            this.server.route(require(files[i]))
          }
        })
      }
      debug('11 - registering sockets')
      // add all socket.io files
      dir.files(this._options.ioPath, (err, files) => {
        if (err) {
          return reject(err)
        }
        for (let i = 0; i < files.length; i++) {
          debug(' registering socket at %s', files[i])
          require(files[i])(this.io)
        }
      })
      this.initialized = true
      this.emit('initialized')
      debug('12 - resolving from init()')
      resolve(this)
    } catch (err) {
      reject(err)
    }
  })
}
HMLS.prototype.start = function () {
  debug('13 - starting start()')
  return new Promise((resolve, reject) => {
    if (!this.initialized) {
      this.init()
      // return reject(new Error('not yet initialized, call HMLS.init() before HMLS.start()'))
    }
    this.server.start((err) => {
      if (err) {
        return reject(err)
      }
      this.emit('started')
      debug('14 - resolving from start()')
      resolve(this)
    })
  })
}

module.exports = HMLS
