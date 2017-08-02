const interceptor = require('express-interceptor')
const halFormatter = require('./hal_response')

const halInterceptor = interceptor(function(req, res) {
  return {
    isInterceptable : function() {
      return /application\/vnd\.hal\+json/.test(req.get('Accept'))
    },
    intercept: function (body, send) {
      res.set('Content-type', 'application/vnd.hal+json')
    
      let data = JSON.parse(body)
      if (data.error) {
        send(JSON.stringify(data))
      } else {
        let halResponse = halFormatter.generateHalResponse(data, req.state, req.user, req.params, req.hostname) 

        send(JSON.stringify(halResponse))
      }
    }
  }
})

module.exports = halInterceptor


