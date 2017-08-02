const express = require('express')
const Controller = require('./establishment.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var establishmentController = new Controller(options)
  router.get('/api/establishment/ping', establishmentController.ping)
  urls.addTransition(router, 'school-list', transitions.handleIntIdTemplate, establishmentController.getAll)
  urls.addTransition(router, 'school-read', transitions.handleIntIdTemplate, establishmentController.getEstablishment)

  return router
}
