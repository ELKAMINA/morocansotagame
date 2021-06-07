"use strict";

var buffer = require("buffer-reduce")
var reducible = require("reducible/reducible")
var reduce = require("reducible/reduce")

function cache(input) {
  var result
  return reducible(function reduceCache(next, initial) {
    return result ? reduce(result, next, initial) :
                    reduce(result = buffer(input), next, initial)
  })
}

module.exports = cache
