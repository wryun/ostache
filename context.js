'use strict'

const {findType} = require('./common')

exports.Context = class Context {
  constructor (context, parent) {
    this.context = context
    this.parent = parent
  }

  lookup (q) {
    let c = this.context
    for (const v of q.split('.')) {
      if (findType(c) !== 'object') {
        c = undefined
        break
      }
      c = c[v]
    }

    if (c === undefined) {
      return this.parent ? this.parent.lookup(q) : c
    } else {
      return c
    }
  }
}
