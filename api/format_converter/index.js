const interceptor = require('express-interceptor')
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
      send(JSON.stringify(halResponse))
    }
  }
})

module.exports = halInterceptor


