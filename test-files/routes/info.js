'use strict'

module.exports = [
  {
    method: 'get',
    path: '/info',
    handler: function (req, reply) {
      reply('info')
    }
  }
]