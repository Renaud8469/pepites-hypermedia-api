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

module.exports = {
  getActionableTransitions, 
  toFillWithParams
}
