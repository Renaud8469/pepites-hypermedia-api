const express = require('express')
const Controller = require('./committee.controller')
const urls = require('../state_transitions/state_to_routes')
const transitions = require('../state_transitions/transitions')

var router = express.Router()
const handleTemplate = transitions.handlePepiteIdTemplate

module.exports = (options) => {
  var committeeController = new Controller(options)
  router.use('/api/pepite/:pepiteId(\\d+)', committeeController.getPepite)
  router.get('/api/pepite/:pepiteId(\\d+)/committee/ping', committeeController.ping)
  urls.addTransition(router, 'committee-list', handleTemplate, committeeController.getCommittee)
  urls.addTransition(router, 'committee-next', handleTemplate, committeeController.getNextCommittee)
  urls.addTransition(router, 'committee-create', handleTemplate, committeeController.createCommittee)
  urls.addTransition(router, 'committee-update', handleTemplate, committeeController.updateCommittee)
  urls.addTransition(router, 'committee-delete', handleTemplate, committeeController.deleteCommittee)

  return router
}
