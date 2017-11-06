# O-Stache

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

- https://selecttransform.github.io/site/
- https://taskcluster.github.io/json-e/
- http://jsonnet.org/
- https://github.com/mandelsoft/spiff
- https://en.wikipedia.org/wiki/XSLT

You can also use json query languages to build arbitrary structured outputs (i.e. they
can generate templates where the parameters are the input, and the query is effectively
the template). A non-exhaustive list:

- https://stedolan.github.io/jq/
- http://jmespath.org/
- http://goessner.net/articles/JsonPath/
- http://objectpath.org/

