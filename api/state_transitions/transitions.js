const transitions = require('./transitions.json')
const _ = require('lodash')

// Utility functions to retrieve useful info from the "state transitions" file.
function getUrl (name, handleTemplate) {
  const transition = _.find(transitions, {'rel': name})
  return transition.isUrlTemplate ? handleTemplate(transition.href) : transition.href
}

function getUrlWithMethod (name, handleTemplate) {
  const transition = _.find(transitions, {'rel': name})
  return {
    'url': transition.isUrlTemplate ? handleTemplate(transition.href) : transition.href,
    'method': transition.method,
    'authRequired': transition.authRequired
  }
}

function getUrlWithId (name, id) {
  return getUrl(name, fillTemplateWithId(id))
}

/*
 * Based on a transition and the current state, 
 * checks if a template needs to be filled with the current request params
 */
function toFillWithParams(transition, currentState) {
  for (let origin of transition.accessibleFrom) {
    if (origin.state === currentState && origin.withCurrentParams) {
      return true
    }
  }
  return false
}

// Utility functions to handle the various URL templates that can be passed. 
function handleIntIdTemplate (url) {
  return url.replace('{id}', ':id(\\d+)')
}

function handleApplicationTemplate (url) {
  return url.replace('{id}', ':id')
}

function handlePepiteIdTemplate (url) {
  return url.replace('{pepiteId}', ':pepiteId(\\d+)').replace('{id}', ':id')
}

function fillTemplateWithId (id) {
  return function (url) {
    return url.replace('{id}', id).replace('{pepiteId}', id)
  }
}

function fillTemplateWithParams (params) {
  return function (url) {
    let newUrl = url
    if (params.pepiteId) {
      newUrl = newUrl.replace('{pepiteId}', params.pepiteId)
    } 
    if (params.id) {
      newUrl = newUrl.replace('{id}', params.id)
    }
    return newUrl
  }
}

module.exports = {
  getUrl, 
  getUrlWithMethod, 
  getUrlWithId, 
  handleIntIdTemplate, 
  handleApplicationTemplate,
  handlePepiteIdTemplate,
  toFillWithParams,
  fillTemplateWithParams
}
