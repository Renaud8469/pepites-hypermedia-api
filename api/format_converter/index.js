const interceptor = require('express-interceptor')

const halInterceptor = interceptor(function(req, res) {
  return {
    isInterceptable : function() {
      return /application\/vnd\.hal\+json/.test(req.get('Accept'))
    },
    intercept: function (body, send) {
      res.set('Content-type', 'application/vnd.hal+json')
      let obj = JSON.parse(body)
      if (obj instanceof Array)
        obj.push({hal : 'Yep'})
      else 
        obj.hal = 'I\'m afraid I can\'t let you do that.'
      send(JSON.stringify(obj))
    }
  }
})

module.exports = halInterceptor


