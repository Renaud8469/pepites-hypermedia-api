const stateHandler = require('../state_transitions/state')
const transitions = require('../state_transitions/transitions')

/*
 * Generates a siren entity (or sub-entity) 
 * by mapping the resource properties into the entity "properties" object.
 * Also generates self links.
 */
function generateSirenEntity (resource, name, host, subEntityRel, isList) {
  let readName = transitions.getReadTransitionName(name, isList)
  let entity = {
    class: [readName.substring(0, readName.indexOf('-read'))]
  }
  if (subEntityRel) {
    entity.rel = [subEntityRel]
  }
  entity.properties = resource
  entity.links = [
  { rel: ['self'], href: host + transitions.getUrl(readName, transitions.fillTemplateWithParams({ id: resource._id ? resource._id : undefined })) }
  ]
  return entity
}


function addActions (sirenResponse, isAuth, data, state, params, host) {
  let possible_transitions = stateHandler.getActionableTransitions(isAuth, state)
  let actions = []
  for (let transition of possible_transitions) {
    let action = {
      name: transition.rel,
      method: transition.method,
      href: host + transitions.getUrlFromTransition(transition, state, params, data)
    }
    if (transition.template) {
      action.fields = []
      for (let prop in transition.template) {
        action.fields.push({
          name: prop,
          type: transition.template[prop]
        })
      }
    }
    actions.push(action)
  }
  sirenResponse.actions = actions
}


function addRelationships (sirenResponse, state, data, host) {
  if (!sirenResponse.entities) sirenResponse.entities = []
  if (state === 'application-read' || state === 'application-create' || state === 'application-update') {
    for (let org of ['pepite', 'region', 'school']) {
      sirenResponse.entities.push(generateSirenEntity({ _id: data.pepite[org]}, org + '-read', host, org + '-read'))
    }
  } else if (state === 'school-read') {
    for (let org of ['pepite', 'region']) {
      sirenResponse.entities.push(generateSirenEntity({ _id: data[org]}, org + '-read', host, org + '-read'))
    }
  }
}


function generateSirenResponse (resource, state, isAuth, params, host) {
  let sirenResponse = {}
  if (resource instanceof Array) {
    sirenResponse.entities = []
    for (let element of resource) {
      sirenResponse.entities.push(generateSirenEntity(element, state, host, state, true))
    }
    sirenResponse.links = [
      { rel: ['self'], href: host + transitions.getUrl(state, transitions.fillTemplateWithParams(params))}
    ]
  } else {
    sirenResponse = generateSirenEntity(resource, state, host)
  }
  
  addRelationships(sirenResponse, state, resource, host)
  addActions(sirenResponse, isAuth, resource, state, params, host)

  return sirenResponse
}

module.exports = {
  generateSirenResponse
}
