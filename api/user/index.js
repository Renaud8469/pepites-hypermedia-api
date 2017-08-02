const express = require('express')
const Controller = require('./user.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var userController = new Controller(options)
  router.get('/api/user/ping', userController.ping)
  urls.addTransition(router, 'user-list', transitions.handleIntIdTemplate, userController.index)

  return router
}
