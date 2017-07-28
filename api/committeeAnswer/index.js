const express = require('express')
const Controller = require('./committeeAnswer.controller')
const urls = require('../state_transitions/transitions')
var router = express.Router()

module.exports = (options) => {
  var committeeAnswerController = new Controller(options)
  router.get('/api/committeeAnswer/ping', committeeAnswerController.ping)
  urls.addTransition(router, 'application-review', urls.handleApplicationTemplate, committeeAnswerController.updateAnswer)
  return router
}
