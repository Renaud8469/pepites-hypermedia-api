const interceptor = require('express-interceptor')
const responseFormatter = require('../state_transitions/responses')
const transitions = require('../state_transitions/transitions')


function getSingleResourceName(name) {
  if (name[name.length -1] === 's') return name.slice(0, -1)
  else return name
}

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
      if (data.error) {
        send(JSON.stringify(data))
      } else {
        if (data instanceof Array) {
          halResponse._embedded = {}
          if (state.indexOf('-list') > -1 ) {
            halResponse._embedded[state.substring(0, state.indexOf('-list'))] = data
          } else {
            halResponse._embedded[state.substring(state.indexOf('-')+1)] = data
          }
        } else { 
          halResponse = data
        }

      // Add links
        let possible_transitions = responseFormatter.getActionableTransitions(state)
        possible_transitions = responseFormatter.filterAuthTransitions(req, possible_transitions)
        let self_url = transitions.getUrl(state, transitions.fillTemplateWithParams(req.params))
        halResponse._links = {
          self: { href: req.hostname + self_url }
        }
        const params = responseFormatter.getRelevantParams(state, req, data)
        for (let transition of possible_transitions) {
          if (responseFormatter.toFillWithParams(transition, state)) {
            halResponse._links[transition.rel] = {
              href: req.hostname + transitions.fillTemplateWithParams(params)(transition.href)
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

        // Special case for relationships between resources
        if (state === 'application-read' || state === 'application-create' || state === 'application-update') {
          halResponse._links['pepite-read'] = {
            href: transitions.getUrl('pepite-read', transitions.fillTemplateWithParams({ id: data.pepite.pepite }))
          }
          halResponse._links['region-read'] = {
            href: transitions.getUrl('region-read', transitions.fillTemplateWithParams({ id: data.pepite.region }))
          }
          halResponse._links['school-read'] = {
            href: transitions.getUrl('school-read', transitions.fillTemplateWithParams({ id: data.pepite.establishment }))
          }

        } else if (state === 'school-read') {
          halResponse._links['pepite-read'] = {
            href: transitions.getUrl('pepite-read', transitions.fillTemplateWithParams({ id: data.pepite }))
          }
          halResponse._links['region-read'] = {
            href: transitions.getUrl('region-read', transitions.fillTemplateWithParams({ id: data.region }))
          }
        }

        // Add "self" links for each embedded resource
        if (halResponse._embedded) {
          for (let resource_name in halResponse._embedded) {
            let res_list = halResponse._embedded[resource_name]
            if (resource_name !== 'committee') {
              for (let element of res_list) {
                element._links = {}
                element._links.self = {
                  href: transitions.getUrl(getSingleResourceName(resource_name) + '-read', transitions.fillTemplateWithParams({ id : element._id }))
                }
              }
            }
          }
        }


        send(JSON.stringify(halResponse))
      }
    }
  }
})

module.exports = halInterceptor


