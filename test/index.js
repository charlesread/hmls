require('require-self-ref')
const should = require('chai').should()
const expect = require('chai').expect
const request = require('request')

const HMLS = require('~/index')

describe('HMLS creation', function () {
  let vc

  before(function () {
    vc = new HMLS()
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

  after(function () {
    vc.server.stop()
  })
})
