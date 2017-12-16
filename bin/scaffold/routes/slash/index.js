'use strict'

module.exports = {
  method: 'get',
  path: '/',
  handler: async function (req, h) {
    const page = require('~/pages/slash/index.marko')
    return page.stream(
      {
        now: new Date()
      }
    )
  }
}