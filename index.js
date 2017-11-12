'use strict'

const assert = require('assert')
const {isEmpty, isTrue, findType} = require('./common')
const stringTemplate = require('./stringTemplate')
const {Context} = require('./context')

exports.render = function externalRender (json, context) {
  return render(json, new Context(context))
}

function render (json, context) {
  switch (findType(json)) {
    case 'string':
      return renderString(json, context)
    case 'array':
      return json.map(elem => render(elem, context))
    case 'object':
      return renderObject(json, context)
    default:
      return json
  }
}

function renderString (s, context) {
  const match = /^\(\(([^)]*)\)\)$/.exec(s)
  if (match) {
    return context.lookup(match[1])
  } else {
    // so, this forces us to reparse the string each time we evaluate...
    // could cache, or build a proper tree for the whole thing?
    return stringTemplate.render(s, context)
  }
}

function renderObject (o, context) {
  const objectResult = {}
  const templateResult = {}
  let singleResult

  for (const key of Object.keys(o)) {
    const match = /^\(\(([^()\w])([^)]*)\)\)$/.exec(key)
    if (!match) {
      objectResult[renderString(key, context)] = render(o[key], context)
    } else {
      const [fullstr, command, variable] = match
      const result = renderCommand(command, variable, o[key], context)
      if (findType(result) === 'object') {
        Object.assign(templateResult, result)
      } else if (result !== undefined) {
        assert.strictEqual(
          singleResult, undefined,
          `templated section ${fullstr} resolves to incompatible type`)
        singleResult = result
      }
    }
  }

  if (singleResult !== undefined) {
    assert.ok(
      isEmpty(objectResult) && isEmpty(templateResult),
      `${singleResult} resolves to non-object type when there are object fields at same level`)
    return singleResult
  } else {
    // templated vars win - should we 'merge' here?
    Object.assign(objectResult, templateResult)
    return objectResult
  }
}

function renderCommand (command, variable, contents, context) {
  if (command === '!') { // it's a comment - ignore
    return
  }

  assert('#^'.includes(command), `Unknown command: ${command}`)

  const value = context.lookup(variable)
  const valueIsTrue = isTrue(value)

  switch (command) {
    case '#':
      if (valueIsTrue) {
        switch (findType(value)) {
          case 'object':
            return render(contents, new Context(value, context))
          case 'array':
            return value.map(elem => render(contents, new Context(elem, context)))
          default:
            return render(contents, context)
        }
      }
      break
    case '^':
      if (!valueIsTrue) {
        return render(contents, context)
      }
      break
    default: // should never happen
      assert(false, 'Internal error')
  }
}
