# O-Stache

[![Build Status](https://travis-ci.org/wryun/ostache.svg?branch=master)](https://travis-ci.org/wryun/ostache)

This is a simple adaptation of mustache templates - designed for plain text - to
structured data. Of course, you can use mustache templates to generate structured
data, but you lose the ability of JSON/YAML/etc. tools to easily validate it.

The code is currently in quickly hacked together 'proof of concept' state, has
known holes, and the tests are inadequate. Don't trust it.

## Err, XSLT?

No comment.

## Why are the tests in some weird json format?

The intent is to be able to use these tests to check the compliance of o-stache
libraries implemented in other languages.

## See also

- Googler's hyper-complex version of this: http://jsonnet.org/
- Mozillians' slightly less complex version of this: https://taskcluster.github.io/json-e/
- CloudFoundry's version abandoned due to complexity: https://github.com/mandelsoft/spiff
- Something that is really quite close to this (and if I had known...): https://selecttransform.github.io/site/

You can also use json query languages to build arbitrary structured outputs (i.e. they
can generate templates where the parameters are the input, and the query is effectively
the template). A non-exhaustive list:

- https://stedolan.github.io/jq/
- http://jmespath.org/
- http://goessner.net/articles/JsonPath/
- http://objectpath.org/


