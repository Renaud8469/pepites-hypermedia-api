const supertest = require('supertest')
const Server = require('../../server')
const expect = require('expect')

describe('api: home', () => {
  let app

  before(() => {
    app = new Server({ isTest: true }).getApp()
  })

  describe('When requesting /api/', () => {
    it('should return an empty object', (done) => {
      supertest(app)
        .get('/api/')
        .expect(200)
        .end((err, res) => {
          if(err) {
            return done(err)
          } 
          expect(res.body).toEqual({}, 'Not an empty response')
          done()
        })
    })
  })
})
