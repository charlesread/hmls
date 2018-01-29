'use strict'

require('require-self-ref')
const Hapi = require('hapi')
const dir = require('node-dir')
const lasso = require('lasso')
const EventEmitter = require('events')
const debug = require('debug')('HMLS')
const fs = require('fs')

const _config = require('~/config')
let config

function HMLS (options) {
  config = _config(options)
  this._options = config.options
  if (!this._options.lasso || !this._options.lasso.outputDir) {
    throw config.errors.options.lasso
  }
  this.server = Hapi.server(this._options.server)
  this.lasso = lasso
  this.initialized = false
  this.started = false
}

HMLS.prototype = Object.create(EventEmitter.prototype)
HMLS.prototype.constructor = HMLS
HMLS.prototype.registerInertRoutes = async function () {
  debug('5 - registering inert')
  await this.server.register(require('inert'))
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
}

HMLS.prototype.registerRoutes = function () {
  this.emit('willRegisterRoutes')
  debug('10 - registering routes')
  return new Promise((resolve, reject) => {
    const routesPathArray = this._options.routesPath
    for (let k = 0; k < routesPathArray.length; k++) {
      try {
        fs.statSync(routesPathArray[k])
        debug('10a - route file does exist: %s', routesPathArray[k])
        dir.files(routesPathArray[k], (err, files) => {
          if (err) {
            return reject(err)
          }
          debug('10 - files for %s: %j', routesPathArray[k], files)
          for (let i = 0; i < files.length; i++) {
            debug(' registering route at %s', files[i])
            try {
              this.server.route(require(files[i]))
            } catch (err) {
              console.error(err.message)
            }
            if (i === files.length - 1 && k === routesPathArray.length - 1) {
              debug('10 - done registering routes')
              this.emit('routesRegistered')
              resolve()
            }
          }
        })
      } catch (err) {
        debug('10a - route file does NOT exist: %s', routesPathArray[k])
        return resolve()
      }
    }
  })
}

HMLS.prototype.registerIoSockets = function () {
  debug('11 - registering sockets')
  return new Promise((resolve, reject) => {
    try {
      fs.statSync(this._options.ioPath)
      debug('11a - this._options.ioPath does exist: %s', this._options.ioPath)
    } catch (err) {
      debug('11a - this._options.ioPath does NOT exist: %s', this._options.ioPath)
      return resolve()
    }
    dir.files(this._options.ioPath, (err, files) => {
      if (err) {
        return reject(err)
      }
      for (let i = 0; i < files.length; i++) {
        debug(' registering socket at %s', files[i])
        try {
          require(files[i])(this.io)
        } catch (err) {
        }
        if (i === files.length - 1) {
          resolve()
        }
      }
    })
  })
}
HMLS.prototype.init = async function () {
  this.emit('willInitialize')
  debug('1 - starting init()')
  require('marko/node-require').install()
  require('marko/compiler').defaultOptions.writeToDisk = false
  debug('2 - server.connection()')
  debug('3 - rigging socket.io')
  this.io = require('socket.io')(this.server.listener)
  debug('4 - configuring lasso')
  this.lasso.configure(this._options.lasso)
  this.initialized = true
  this.emit('initialized')
  debug('12 - returning from init()')
  return this
}

HMLS.prototype.start = async function () {
  this.emit('willStart')
  debug('13 - starting start()')
  if (this.started === true) {
    throw new Error('already started')
  }
  if (!this.initialized) {
    await this.init()
  }
  await this.registerInertRoutes()
  await this.registerRoutes()
  await this.registerIoSockets()
  await this.server.start()
  this.started = true
  this.emit('started')
  debug('14 - resolving from start()')
}

module.exports = HMLS
