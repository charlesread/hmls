require('require-self-ref')
const path = require('path')
const should = require('chai').should()
const expect = require('chai').expect
const request = require('request')

const HMLS = require('~/index')

describe('HMLS creation', function () {
  let vc

  before(function () {
    vc = new HMLS(
      {
        routesPath: path.join(__dirname, '..', 'test-files', 'routes'),
        assetsPath: path.join(__dirname, '..', 'test-files', 'assets')
      }
    )
  })

  it('vc should not be undefined', function () {
    vc.should.not.be.undefined
  })

  it('vc should have server and lasso properties', function () {
    vc.should.have.ownProperty('server')
    vc.should.have.ownProperty('lasso')
  })

  it('vc should initialize, emit `initialized`, and have initialized === true', function (done) {
    vc.on('initialized', function () {
      vc.initialized.should.be.true
      done()
    })
    vc.init()
  })

  it('should be able to add route', function () {
    vc.server.route(
      {
        method: 'get',
        path: '/',
        handler: function (req, reply) {
          reply('/')
        }
      }
    )
  })

  it('vc should start and emit `started`', function (done) {
    vc.on('started', function () {
      done()
    })
    vc.start()
  })

  it('/ endpoint should exist and return "/"', function (done) {
    request(
      {
        uri: 'http://localhost:8080',
        method: 'get'
      },
      function (err, response, body) {
        expect(err).to.be.null
        body.should.equal('/')
        done()
      }
    )
  })

  it('/info endpoint should exist and return "info"', function (done) {
    request(
      {
        uri: 'http://localhost:8080/info',
        method: 'get'
      },
      function (err, response, body) {
        expect(err).to.be.null
        body.should.equal('info')
        done()
      }
    )
  })

  it('/assets/linux.png endpoint should exist and return 200', function (done) {
    request(
      {
        uri: 'http://localhost:8080/assets/linux.png',
        method: 'get'
      },
      function (err, response, body) {
        expect(err).to.be.null
        response.statusCode.should.equal(200)
        done()
      }
    )
  })

  after(function () {
    vc.server.stop()
  })
})
