'use strict'

require('require-self-ref')
const Hapi = require('hapi')
const dir = require('node-dir')
const lasso = require('lasso')
const EventEmitter = require('events')
const deepAssign = require('deep-assign')
const debug = require('debug')('HMLS')
const fs = require('fs')

const config = require('~/config')

async function registerInertRoutes () {
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

function registerRoutes () {
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
          } catch (err) {
            console.error(err.message)
          }
          if (i === files.length - 1) {
            resolve()
          }
        }
      })
    }
  })
}

function registerIoSockets () {
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

function HMLS (options) {
  this._options = deepAssign({}, config.options, options)
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
HMLS.prototype.init = async function () {
  debug('1 - starting init()')
  const that = this
  require('marko/node-require').install()
  require('marko/compiler').defaultOptions.writeToDisk = false
  debug('2 - server.connection()')
  debug('3 - rigging socket.io')
  that.io = require('socket.io')(that.server.listener)
  debug('4 - configuring lasso')
  that.lasso.configure(that._options.lasso)
  that.initialized = true
  that.emit('initialized')
  debug('12 - returning from init()')
  return that
}

HMLS.prototype.start = async function () {
  let that = this
  debug('13 - starting start()')
  if (that.started === true) {
    throw new Error('already started')
  }
  if (!that.initialized) {
    await that.init()
  }
  await registerInertRoutes.call(that)
  await registerRoutes.call(that)
  await registerIoSockets.call(that)
  await that.server.start()
  that.started = true
  that.emit('started')
  debug('14 - resolving from start()')
}

module.exports = HMLS
