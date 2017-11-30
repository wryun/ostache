'use strict'

const assert = require('assert')
const {isEmpty, isTrue, findType, deepMerge} = require('./common')
const stringTemplate = require('./stringTemplate')
const {Context} = require('./context')

exports.render = function externalRender (template, context) {
  return render(template, new Context(context))
}

function render (template, context) {
  switch (findType(template)) {
    case 'string':
      return renderString(template, context)
    case 'array':
      return template.map(elem => render(elem, context))
    case 'object':
      return renderObject(template, context)
    default:
      return template
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
  const deepMergeTemplateResult = {}
  let override
  let deepMergeOverride
  let singleResult

  for (const key of Object.keys(o)) {
    const match = /^(<?)\(\(([^()\w])([^)]*)\)\)$/.exec(key)
    if (!match) {
      objectResult[renderString(key, context)] = render(o[key], context)
    } else {
      const [fullstr, shouldDeepMerge, command, variable] = match
      const result = renderCommand(command, variable, o[key], context)
      if (findType(result) === 'object') {
        if (variable === '') {
          // If it's empty, we treat it as 'highest precedence'
          // (essentially providing an override which prevents the user
          // from setting that particular variable)
          if (shouldDeepMerge) {
            deepMergeOverride = result
          } else {
            override = result
          }
        } else if (shouldDeepMerge) {
          deepMerge(deepMergeTemplateResult, result)
        } else {
          Object.assign(templateResult, result)
        }
      } else if (result !== undefined) {
        assert.strictEqual(
          singleResult, undefined,
          `templated section ${fullstr} resolves to incompatible type`)
        singleResult = result
      }
    }
  }

  if (override !== undefined) {
    Object.assign(deepMergeTemplateResult, override)
  }

  if (deepMergeOverride !== undefined) {
    deepMerge(deepMergeTemplateResult, deepMergeOverride)
  }

  if (singleResult !== undefined) {
    assert.ok(
      isEmpty(objectResult) && isEmpty(templateResult) && isEmpty(deepMergeTemplateResult),
      `${singleResult} resolves to non-object type when there are object fields at same level`)
    return singleResult
  } else {
    Object.assign(objectResult, templateResult)
    return deepMerge(objectResult, deepMergeTemplateResult)
  }
}

function renderCommand (command, variable, contents, context) {
  if (command === '!') { // it's a comment - ignore
    return
  }

  assert.ok('#^'.includes(command), `Unknown command: ${command}`)

  // Empty variable strings are counted as true.
  const value = variable === '' || context.lookup(variable)
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
      assert.ok(false, 'Internal error')
  }
}
