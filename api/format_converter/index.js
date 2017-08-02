const interceptor = require('express-interceptor')
const responseFormatter = require('../state_transitions/responses')
const transitions = require('../state_transitions/transitions')

/*
 * Some state transitions are named with plural names and other with singular.
 * This function gets rid of unwanted plurals.
 */
function getSingleResourceName(name) {
  if (name[name.length -1] === 's') return name.slice(0, -1)
  else return name
}

/*
 * Generate a minimal HAL response from the data returned by the server.
 * It can be unmodified data, but an array has to be converted into an "_embedded" property
 */
function createMinimalHalResponse(resource, state) {
  let halResponse = {}
  if (resource instanceof Array) {
    halResponse._embedded = {}
    if (state.indexOf('-list') > -1 ) {
      halResponse._embedded[state.substring(0, state.indexOf('-list'))] = resource
    } else {
      halResponse._embedded[state.substring(state.indexOf('-')+1)] = resource
    }
  } else { 
    halResponse = resource
  }
  return halResponse
}

/*
 * Add "_links" to a response based on available state transitions
 */
function addLinksToHalResponse (req, halResponse, data) {
  let possible_transitions = responseFormatter.getActionableTransitions(req)
  let self_url = transitions.getUrl(req.state, transitions.fillTemplateWithParams(req.params))
  halResponse._links = {
    self: { href: req.hostname + self_url }
  }
  const params = responseFormatter.getRelevantParams(req, data)
  for (let transition of possible_transitions) {
    if (responseFormatter.toFillWithParams(transition, req.state)) {
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
}

/*
 * Add "self" links to all resources in collections
 */
function addLinksToEmbedded (halResponse) {
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

/*
 * Add link relations between resources 
 */
function addRelationShips (halResponse, state, data) {
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
}

/*
 * Generate the full HAL response using previous functions
 */
function generateHalResponse(data, state, req) {
  let halResponse = createMinimalHalResponse(data, state)

  // Add links
  addLinksToHalResponse(req, halResponse, data) 

  // Special case for relationships between resources
  addRelationShips(halResponse, state, data)
       
  // Add "self" links for each embedded resource
  if (halResponse._embedded) {
    addLinksToEmbedded(halResponse)
  }
  return halResponse
}


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
        let halResponse = generateHalResponse(data, req.state, req) 

        send(JSON.stringify(halResponse))
      }
    }
  }
})

module.exports = halInterceptor


