const transitions = require('./transitions.json')
const _ = require('lodash')
const auth = require('../auth/auth.service')

// Function to add a transition to a router
function addTransition (router, name, handleTemplate, target) {
  const transition = getUrlWithMethod(name, handleTemplate)
  if (transition.authRequired) {
    switch (transition.method) {
    case 'post':
      router.post(transition.url, auth.isAuthenticated(), target)
      break
    case 'put':
      router.put(transition.url, auth.isAuthenticated(), target)
      break
    case 'delete':
      router.delete(transition.url, auth.isAuthenticated(), target)
      break
    case 'get':
    default:
      router.get(transition.url, auth.isAuthenticated(), target)
    }
  } else {
    switch (transition.method) {
    case 'post':
      router.post(transition.url, target)
      break
    case 'put':
      router.put(transition.url, target)
      break
    case 'delete':
      router.delete(transition.url, target)
      break
    case 'get':
    default:
      router.get(transition.url, target)
    }
  }
}

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

module.exports = {
  addTransition, 
  getUrl, 
  getUrlWithMethod, 
  getUrlWithId, 
  handleIntIdTemplate, 
  handleApplicationTemplate,
  handlePepiteIdTemplate,
  fillTemplateWithId
}
