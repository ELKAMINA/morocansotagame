# buffer-reduce

[![Build Status](https://secure.travis-ci.org/Gozala/buffer-reduce.png)](http://travis-ci.org/Gozala/buffer-reduce)

Buffering for [reducible][] data structures. It can be used to pre-buffer
reducible data structures that represents expensive computation to make
subsequent reads cheap & fast. Note that `buffer`-ed reducible value won't be
lazy, as buffering start right away. For lazy buffering you may use
[cache-reduce][] instead.

## Install

    npm install buffer-reduce

[reducible]:https://github.com/Gozala/reducible
[cache-reduce]:https://github.com/Gozala/cache-reduce
