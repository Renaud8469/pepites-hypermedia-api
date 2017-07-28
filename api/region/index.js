const express = require('express')
const Controller = require('./region.controller')
const urls = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var regionController = new Controller(options)
  router.get('/api/region/ping', regionController.ping)
  urls.addTransition(router, 'region-list', urls.handleIntIdTemplate, regionController.getAll)
  urls.addTransition(router, 'region-read', urls.handleIntIdTemplate, regionController.getRegion)
  urls.addTransition(router, 'region-schools', urls.handleIntIdTemplate, regionController.getEstablishments)
  urls.addTransition(router, 'region-pepites', urls.handleIntIdTemplate, regionController.getPepites)

  return router
}
