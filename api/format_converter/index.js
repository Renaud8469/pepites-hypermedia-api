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
        self: { "href": req.hostname + self_url }
      }

      send(JSON.stringify(halResponse))
    }
  }
})

module.exports = halInterceptor


