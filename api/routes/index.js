const system = require('./../system')
const application = require('./../application')
const committeeAnswer = require('./../committeeAnswer')
const pepite = require('./../pepite')
const committee = require('./../committee')
const region = require('./../region')
const establishment = require('./../establishment')
const stat = require('./../stat')
const user = require('./../user')
const auth = require('./../auth')
const home = require('./../home')

exports.configure = (app, options) => {
  app.use('/api/system', system(options))
  app.use(application(options))
  app.use(committeeAnswer(options))
  app.use(pepite(options))
  app.use(committee(options))
  app.use(region(options))
  app.use(establishment(options))
  app.use('/api/stat', stat(options))
  app.use(user(options))
  app.use(auth(options))
  app.use(home(options))
}
