const express = require('express')
const Controller = require('./user.controller')
const urls = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var userController = new Controller(options)
  router.get('/api/user/ping', userController.ping)
  urls.addTransition(router, 'user-list', urls.handleIntIdTemplate, userController.index)

  return router
}
