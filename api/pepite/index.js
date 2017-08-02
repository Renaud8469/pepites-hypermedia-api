const express = require('express')
const Controller = require('./pepite.controller')
const ApplicationController = require('../application/application.controller')
const auth = require('../auth/auth.service.js')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var pepiteController = new Controller(options)
  var applicationController = new ApplicationController(options)
  router.get('/api/pepite/ping', pepiteController.ping)
  router.get('/api/pepite/:id(\\d+)/application/xls', auth.isAuthenticated(true), applicationController.getPepiteApplicationsXls)
  urls.addTransition(router, 'pepite-list', transitions.handleIntIdTemplate, pepiteController.getAll)
  urls.addTransition(router, 'pepite-read', transitions.handleIntIdTemplate, pepiteController.getPepite)
  urls.addTransition(router, 'pepite-applications', transitions.handleIntIdTemplate, applicationController.getPepiteApplications)

  return router
}
