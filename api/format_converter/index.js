const interceptor = require('express-interceptor')
const responseFormatter = require('../state_transitions/responses')
const transitions = require('../state_transitions/transitions')

const halInterceptor = interceptor(function(req, res) {
  return {
    isInterceptable : function() {
      return /application\/vnd\.hal\+json/.test(req.get('Accept'))
      // Temporary for testing purposes
      // return true
    },
    intercept: function (body, send) {
      res.set('Content-type', 'application/vnd.hal+json')
      
      // Retrieve the current state
      const state = req.state

      let data = JSON.parse(body)
      let halResponse = {}
      if (data instanceof Array) {
        halResponse._embedded = {}
        halResponse._embedded[state.substring(0, state.indexOf('-list'))] = data
      } else { 
        halResponse = data
      }

      // Add links
      const possible_transitions = responseFormatter.getActionableTransitions(state)
      let self_url = transitions.getUrl(state, transitions.fillTemplateWithParams(req.params))
      halResponse._links = {
        self: { href: req.hostname + self_url }
      }
      for (let transition of possible_transitions) {
        if (responseFormatter.toFillWithParams(transition, state)) {
          halResponse._links[transition.rel] = {
            href: req.hostname + transitions.fillTemplateWithParams(req.params)(transition.href)
          }
        } else {
          halResponse._links[transition.rel] = {
            href: req.hostname + transition.href
          }
          if (transition.isUrlTemplate) {
            halResponse._links[transition.rel].templated = true 
          }
        }
      }

      send(JSON.stringify(halResponse))
    }
  }
})

module.exports = halInterceptor


