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

module.exports = {isEmpty, isTrue, findType}
