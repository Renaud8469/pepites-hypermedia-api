const express = require('express')
const Controller = require('./committeeAnswer.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions') 
var router = express.Router()

module.exports = (options) => {
  var committeeAnswerController = new Controller(options)
  router.get('/api/committeeAnswer/ping', committeeAnswerController.ping)
  urls.addTransition(router, 'application-review', transitions.handleApplicationTemplate, committeeAnswerController.updateAnswer)
  return router
}
