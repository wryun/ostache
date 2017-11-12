'use strict'

const fs = require('fs')
const assert = require('assert')
const {render} = require('./index')

let pass = 0
let fail = 0

for (const test of JSON.parse(fs.readFileSync('test.json'))) {
  try {
    assert.deepStrictEqual(
      render(test.template, test.parameters),
      test.result,
      test.desc)
    pass += 1
  } catch (e) {
    fail += 1
    console.log(`FAIL ${e.message} (${JSON.stringify(e.actual)} != ${JSON.stringify(e.expected)})`)
  }
}

console.log(`\nPASS: ${pass} FAIL: ${fail}`)
process.exitCode = fail
