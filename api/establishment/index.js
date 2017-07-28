const express = require('express')
const Controller = require('./establishment.controller')
const urls = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var establishmentController = new Controller(options)
  router.get('/api/establishment/ping', establishmentController.ping)
  urls.addTransition(router, 'school-list', urls.handleIntIdTemplate, establishmentController.getAll)
  urls.addTransition(router, 'school-read', urls.handleIntIdTemplate, establishmentController.getEstablishment)

  return router
}
