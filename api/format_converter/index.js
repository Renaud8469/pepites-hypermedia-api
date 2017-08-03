const interceptor = require('express-interceptor')
const halFormatter = require('./hal_response')
const sirenFormatter = require('./siren_response')

const halInterceptor = interceptor(function(req, res) {
  return {
    isInterceptable : function() {
      return /application\/vnd\.hal\+json/.test(req.get('Accept'))
    },
    intercept: function (body, send) {
      res.set('Content-type', 'application/vnd.hal+json')
    
      let data
      try {
        data = JSON.parse(body)
      } catch (error) {
        send(body)
        return
      }
      if (data.error) {
        send(JSON.stringify(data))
      } else {
        let halResponse = halFormatter.generateHalResponse(data, req.state, req.user, req.params, req.hostname) 

        send(JSON.stringify(halResponse))
      }
    }
  }
})

const sirenInterceptor = interceptor(function(req, res) {
  return {
    isInterceptable : function() {
      return /application\/vnd\.siren\+json/.test(req.get('Accept'))
    },
    intercept: function (body, send) {
      res.set('Content-type', 'application/vnd.siren+json')
    
      let data
      try {
        data = JSON.parse(body)
      } catch (error) {
        send(body)
        return
      }
      if (data.error) {
        send(JSON.stringify(data))
      } else {
        let sirenResponse = sirenFormatter.generateSirenResponse(data, req.state, req.user, req.params, req.hostname) 

        send(JSON.stringify(sirenResponse))
      }
    }
  }
})

module.exports = {
  halInterceptor,
  sirenInterceptor
}


