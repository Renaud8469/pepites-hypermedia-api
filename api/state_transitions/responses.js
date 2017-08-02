const transitions = require('./transitions.json')
const _ = require('lodash')

function isActionable (req) {
  return function (transition) {
    if (!req.user && transition.authRequired) return false
    else { 
      for (let origin of transition.accessibleFrom) {
        if (origin.state === req.state) {
          return true
        }
      }
      return false
    }
  }
}

function toFillWithParams(transition, currentState) {
  for (let origin of transition.accessibleFrom) {
    if (origin.state === currentState && origin.withCurrentParams) {
      return true
    }
  }
  return false
}


function getRelevantParams(req, body) {
  if (body._id) {
    switch (/(\w+)-/.exec(req.state)[0]) {
    case 'application-':
      return { id : body._id }
    case 'pepite-':
      return { pepiteId: body._id, id: body._id }
    case 'committee-':
      return { pepiteId: req.params.pepiteId, id: body._id }
    case 'region':
      return { id : body._id }
    default:
      break
    }
  }
  return req.params
}

function getActionableTransitions (req) {
  return _.filter(transitions, isActionable(req))
}

module.exports = {
  getActionableTransitions, 
  toFillWithParams, 
  getRelevantParams,
}
