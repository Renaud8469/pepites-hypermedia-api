const express = require('express')
const Controller = require('./application.controller')
const urls = require('../state_transitions/transitions')
const auth = require('../auth/auth.service.js')
var router = express.Router()

module.exports = (options) => {
  var applicationController = new Controller(options)
  router.get('/api/application/ping', applicationController.ping)
  router.get('/api/application/:id/certificate', auth.isAuthenticated(), applicationController.getApplicationCertificate)
  
  urls.addTransition(router, 'application-read', urls.handleApplicationTemplate, applicationController.getApplication)
  urls.addTransition(router, 'application-create', urls.handleApplicationTemplate, applicationController.createApplication)
  urls.addTransition(router, 'application-update', urls.handleApplicationTemplate, applicationController.updateApplication)
  urls.addTransition(router, 'application-send', urls.handleApplicationTemplate, applicationController.sendApplication)
  
  return router
}
