const auth = require('../auth/auth.service')
const stateHandler = require('./state')
const transitions = require('./transitions')

// Function to add a transition to a router
function addTransition (router, name, handleTemplate, target) {
  const transition = transitions.getUrlWithMethod(name, handleTemplate)
  switch (transition.method) {
  case 'post':
    router.post(transition.url, auth.isAuthenticated(transition.authRequired), stateHandler.addStateToRequest(name), target)
    break
  case 'put':
    router.put(transition.url, auth.isAuthenticated(transition.authRequired), stateHandler.addStateToRequest(name), target)
    break
  case 'delete':
    router.delete(transition.url, auth.isAuthenticated(transition.authRequired), stateHandler.addStateToRequest(name), target)
    break
  case 'get':
  default:
    router.get(transition.url, auth.isAuthenticated(transition.authRequired), stateHandler.addStateToRequest(name), target)
  }
}

module.exports = { addTransition }
