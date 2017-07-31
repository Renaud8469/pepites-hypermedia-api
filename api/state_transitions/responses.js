const transitions = require('./transitions.json')
const _ = require('lodash')

function isActionable (currentState) {
  return function (transition) {
    for (let origin of transition.accessibleFrom) {
      if (origin.state === currentState) {
        return true
      }
    }
    return false
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

function getActionableTransitions (state) {
  return _.filter(transitions, isActionable(state))
}

function getRelevantParams(state, req, body) {
  if (body._id) {
    switch (/(\w+)-/.exec(state)[0]) {
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

module.exports = {
  getActionableTransitions, 
  toFillWithParams, 
  getRelevantParams
}
