# cache-reduce

[![Build Status](https://secure.travis-ci.org/Gozala/cache-reduce.png)](http://travis-ci.org/Gozala/cache-reduce)

Caching for [reducible][] data structures. It can be used to cache
reducible data structures that represents expensive computation to make
subsequent reads cheap & fast. Note that `cache` won't pre-cache reducible
value, it's lazy and will start caching only on first attempt to read from
it. For pre-buffering you may use [buffer-reduce][] instead.

## Install

    npm install cache-reduce

[reducible]:https://github.com/Gozala/reducible
[buffer-reduce]:https://github.com/Gozala/buffer-reduce
