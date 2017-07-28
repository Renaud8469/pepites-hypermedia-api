const transitions = require('./transitions.json')
const urls = require('./transitions.js')
const _ = require('lodash')

function isActionable (state) {
  return function (transition) {
    return transition.accessibleFrom.indexOf(state) > -1
  }
}

function getActionableTransitions (state) {
  return _.filter(transitions, isActionable(state))
}

module.exports = {
  getActionableTransitions
}
