const express = require('express')
const Controller = require('./home.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')

var router = express.Router()

module.exports = (options) => {
  var homeController = new Controller(options)
  urls.addTransition(router, 'root', transitions.handleIntIdTemplate, homeController.home)

  return router
}
