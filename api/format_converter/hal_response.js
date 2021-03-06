const stateHandler = require('../state_transitions/state')
const transitions = require('../state_transitions/transitions')

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
function addLinksToHalResponse (halResponse, data, isAuth, state, params, host) {
  let possible_transitions = stateHandler.getActionableTransitions(isAuth, state)
  let self_url = transitions.getUrl(state, transitions.fillTemplateWithParams(params))
  halResponse._links = {
    self: { href: host + self_url }
  }
  for (let transition of possible_transitions) {
    halResponse._links[transition.rel] = {
      href: host + transitions.getUrlFromTransition(transition, state, params, data)
    }
    if (transition.isUrlTemplate) {
      halResponse._links[transition.rel].templated = true 
    }
  }
}


/*
 * Add "self" links to all resources in collections
 */
function addLinksToEmbedded (halResponse, host) {
  for (let resource_name in halResponse._embedded) {
    let res_list = halResponse._embedded[resource_name]
    if (resource_name !== 'committee') {
      for (let element of res_list) {
        element._links = {}
        element._links.self = {
          href: host + transitions.getUrl(transitions.getSingleResourceName(resource_name) + '-read', transitions.fillTemplateWithParams({ id : element._id }))
        }
      }
    }
  }
}

/*
 * Add link relations between resources 
 */
function addRelationShips (halResponse, state, data, host) {
  if (state === 'application-read' || state === 'application-create' || state === 'application-update') {
    if (data.pepite) {
      if (data.pepite.pepite) {
        halResponse._links['pepite-read'] = {
          href: host + transitions.getUrl('pepite-read', transitions.fillTemplateWithParams({ id: data.pepite.pepite }))
        }
      }
      if (data.pepite.region) {
        halResponse._links['region-read'] = {
          href: host + transitions.getUrl('region-read', transitions.fillTemplateWithParams({ id: data.pepite.region }))
        }
      }
      if (data.pepite.establishment) {
        halResponse._links['school-read'] = {
          href: host + transitions.getUrl('school-read', transitions.fillTemplateWithParams({ id: data.pepite.establishment }))
        }
      }
    }
  } else if (state === 'school-read') {
    halResponse._links['pepite-read'] = {
      href: host + transitions.getUrl('pepite-read', transitions.fillTemplateWithParams({ id: data.pepite }))
    }
    halResponse._links['region-read'] = {
      href: host + transitions.getUrl('region-read', transitions.fillTemplateWithParams({ id: data.region }))
    }
  }
}

/*
 * Generate the full HAL response using previous functions
 */
function generateHalResponse(data, state, isAuth, params, host) {
  let halResponse = createMinimalHalResponse(data, state)

  // Add links
  addLinksToHalResponse(halResponse, data, isAuth, state, params, host)

  // Special case for relationships between resources
  addRelationShips(halResponse, state, data, host)
       
  // Add "self" links for each embedded resource
  if (halResponse._embedded) {
    addLinksToEmbedded(halResponse, host)
  }
  return halResponse
}

module.exports = {
  generateHalResponse
}
