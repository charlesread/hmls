'use strict'

require('require-self-ref')
const Promise = require('bluebird')
const co = require('bluebird-co').co
const Hapi = require('hapi')
const dir = require('node-dir')
const lasso = require('lasso')
const EventEmitter = require('events')
const deepAssign = require('deep-assign')
const debug = require('debug')('HMLS')
const fs = require('fs')

const config = require('~/config')

function registerInertRoutes() {
  debug('5 - registering inert')
  return new Promise((resolve, reject) => {
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
    resolve()
  })
}

function registerRoutes() {
  debug('10 - registering routes')
  return new Promise((resolve, reject) => {
    try {
      fs.statSync(this._options.routesPath)
      debug('10a - this._options.routesPath does exist: %s', this._options.routesPath)
    } catch (err) {
      debug('10a - this._options.routesPath does NOT exist: %s', this._options.routesPath)
      return resolve()
    }
    if (this._options.routesPath) {
      dir.files(this._options.routesPath, (err, files) => {
        if (err) {
          return reject(err)
        }
        for (let i = 0; i < files.length; i++) {
          debug(' registering route at %s', files[i])
          try {
            this.server.route(require(files[i]))
          } catch (err) {}
          if (i === files.length - 1) {
            resolve()
          }
        }
      })
    }
  })
}

function registerIoSockets() {
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
        } catch (err) {}
        if (i === files.length - 1) {
          resolve()
        }
      }
    })
  })
}

function HMLS(options) {
  this._options = deepAssign({}, config.options, options)
  if (!this._options.lasso || !this._options.lasso.outputDir) {
    throw config.errors.options.lasso
  }
  this.server = new Hapi.Server()
  this.lasso = lasso
  this.initialized = false
  this.started = false
}

HMLS.prototype = Object.create(EventEmitter.prototype)
HMLS.prototype.constructor = HMLS
HMLS.prototype.init = function () {
  debug('1 - starting init()')
  const that = this
  return co(function *() {
    require('marko/node-require').install()
    require('marko/compiler').defaultOptions.writeToDisk = false
    debug('2 - server.connection()')
    that.server.connection(that._options.server)
    debug('3 - rigging socket.io')
    that.io = require('socket.io')(that.server.listener)
    debug('4 - configuring lasso')
    that.lasso.configure(that._options.lasso)
    yield registerInertRoutes.call(that)
    yield registerRoutes.call(that)
    yield registerIoSockets.call(that)
    that.initialized = true
    that.emit('initialized')
    debug('12 - returning from init()')
    return that
  })
}
HMLS.prototype.start = function () {
  let that = this
  debug('13 - starting start()')
  return co(function *() {
    if (that.started === true) {
      throw new Error('already started')
    }
    if (!that.initialized) {
      yield that.init()
    }
    yield (function () {
      return new Promise((resolve, reject) => {
        that.server.start((err) => {
          if (err) {
            reject(err)
          }
          that.started = true
          that.emit('started')
          debug('14 - resolving from start()')
          resolve(that)
        })
      })
    })();
  })
}

module.exports = HMLS
