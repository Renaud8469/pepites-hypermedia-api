const transitions = require('./transitions.json')
const _ = require('lodash')
const compose = require('composable-middleware')

/*
 * Add state as a request param to be passed to other middlewares
 */
function addStateToRequest(name) {
  return compose().use(function (req, res, next) {
    req.state = name
    next()
  })
}

/*
 * Checks if a state transition is actionable 
 * It depends on the current state and whether or not the user is authenticated
 */
function isActionable (isAuth, state) {
  return function (transition) {
    if (!isAuth && transition.authRequired) return false
    else { 
      for (let origin of transition.accessibleFrom) {
        if (origin.state === state) {
          return true
        }
      }
      return false
    }
  }
}

function getActionableTransitions (isAuth, state) {
  return _.filter(transitions, isActionable(isAuth, state))
}

/*
 * Get relevant params amongst a list to fill a template
 */
function getRelevantParams(state, params, body) {
  if (body._id) {
    switch (/(\w+)-/.exec(state)[0]) {
    case 'application-':
      return { id : body._id }
    case 'pepite-':
      return { pepiteId: body._id, id: body._id }
    case 'committee-':
      return { pepiteId: params.pepiteId, id: body._id }
    case 'region':
      return { id : body._id }
    default:
      break
    }
  }
  return params
}


module.exports = {
  getActionableTransitions, 
  getRelevantParams,
  addStateToRequest
}
