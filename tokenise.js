'use strict'

function * tokenise (s) {
  const re = /\(\(([^()\w]?)([^)]*)\)\)/g

  let index = 0
  let result
  while ((result = re.exec(s)) != null) {
    if (index < result.index) {
      yield ['string', s.slice(index, result.index)]
    }
    const [, command, word] = result
    yield [command, word]
    index = re.lastIndex
  }

  if (index < s.length) {
    yield ['string', s.slice(index, s.length)]
  }
}

module.exports = {tokenise}
