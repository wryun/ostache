'use strict'

const assert = require('assert')
const tokenise = require('./tokenise').tokenise
const {isTrue, findType} = require('./common')

exports.render = render
function render (s, context) {
  return parse(tokenise(s), context).eval(context)
}

class ListNode {
  constructor () {
    this.contents = []
  }

  push (node) {
    this.contents.push(node)
  }

  eval (context) {
    return this.contents
      .map(node => node.eval(context))
      .join('')
  }
}

class SingleNode {
  constructor (token, contents) {
    this.token = token
  }
}

class ContentNode extends SingleNode {
  needsContents () {
    return true
  }

  setContents (contents) {
    this.contents = contents
  }
}

class LeafNode extends SingleNode {
  needsContents () {
    return false
  }
}

const NodesByType = {
  'string': class StringNode extends LeafNode {
    eval () {
      return this.token
    }
  },
  '!': class CommentToken extends LeafNode {
    eval () {
      return ''
    }
  },
  '': class LookupNode extends LeafNode {
    eval (context) {
      return context[this.token]
    }
  },
  '#': class HashNode extends ContentNode {
    eval (context) {
      if (!isTrue(context[this.token])) {
        return ''
      }

      switch (findType(context[this.token])) {
        case 'object':
          return this.contents.eval(context[this.token])
        case 'array':
          return context[this.token]
            .map(subcontext => this.contents.eval(subcontext))
            .join('')
        default:
          return this.contents.eval(context)
      }
    }
  },
  '^': class CaretToken extends ContentNode {
    eval (context) {
      if (isTrue(context[this.token])) {
        return ''
      } else {
        return this.contents.eval(context)
      }
    }
  }
}

function parse (tokens, context, endtoken) {
  const output = new ListNode()
  for (const [type, token] of tokens) {
    if (type === '/') {
      assert.strictEqual(
        token, endtoken,
        `expecting /${endtoken} but found /${token}`)
      return output
    }

    const node = new NodesByType[type](token)
    if (node.needsContents()) {
      node.setContents(parse(tokens, context, token))
    }
    output.push(node)
  }

  assert.strictEqual(endtoken, undefined, `missing /${endtoken}`)
  return output
}
