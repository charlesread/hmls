'use strict'

module.exports = {
  method: 'get',
  path: '/',
  handler: async function (req, h) {
    try {
      const page = require('~/pages/slash/index.marko')
      return page.stream(
        {
          now: new Date()
        }
      )
    } catch (err) {
      console.error(err.message)
      return err.message
    }
  }
}
