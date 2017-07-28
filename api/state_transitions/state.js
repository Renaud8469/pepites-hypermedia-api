const compose = require('composable-middleware')

function addStateToRequest(name) {
  return compose().use(function (req, res, next) {
    req.state = name
    next()
  })
}

module.exports = addStateToRequest
