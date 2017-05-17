'use strict'

module.exports = {
  method: 'get',
  path: '/',
  handler: function (req, reply) {
    const page = require('~/pages/slash/index.marko')
    reply(page.stream(
      {
        now: new Date()
      }
    ))
  }
}