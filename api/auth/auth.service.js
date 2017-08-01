'use strict'

var config = require('../config')
var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')
var compose = require('composable-middleware')
var User = require('../user/user.model')
var validateJwt = expressJwt({ secret: config.secrets.session })
var UnauthorizedError = require('express-jwt/lib/errors/UnauthorizedError')


/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated(authRequired) {
  return compose()

    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token
      }
      validateJwt(req, res, passToNext(authRequired, next))
    })

    // Attach user to request
    .use(function(req, res, next) {
      if (req.user) {
        User.findById(req.user._id, function(err, user) {
          if (err && authRequired) return next(err)
          if (!user && authRequired) return res.sendStatus(401)

          if (user) req.user = user
          next()
        })
      } else {
        next()
      }
    })
}

/**
 * Handles error depending on if the authent is required or not. Then calls next.
 */
function passToNext(needsAuth, next) {
  if (needsAuth) {
    return next
  } else {
    return function (error) {
      if (error instanceof UnauthorizedError){
        return next()
      } else {
        return next(error)
      }
    }
  }
}


/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set')

  return compose()
    .use(isAuthenticated(true))
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next()
      } else {
        res.sendStatus(403)
      }
    })
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role, name) {
  return jwt.sign({ _id: id, role, name }, config.secrets.session, { expiresIn: 60 * 60 * 10 })
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.json(404, { message: 'Something went wrong, please try again.'})
  var token = signToken(req.user._id, req.user.role, req.user.email)
  res.cookie('token', JSON.stringify(token))
  res.redirect('/')
}

exports.isAuthenticated = isAuthenticated
exports.hasRole = hasRole
exports.signToken = signToken
exports.setTokenCookie = setTokenCookie
