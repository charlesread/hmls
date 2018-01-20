'use strict'

module.exports = [
  {
    method: 'get',
    path: '/lassoTemplate',
    handler: async function () {
      const page = require('marko').load(require.resolve('../../pages/lassoTemplate/index.marko'))
      return page.stream({
        now: new Date()
      })
    }
  }
]
