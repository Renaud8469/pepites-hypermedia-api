const express = require('express')
const Controller = require('./application.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')
const auth = require('../auth/auth.service.js')
var router = express.Router()

module.exports = (options) => {
  var applicationController = new Controller(options)
  router.get('/api/application/ping', applicationController.ping)
  router.get('/api/application/:id/certificate', auth.isAuthenticated(true), applicationController.getApplicationCertificate)
  
  urls.addTransition(router, 'application-read', transitions.handleApplicationTemplate, applicationController.getApplication)
  urls.addTransition(router, 'application-create', transitions.handleApplicationTemplate, applicationController.createApplication)
  urls.addTransition(router, 'application-update', transitions.handleApplicationTemplate, applicationController.updateApplication)
  urls.addTransition(router, 'application-send', transitions.handleApplicationTemplate, applicationController.sendApplication)
  
  return router
}
