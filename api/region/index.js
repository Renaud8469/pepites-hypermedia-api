const express = require('express')
const Controller = require('./region.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var regionController = new Controller(options)
  router.get('/api/region/ping', regionController.ping)
  urls.addTransition(router, 'region-list', transitions.handleIntIdTemplate, regionController.getAll)
  urls.addTransition(router, 'region-read', transitions.handleIntIdTemplate, regionController.getRegion)
  urls.addTransition(router, 'region-schools', transitions.handleIntIdTemplate, regionController.getEstablishments)
  urls.addTransition(router, 'region-pepites', transitions.handleIntIdTemplate, regionController.getPepites)

  return router
}
