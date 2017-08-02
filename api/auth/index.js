'use strict'

const express = require('express')
const passport = require('passport')
const router = express.Router()
const urls = require('../state_transitions/state_to_routes')

const transitions = require('../state_transitions/transitions')
const auth = require('./auth.service.js')
const User = require('../user/user.model')
const Controller = require('./auth.controller')

// Passport Configuration
passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

require('./passport-strategy').setup(User)

module.exports = (options) => {
  const authController = new Controller(options)
  urls.addTransition(router, 'auth', transitions.handleIntIdTemplate, authController.getToken)
  router.get('/api/auth/authProtected', auth.isAuthenticated(true), authController.ping)
  return router
}
