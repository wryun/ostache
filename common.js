'use strict'

// Improve typeof to distinguish all JSON types
function findType (val) {
  if (val === null) {
    return 'null'
  } else if (Array.isArray(val)) {
    return 'array'
  } else {
    return typeof val
  }
}

// Mustache's definition of truthiness (?)
function isTrue (val) {
  // 0 ? empty string? (check)
  return !(
    val === undefined || val === false || val === null ||
    (Array.isArray(val) && val.length === 0)
  )
}

// Javascript is stupid.
function isEmpty (o) {
  for (const _ in o) {
    return false
  }
  return true
}

// Deep merge into target (returning result, but potentially mutating target)
// If the source has a 'null' value, this is interpreted as a deletion.
function deepMerge (target, source) {
  if (findType(source) !== 'object' || findType(target) !== 'object') {
    return source
  }

  for (const [key, value] of Object.entries(source)) {
    if (value === null) {
      delete target[key]
    } else {
      target[key] = deepMerge(target[key], value)
    }
  }

  return target
}

module.exports = {isEmpty, isTrue, findType, deepMerge}
