const express = require('express')
const Controller = require('./home.controller')

var router = express.Router()

module.exports = (options) => {
  var homeController = new Controller(options)
  router.get('/', homeController.home)
  return router
}
