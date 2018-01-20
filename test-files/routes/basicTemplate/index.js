'use strict'

module.exports = [
  {
    method: 'get',
    path: '/basicTemplate',
    handler: function () {
      const page = require('marko').load(require.resolve('../../pages/basicTemplate/index.marko'))
      return page.stream({
        num: 1
      })
    }
  }
]
