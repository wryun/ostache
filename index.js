'use strict';

const assert = require('assert');
const mustache = require('mustache');

// Improve typeof to distinguish all JSON types
function findType (val) {
  if (val === null) {
    return 'null';
  } else if (Array.isArray(val)) {
    return 'array';
  } else {
    return typeof val;
  }
}

// Mustache's definition of truthiness (?)
function isTrue (val) {
  // 0 ? empty string? (check)
  return  !(
    val === undefined || val === false || val === null ||
    Array.isArray(val) && val.length === 0
  );
}

// Javascript is stupid.
function isEmpty (o) {
  for (const _ in o) {
    return false;
  }
  return true;
}

exports.render = render;
function render (json, context) {
  switch (findType(json)) {
    case 'string':
      return renderString(json, context);
    case 'array':
      return json.map(elem => render(elem, context));
    case 'object':
      return renderObject(json, context);
    default:
      return json;
  }
}

function renderString (s, context) {
  const match = /^{{([^}]*)}}$/.exec(s);
  if (match) {
    return context[match[1]];
  } else {
    return mustache.render(s, context);
  }
}

function renderObject (o, context) {
  const objectResult = {};
  const templateResult = {};
  let singleResult = undefined;

  for (const key of Object.keys(o)) {
    const match = /^{{(.)([^}]*)}}$/.exec(key);
    if (!match) {
      objectResult[renderString(s, context)] = render(o[key], context);
    } else {
      const [fullstr, command, variable] = match;
      const result = renderCommand(command, variable, o[key], context);
      if (findType(result) === 'object') {
        Object.assign(templateResult, result);
      } else if (result !== undefined) {
        assert.strictEqual(singleResult, undefined,
                           `templated section ${fullstr} resolves to incompatible type`);
        singleResult = result;
      }
    }
  }

  // templated vars win - should we 'merge' here?
  Object.assign(objectResult, templateResult);
  if (singleResult !== undefined) {
    assert.ok(isEmpty(objectResult),
              `${singleResult} resolves to non-object type when there are object fields at same level`);
    return singleResult;
  } else {
    return objectResult;
  }
}

function renderCommand (command, variable, contents, context) {
  switch (command) {
    case '#':
      if (isTrue(context[variable])) {
        switch (findType(context[variable])) {
          case 'object':
            return render(contents, context[variable]);
          case 'array':
            return context[variable]
              .map(newContext => render(contents, newContext));
          default:
            return render(contents, context);
        }
      }
      break;
    case '^':
      if (!isTrue(context[variable])) {
        return render(contents, context);
      }
      break;
    case '!': // it's a comment...
      break;
    default:
      assert(false, `Unknown command: ${command}`);
  }
}
