const stateHandler = require('../state_transitions/state')
const transitions = require('../state_transitions/transitions')

/*
 * Generates a siren entity (or sub-entity) 
 * by mapping the resource properties into the entity "properties" object.
 * Also generates self links.
 */
function generateSirenEntity (resource, name, host, subEntityRel) {
  let entity = {
    class: [name]
  }
  if (subEntityRel) {
    entity.rel = [subEntityRel]
  }
  entity.properties = resource
  entity.links = [
  { rel: ['self'], href: host + transitions.getUrl(name === 'root' ? name : name + '-read', transitions.fillTemplateWithParams({ id: resource._id ? resource._id : undefined })) }
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
      sirenResponse.entities.push(generateSirenEntity({ _id: data.pepite[org]}, org, host, org + '-read'))
    }
  } else if (state === 'school-read') {
    for (let org of ['pepite', 'region']) {
      sirenResponse.entities.push(generateSirenEntity({ _id: data[org]}, org, host, org + '-read'))
    }
  }
}


function generateSirenResponse (data, state, isAuth, params, host) {
  let sirenResponse = {}
  let prevTransition = transitions.getTransition(state)
  if (data instanceof Array) {
    sirenResponse.entities = []
    for (let element of data) {
      sirenResponse.entities.push(generateSirenEntity(element, prevTransition.resource, host, state))
    }
    sirenResponse.links = [
      { rel: ['self'], href: host + transitions.getUrl(state, transitions.fillTemplateWithParams(params))}
    ]
  } else {
    sirenResponse = generateSirenEntity(data, prevTransition.resource, host)
  }
  
  addRelationships(sirenResponse, state, data, host)
  addActions(sirenResponse, isAuth, data, state, params, host)

  return sirenResponse
}

module.exports = {
  generateSirenResponse
}
