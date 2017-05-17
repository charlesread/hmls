'use strict'

const HMLS = require('hmls')

const vc = new HMLS()

!async function () {
  await vc.init()
  await vc.start()
  console.log('server started: %s', vc.server.info.uri)
}()
  .catch((err) => {
    console.error(err.message)
  })