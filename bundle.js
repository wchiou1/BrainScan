(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"util/":6}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"_process":3,"inherits":4}],7:[function(require,module,exports){


var version="Generating color maps 3"

var canvas = document.getElementById("glcanvas");
var gl;
var imageCanvas;
var ctx;
var canvas2;
var gl2;

var mvMatrix;
var shaderProgram={};
var attributes={};
var uniforms={};
var perspectiveMatrix;
var lastShader=null;

var mouseDown=false;
var lastMouseX;
var lastMouseY;

var verticesBuffer;
var verticesColorBuffer;
var verticesIndexBuffer;
var verticesBuffer2;
var verticesColorBuffer2;
//var verticesIndexBuffer2;
var pointBuffer2=[];
var pointColorBuffer2=[];
var defaultColor;
var colorscaleList;
var dataList;

//Color stuffs
var colorMaps = [];//2d array of objects which stores the colors
var iconHeight = 50;
var iconWidth = 50;
var iconX = 50;
var iconY = 150;
var imgIconX=1080;
var imgIconY=150;
var receiveX = 200;
var receiveY = 150;
var receiveDelta = 325;
var dragIcon=-1;
var imgIndex = 0;
var mapCIndices = [0,1];
var setColorHeight = [0,0];
var inverseColorHeight = [false,false];
var iconViewOffset = 0;
var imgIconViewOffset = 0;
var iconViewWidth = 70;
var iconViewHeight = 400;
var resetIconX = 630;
var resetIconY = 10;
var scaleWidth = 400;
var scaleHeight = 100;
var screenscale=1;
var markerLocs = [] //2d array which contains the marker locations in color height
var dragMarker = -1;
var dragView=false;
var imageSet = false;
var rotCanvas2=false;
var view3D=false;
var TubesIndex=0;
var loading=0;
var colorMapDrag=-1;
var dragLab=false;

var img_data=[];
var scales=[];
var img_panels=[];
var colorIconsData=[];
var imgIconsTex=[];
var color_panels=[];
var Tubes3DList=[];
var colormapFileNames=[];
var imgFileNames=[];
var tubesFileNames=[];
var LabSpaceColor=0;

var textCanvas = document.getElementById("text");
var ctx2 = textCanvas.getContext("2d");

var targ = document.getElementById("imageCanvas");
targ.width=50;
targ.height=50;
var labDiv=document.getElementById("lab");
var modal1=document.getElementById("colorModal");
var modal2=document.getElementById("imgModal");

var min_width=1200;
var min_height=700;
var orthogonal={
	l: 0,
	r: 1200,
	t: 0,
	b: -700
};
var orthoMatrix = makeOrtho(orthogonal.l, orthogonal.r, orthogonal.b, orthogonal.t, 0.1, 100.0);

var viewports=[];

function updateViewportText(){
	var imgFileName;
	if(view3D)
		imageFileName = tubesFileNames[TubesIndex];
	else
		imageFileName = imgFileNames[imgIndex];
	var temp = canvas.height/2-20;
	ctx2.clearRect(receiveX+scaleWidth+100,0,temp,canvas.height);
	//Draw text within the view
	drawText(imageFileName,viewports[0].x+5*screenscale,viewports[0].y+12*screenscale);
	drawText(colormapFileNames[mapCIndices[0]],viewports[0].x+5*screenscale,viewports[0].y+24*screenscale);
	drawText(imageFileName,viewports[1].x+5*screenscale,viewports[1].y+12*screenscale);
	drawText(colormapFileNames[mapCIndices[1]],viewports[1].x+5*screenscale,viewports[1].y+24*screenscale);
}

function initView(){
	if(imageSet){
		return;
	}
	imageSet=true;
	if(!view3D){
		init2DView();
	}
	else{
		init3DView();
	}
	updateViewportText();
}

function moveView(x,y,lastx,lasty,vID){
	if(!view3D){
		move2DView(x,y);
	}
	else{
		Rotate3DView(x,y,lastx,lasty,vID);
	}
}
function scaleView(scalar){
	if(!view3D){
		scale2DView(scalar);
	}
	else{
		scale3DView(scalar);
	}
}

function drawView(){
	if(!view3D){
		draw2DView();
	}
	else{
		draw3DView();
	}
	//updateViewportText();
}

var viewMatrix=Matrix.I(4);//2D
function init2DView(){
	var id=imgIndex;
	viewMatrix=(Matrix.Translation($V([0, 0, -1])).ensure4x4()).x(Matrix.Diagonal([img_data[id].w, img_data[id].h, 1,1]).ensure4x4());
	moveView((viewports[0].w-img_data[id].w)/2,(img_data[id].h-viewports[0].h)/2);
}

function move2DView(x,y){
	if(imgIndex<0) return;
	viewMatrix=Matrix.Translation($V([x,y,0])).ensure4x4().x(viewMatrix);
	
}
function scale2DView(scalar){
	if(imgIndex<0) return;
	var center=[viewports[0].w/2, viewports[0].h/2];
	moveView(-center[0],center[1]);
	viewMatrix=Matrix.Diagonal([scalar,scalar,1,1]).ensure4x4().x(viewMatrix);
	moveView(center[0],-center[1]);
}

function draw2DView(){
	var ipanel=img_panels[imgIndex];
	if(ipanel==null){
		return;
	}
	if(mapCIndices[0]<scales.length){
		ipanel.changeColor(mapCIndices[0]);
		ipanel.drawInViewport(0,inverseColorHeight[0]);
	}
	if(mapCIndices[1]<scales.length){
		ipanel.changeColor(mapCIndices[1]);
		ipanel.drawInViewport(1,inverseColorHeight[1]);
	}
}

var transform3D={
	//degx:0,
	//degy:0,
	//scale:1,

	matrix: Matrix.I(4),

	drag: function(mousex,mousey,lastmouseX,lastmouseY,vID){
			if(mousex==lastmouseX&&mousey==lastmouseY)return;
			function intersect(x,y,radius){//orthogonal ray sphere intersection//return intersection x,y,z ray from sphere center
				var d=$V([0,0,-1]);
				var e=$V([x,y,0]);
				var e_minus_c= e;
				var A=d.dot(d);										// A =(d·d)
				var B=d.dot(e_minus_c);								// B = d·(e−c)
				var C=e_minus_c.dot(e_minus_c)-(radius*radius);	// C = (e−c)·(e−c)−R2
				var discriminant = (B*B)-(A*C);
				if(discriminant>0){//2 intersections
					//var t1,t2,t;
					//t1= (-B+Math.sqrt(discriminant))/A;
					var t2= (-B-Math.sqrt(discriminant))/A;
					//t=Math.min(t1,t2);
					return e.add(d.x(t2));
				}
				else{//on edge or outside sphere
					return e;//.toUnitVector().x(radius);
				}
			}
			var left=viewports[vID].x;
			var top=viewports[vID].y;
			var w=viewports[vID].w;
			var h=viewports[vID].h;
			var radius=Math.min(w/2,h/2);
			var centerX=left+w/2;
			var centerY=top+h/2;
			var x=mousex-centerX;
			var y=centerY-mousey;
			var lastx=lastmouseX-centerX;
			var lasty=centerY-lastmouseY;
			var ray1=intersect(lastx,lasty,radius).toUnitVector();
			var ray2=intersect(x,y,radius).toUnitVector();

			var unit_x=$V([1,0,0]);
			var unit_y=$V([0,1,0]);
			var unit_z=$V([0,0,1]);
			var vv= ray1.cross(ray2).toUnitVector();//axis
			var ww=ray1;
			var uu=vv.cross(ww).toUnitVector();

			var cos= ray2.dot(ray1);
			var sign=(ray2.dot(uu) > 0) ? 1 : -1;
			var sin= sign*Math.sqrt(1 - cos*cos);
			var rotateMatrix=Matrix.create([[cos,0,sin,0],[0,1,0,0], [-sin,0,cos,0], [0,0,0,1]]).ensure4x4();
			var newBasis=Matrix.create([[uu.e(1),uu.e(2),uu.e(3),0],
										[vv.e(1),vv.e(2),vv.e(3),0],
										[ww.e(1),ww.e(2),ww.e(3),0],
										[0,0,0,1]]).ensure4x4();

			var transformMatrix=newBasis.transpose().x(rotateMatrix).x(newBasis);
			transform3D.matrix=transformMatrix.x(transform3D.matrix);
		},
	
	scale: function(s){
		transform3D.matrix=Matrix.Diagonal([s,s,s,1]).x(transform3D.matrix);
	}
};
function init3DView(){
	transform3D.matrix=Matrix.I(4);
}

function Rotate3DView(x,y,lastx,lasty,vID){
	if(TubesIndex<0) return;
	transform3D.drag(x,y,lastx,lasty,vID);
}

function scale3DView(scalar){
	if(TubesIndex<0) return;
	transform3D.scale(scalar);
}

function draw3DView(){
	var tlist=Tubes3DList[TubesIndex];
	if(tlist==null){
		return;
	}
	if(mapCIndices[0]<scales.length){
		tlist.changeColor(mapCIndices[0]);
		tlist.drawInViewport(0,inverseColorHeight[0]);
	}
	if(mapCIndices[1]<scales.length){
		tlist.changeColor(mapCIndices[1]);
		tlist.drawInViewport(1,inverseColorHeight[1]);
	}
}

var Viewport=function(x,y,w,h){
	this.x=x|0;
	this.y=y|0;
	this.w=w|0;
	this.h=h|0;
	var self=this;
	this.ortho=makeOrtho(0, self.w, -self.h, 0, 0.1, 100.0)
	
	this.drawBorder=function(){
		var rectangle=Shape.rectangle;
		rectangle.scale(self.w+6,self.h+6);
		rectangle.move(self.x-3,self.y-3,0.5);
		rectangle.changeColor(0.0,0.0,0.0);
		rectangle.draw();
		clearRectangle(self.x,self.y+self.h,self.w,self.h);
	}
	
	this.clear=function(){
		clearRectangle(self.x,self.y+self.h,self.w,self.h);
	};
	
	this.drawBorder();
};

var ImagePanel=function(x,y,w,h,dataID,cID){
	this.x=x;
	this.y=y;
	this.z=0;
	this.w=w;
	this.h=h;
	this.id=dataID;
	this.cindex=cID;
	this.verticesBuffer=Shape.rectangle.verticesBuffer;
	this.verticesTexCoordBuffer=gl.createBuffer();
	this.texture=gl.createTexture();
	this.colormap=null;
	var self=this;
	this.scale=function(w,h){
		self.w=w;
		self.h=h;
	};
	this.move=function(x,y,z){
				self.x=x;
				self.y=-y;
				self.z=-z||0;
	};
	this.changeColor=function(cID){
				self.cindex=cID;
				if(cID==null)
					self.colormap=defaultColor;
				else
					self.colormap=color_panels[cID].texture;
	};

	//### Drop encoding to alpha channel for background
	function EncodeFloatRGBA(f){
		if(f<0) return [0,0,0,0];
		if(f>=1.0) return [255,255,255,255];
		var r = ((256*f)|0)&255;
		var g = ((65536*f)|0)&255;
		var b = ((16777216*f)|0)&255;
		//var a = ((4294967296*f)|0)&255;
		//return [r,g,b,a];
		return [r,g,b,255];
	}
	
	function EncodeImgTexture(img){
		var len=img.length;
		var array=[];
		for (var i=0;i<len;i++){
			Array.prototype.push.apply(array, EncodeFloatRGBA(img[i]));
		}
		return new Uint8Array(array);
	}
	
	this.create=
		function(dID){
				var imageWidth= img_data[self.id].w;
				var imageHeight=img_data[self.id].h;
				var image2DArray=img_data[self.id].data;
				//gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
				//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,	0,-1,0, 1,0,0, 1,-1,0]), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesTexCoordBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);
				
				gl.bindTexture(gl.TEXTURE_2D, self.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageWidth, imageHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, EncodeImgTexture(image2DArray));
				setTexParameter();
		};
	this.create(this.id);
	this.changeColor(this.cindex);
	
	this.draw= 
		function(){
			if(lastShader!=="imgShader"){
				lastShader="imgShader";
				gl.useProgram(shaderProgram.imgShader);
				gl.enableVertexAttribArray(attributes.imgShader.vertexPositionAttribute);
				gl.enableVertexAttribArray(attributes.imgShader.vertexTexCoordAttribute);
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
			gl.vertexAttribPointer(attributes.imgShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesTexCoordBuffer);
			gl.vertexAttribPointer(attributes.imgShader.vertexTexCoordAttribute, 2, gl.FLOAT, false, 0, 0);
			
			gl.uniform1i(uniforms.imgShader.uTexValLoc, 0);  // texture unit 0
			gl.uniform1i(uniforms.imgShader.uColormapLoc, 1);  // texture unit 1
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, self.texture);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, self.colormap);
			
			perspectiveMatrix = orthoMatrix;
			loadIdentity();	
			mvPushMatrix();
			mvTranslate([self.x, self.y, self.z-1.0]);
			mvScale([self.w,self.h,1]);
			setMatrixUniforms(uniforms.imgShader);
			
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			mvPopMatrix();
		};


	this.drawInViewport=function(vID,inverted){
		
		var viewp=viewports[vID];
		viewp.clear();
		gl.viewport(viewp.x, canvas.height-viewp.y-viewp.h, viewp.w, viewp.h);
	
		if(lastShader!=="imgShader"){
			lastShader="imgShader";
			gl.useProgram(shaderProgram.imgShader);
			gl.enableVertexAttribArray(attributes.imgShader.vertexPositionAttribute);
			gl.enableVertexAttribArray(attributes.imgShader.vertexTexCoordAttribute);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
		gl.vertexAttribPointer(attributes.imgShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesTexCoordBuffer);
		gl.vertexAttribPointer(attributes.imgShader.vertexTexCoordAttribute, 2, gl.FLOAT, false, 0, 0);
			
		gl.uniform1i(uniforms.imgShader.uTexValLoc, 0);  // texture unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, self.texture);
		
		
		gl.uniform1f(uniforms.imgShader.uInvertedLoc, inverted|0);
		gl.uniform1i(uniforms.imgShader.uColormapLoc, 1);  // texture unit 1

		gl.activeTexture(gl.TEXTURE1);
		if(!self.colormap)
			gl.bindTexture(gl.TEXTURE_2D, defaultColor);
		else
			gl.bindTexture(gl.TEXTURE_2D, self.colormap);
		
		//perspectiveMatrix = makeOrtho(0, viewp.w, -viewp.h, 0, 0.1, 100.0);
			
		//loadIdentity();	
		//mvPushMatrix();
		//multMatrix(viewMatrix);
		//setMatrixUniforms(uniforms.imgShader);
		
		gl.uniformMatrix4fv(uniforms.imgShader.pUniform, false, new Float32Array(viewp.ortho.flatten()));
		gl.uniformMatrix4fv(uniforms.imgShader.mvUniform, false, new Float32Array(viewMatrix.flatten()));

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		//mvPopMatrix();
		
		gl.viewport(0, 0, canvas.width, canvas.height);
	};
};

var ColorPanel= function(x,y,w,h,cID){
	this.x=x;
	this.y=y;
	this.z=0;
	this.w=w;
	this.h=h;
	this.cindex=cID;
	this.verticesBuffer=Shape.rectangle.verticesBuffer;
	this.verticesTexCoordBuffer=Shape.rectangle.verticesTexCoordBuffer;
	this.texture=gl.createTexture();
	var self=this;
	this.move=function(x,y,z){
		self.x=x;
		self.y=-y;
		self.z=-z||0;
	};
	this.scale=function(w,h){
		self.w=w;
		self.h=h;
	};
	
	function flatten(scale){
		var array=[];
		for(var i=0;i<scale.length;i++){
			array.push(Math.round(scale[i].r*255));
			array.push(Math.round(scale[i].g*255));
			array.push(Math.round(scale[i].b*255));
			array.push(255);
		}
		return new Uint8Array(array);
	}
	
	this.create= 
	function(id){
		gl.bindTexture(gl.TEXTURE_2D, self.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scales[id].length, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,flatten(scales[id]));
		setTexParameter();
	};
	this.create(cID);
	this.draw=function(inverted){
		if(lastShader!=="colormapShader"){
			lastShader="colormapShader";
			gl.useProgram(shaderProgram.colormapShader);
			gl.enableVertexAttribArray(attributes.colormapShader.vertexPositionAttribute);
			gl.enableVertexAttribArray(attributes.colormapShader.vertexTexCoordAttribute);
		}
			
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
		gl.vertexAttribPointer(attributes.colormapShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		if(inverted)
			gl.bindBuffer(gl.ARRAY_BUFFER, Shape.rectangle.invertedTexCoordBuffer);
		else
			gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesTexCoordBuffer);
		gl.vertexAttribPointer(attributes.colormapShader.vertexTexCoordAttribute, 2, gl.FLOAT, false, 0, 0);
		
		gl.uniform1i(uniforms.colormapShader.uColormapLoc, 0);  
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, self.texture);
		
		perspectiveMatrix = orthoMatrix;

		loadIdentity();
		mvPushMatrix();
		mvTranslate([self.x, self.y, self.z-1.0]);
		mvScale([self.w,self.h,1]);

		setMatrixUniforms(uniforms.colormapShader);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		mvPopMatrix();
	};
	
};


var Rectangle= function(){
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.verticesBuffer = gl.createBuffer();
	this.verticesColorBuffer = gl.createBuffer();
	this.verticesTexCoordBuffer=gl.createBuffer();
	this.invertedTexCoordBuffer=gl.createBuffer();
	var self=this;
	this.scale=function(w,h){
		self.w=w;
		self.h=h;
	};
	this.move=function(x,y,z){
		self.x=x;
		self.y=-y;
		self.z=-z||0;
	};
	
	gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,	0,-1,0,	1,0,0, 1,-1,0]), gl.STATIC_DRAW);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,1,1,	1,1,1,1, 1,1,1,1,	1,1,1,1]), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1, 0,0, 1,1, 1,0]), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, self.invertedTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1, 1,0, 0,1, 0,0]), gl.STATIC_DRAW);

	this.changeColor= function(r,g,b,a){
		if(a==undefined) a=1;
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([r,g,b,a,	r,g,b,a, r,g,b,a,	r,g,b,a]), gl.STATIC_DRAW);
	};
	this.draw= function(){
		if(lastShader!=="simple"){
			lastShader="simple";
			gl.useProgram(shaderProgram.simpleShader);
			gl.enableVertexAttribArray(attributes.simpleShader.vertexPositionAttribute);
			gl.enableVertexAttribArray(attributes.simpleShader.vertexColorAttribute);
		}


		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
		gl.vertexAttribPointer(attributes.simpleShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesColorBuffer);
		gl.vertexAttribPointer(attributes.simpleShader.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
		
		perspectiveMatrix = orthoMatrix;
		
		loadIdentity();
		mvPushMatrix();
		mvTranslate([self.x, self.y, self.z-1.0]);
		mvScale([self.w,self.h,1]);
		
		setMatrixUniforms();
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		mvPopMatrix();
	};
	this.drawWithTexture=function(texture){
		if(lastShader!=="colormapShader"){
			lastShader="colormapShader";
			gl.useProgram(shaderProgram.colormapShader);
			gl.enableVertexAttribArray(attributes.colormapShader.vertexPositionAttribute);
			gl.enableVertexAttribArray(attributes.colormapShader.vertexTexCoordAttribute);
		}
			
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
		gl.vertexAttribPointer(attributes.colormapShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesTexCoordBuffer);
		gl.vertexAttribPointer(attributes.colormapShader.vertexTexCoordAttribute, 2, gl.FLOAT, false, 0, 0);
		
		gl.uniform1i(uniforms.colormapShader.uColormapLoc, 0);  
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		perspectiveMatrix = orthoMatrix;

		loadIdentity();
		mvPushMatrix();
		mvTranslate([self.x, self.y, self.z-1.0]);
		mvScale([self.w,self.h,1]);

		setMatrixUniforms(uniforms.colormapShader);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		mvPopMatrix();
	};
};


var Tube=function(points){
	this.verticesBuffer=gl.createBuffer();
	this.verticesNormalBuffer=gl.createBuffer();
	this.verticesWeightBuffer=gl.createBuffer();
	this.verticesIndexBuffer=gl.createBuffer();
	var self=this;
	const PI=Math.PI;
	const radius=0.5;
	const numSlice=6;
	var vertices=[];
	var weights=[];
	var normals=[];
	var indices=[];
	var plen=points.length;
	this.ilen=null;
	
	//base
	var va=$V(points[0+1].position).subtract($V(points[0].position)).toUnitVector();
	if(va.e(1)!=0||va.e(2)!=0)
		var uu=va.cross($V([0,0,1])).toUnitVector();
	else
		var uu=va.cross($V([0,1,0])).toUnitVector();
	var vv=va.cross(uu).toUnitVector();
		
	for(var i=0;i<numSlice;i++){
		var angle=i*2*PI/numSlice;
		
		var normal=uu.x(Math.cos(angle)).add(vv.x(Math.sin(angle)));
		var vertex=$V(points[0].position).add(normal.multiply(radius));
	
		vertices.push(Number(vertex.e(1)));
		vertices.push(Number(vertex.e(2)));
		vertices.push(Number(vertex.e(3)));
		normals.push(Number(normal.e(1)));
		normals.push(Number(normal.e(2)));
		normals.push(Number(normal.e(3)));
		weights.push(Number(points[0].magnitude));
	}
	
	//mid 
	for(var c=1;c<points.length-1;c++){
		for(var i=0;i<numSlice;i++){
			var va=$V(points[c].position).subtract($V(points[c-1].position)).toUnitVector();
			var vb=$V(points[c+1].position).subtract($V(points[c].position)).toUnitVector();
			var vc=va.add(vb).toUnitVector();
			var nidx=((c-1)*numSlice+i)*3;
			var normal=vc.cross($V([normals[nidx],normals[nidx+1],normals[nidx+2]])).cross(vc).toUnitVector();
			var vertex=$V(points[c].position).add(normal.multiply(radius));
			
			vertices.push(Number(vertex.e(1)));
			vertices.push(Number(vertex.e(2)));
			vertices.push(Number(vertex.e(3)));
			normals.push(Number(normal.e(1)));
			normals.push(Number(normal.e(2)));
			normals.push(Number(normal.e(3)));
			weights.push(Number(points[c].magnitude));
		}
	}
	//top
	for(var i=0;i<numSlice;i++){
		var c=points.length-1;
		var va=$V(points[c].position).subtract($V(points[c-1].position)).toUnitVector();
		var nidx=((c-1)*numSlice+i)*3;
		var normal=va.cross($V([normals[nidx],normals[nidx+1],normals[nidx+2]])).cross(va).toUnitVector();
		var vertex=$V(points[c].position).add(normal.multiply(radius));
		
		vertices.push(Number(vertex.e(1)));
		vertices.push(Number(vertex.e(2)));
		vertices.push(Number(vertex.e(3)));
		normals.push(Number(normal.e(1)));
		normals.push(Number(normal.e(2)));
		normals.push(Number(normal.e(3)));
		weights.push(Number(points[c].magnitude));
	}	
	
	//createIndices(plen,numSlice)
	var nx=0;
	var px=0;
	var up=true;
	while(nx<numSlice-1){
		if(indices.length>0){
			indices.pop();
			nx++;
		}
		if(up){
			for(var p=0;p<plen;p++){
				if(nx==numSlice-1){
					indices.push(p*numSlice+nx);
					indices.push(p*numSlice+0);
				}
				else{
					indices.push(p*numSlice+nx);
					indices.push(p*numSlice+nx+1);
				}
			}
			up=false;
		}
		else{
			for(var p=plen-1;p>=0;p--){
				if(nx==numSlice-1){
					indices.push(p*numSlice+nx);
					indices.push(p*numSlice+0);
				}
				else{
					indices.push(p*numSlice+nx);
					indices.push(p*numSlice+nx+1);
				}
			}
			up=true;
		}
	}
	this.ilen=indices.length;

	gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesWeightBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(weights), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.verticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
	this.draw=function(){
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesBuffer);
		gl.vertexAttribPointer(attributes.tubeShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesNormalBuffer);
		gl.vertexAttribPointer(attributes.tubeShader.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
			
		gl.bindBuffer(gl.ARRAY_BUFFER, self.verticesWeightBuffer);
		gl.vertexAttribPointer(attributes.tubeShader.vertexWeightAttribute, 1, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.verticesIndexBuffer);
		gl.drawElements(gl.TRIANGLE_STRIP, self.ilen, gl.UNSIGNED_SHORT, 0);
	};
};//Tube
	
var Tubes3D = function(text){
	this.tubes=[];
	this.boundingBox={l:null,r:null,b:null,t:null,n:null,f:null};
	this.center=null;
	this.halfDimension=null;
	this.color=0;
	var self=this;
	//SVL_Split_Tubes(text)
	var lines=text.split("\n");
	
	var numTubes=Number(lines[0]);
	if(!numTubes||numTubes<1) throw("This is not a valid svl file.");
	var i=1;
	for(var t=0;t<numTubes;t++){
		var numPoints=Number(lines[i]);
		i++;
		var points=[];
		for(var p=0;p<numPoints;p++){
			var point={};
			var lineData=lines[i].split(" ");
			var x=Number(lineData[0]);
			var y=Number(lineData[1]);
			var z=Number(lineData[2]);
			if(!this.boundingBox.l){
				this.boundingBox.l=x;
				this.boundingBox.r=x;
				this.boundingBox.b=y;
				this.boundingBox.t=y;
				this.boundingBox.n=-z;
				this.boundingBox.f=-z;
			}
			else{
				this.boundingBox.l=Math.min(this.boundingBox.l, x);
				this.boundingBox.r=Math.max(this.boundingBox.r, x);
				this.boundingBox.b=Math.min(this.boundingBox.b, y);
				this.boundingBox.t=Math.max(this.boundingBox.t, y);
				this.boundingBox.n=Math.min(this.boundingBox.n, -z);
				this.boundingBox.f=Math.max(this.boundingBox.f, -z);
			}
			point.position=[x,y,z];
			point.magnitude=1.0-Number(lineData[4]); //flip FA value for tubes as Jian requested
			points.push(point);
			i++;
		}
		this.tubes.push(new Tube(points));
	}
	
	this.center=[(this.boundingBox.l+this.boundingBox.r)/2,(this.boundingBox.t+this.boundingBox.b)/2,-(this.boundingBox.n+this.boundingBox.f)/2];
	this.halfDimension=Math.max(this.boundingBox.r-this.boundingBox.l,this.boundingBox.t-this.boundingBox.b,this.boundingBox.f-this.boundingBox.n)/2;
	this.changeColor=function(cID){
		self.color=cID;
	};
	//for thumbnail use
	this.draw=function(x,y,w,h){
		gl.viewport(x, canvas.height-y-h, w, h);
		if(lastShader!=="tubeShader"){
			lastShader="tubeShader";
			gl.useProgram(shaderProgram.tubeShader);
			gl.enableVertexAttribArray(attributes.tubeShader.vertexPositionAttribute);
			gl.enableVertexAttribArray(attributes.tubeShader.vertexNormalAttribute);
			gl.enableVertexAttribArray(attributes.tubeShader.vertexWeightAttribute);
		}
		var viewMatrix3D = Matrix.I(4);
		
		gl.uniform1i(uniforms.tubeShader.uColormapLoc, 0); 
		gl.activeTexture(gl.TEXTURE0);

		gl.bindTexture(gl.TEXTURE_2D, defaultColor);
		
		perspectiveMatrix = makeOrtho(self.center[0]-self.halfDimension,self.center[0]+self.halfDimension,self.center[1]-self.halfDimension,self.center[1]+self.halfDimension,-10000,10000);
		
		gl.uniformMatrix4fv(uniforms.tubeShader.pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
		gl.uniformMatrix4fv(uniforms.tubeShader.mvUniform, false, new Float32Array(viewMatrix3D.flatten()));
		var tlen=self.tubes.length;
		for(var i=0;i<tlen;i++){
			self.tubes[i].draw();
		}
		gl.viewport(0, 0, canvas.width, canvas.height);
	};
	this.drawInViewport=function(vID,inverted){
		var viewp=viewports[vID];
		viewp.clear();
		gl.viewport(viewp.x, canvas.height-viewp.y-viewp.h, viewp.w, viewp.h);

		if(lastShader!=="tubeShader"){
			lastShader="tubeShader";
			gl.useProgram(shaderProgram.tubeShader);
			gl.enableVertexAttribArray(attributes.tubeShader.vertexPositionAttribute);
			gl.enableVertexAttribArray(attributes.tubeShader.vertexNormalAttribute);
			gl.enableVertexAttribArray(attributes.tubeShader.vertexWeightAttribute);
		}
		
		//var radx = transform3D.degx * Math.PI / 180.0;
		//var rady = transform3D.degy * Math.PI / 180.0;
		//var s=transform3D.scale;
		//perspective
			var viewMatrix3D = Matrix.Translation($V([0,0,-self.halfDimension*2])).ensure4x4()
								.x(transform3D.matrix)
								.x(Matrix.Translation($V(this.center).x(-1)).ensure4x4());
		
			perspectiveMatrix = makePerspective(45, viewp.w/viewp.h, 0.1, 99999.9);
		
		//orthogonal
		/*
			var viewMatrix3D = //Matrix.Translation($V(this.center)).ensure4x4()
						(Matrix.RotationX(radx).ensure4x4())
						.x(Matrix.RotationY(rady).ensure4x4())
						.x(Matrix.Diagonal([s,s,s,1]).ensure4x4())
						.x(Matrix.Translation($V(this.center).x(-1)).ensure4x4());
		
			perspectiveMatrix = makeOrtho(-self.halfDimension,self.halfDimension,-self.halfDimension,self.halfDimension,-10000,10000);
		}*/
		
		gl.uniform1i(uniforms.tubeShader.uColormapLoc, 0); 
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, color_panels[self.color].texture);
		
		gl.uniformMatrix4fv(uniforms.tubeShader.pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
		gl.uniformMatrix4fv(uniforms.tubeShader.mvUniform, false, new Float32Array(viewMatrix3D.flatten()));
		gl.uniform1f(uniforms.tubeShader.uInvertedLoc, inverted|0);
		var tlen=self.tubes.length;
		for(var i=0;i<tlen;i++){
			self.tubes[i].draw();
		}
		gl.viewport(0, 0, canvas.width, canvas.height);
	};
};

var Shape={};

$(document).on('load',FileListenerInit());
$(document).ready(start);
function start() {
	console.log("version:"+version);
	canvas2 = document.getElementById("glcanvas2");
	
	var nifti = require('nifti-js')
	var ndarray = require('ndarray')
	var io = require('pex-io')
	io.loadBinary('data/Glx_digitSC_PC.nii', function (err, buffer) {
		var file = nifti.parse(buffer);
		console.log(file);
		var array = ndarray(file.data, file.sizes.slice().reverse());
		console.log(array);
	})
	
	addEventHandler(window,"resize",on_resize(resize));
	initWebGL(canvas);
	  if (gl) {
		
		document.onmousedown = handleMouseDown;
		document.onmouseup = handleMouseUp;
		document.onmousemove = 	handleMouseMove;
		addEventHandler(document,"mousewheel",MouseWheelHandler);
		// Firefox
		addEventHandler(document,"DOMMouseScroll",MouseWheelHandler);
		
		gl.clearColor(0.5, 0.5, 0.5, 1.0);  
		gl.clearDepth(1.0);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.enable(gl.DEPTH_TEST);           // Enable depth testing
		gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
		
		if(gl2){
				gl2.clearColor(0.0, 0.0, 0.0, 1.0);
				gl2.clearDepth(1.0);
				gl2.enable(gl.DEPTH_TEST);
				gl2.depthFunc(gl.LEQUAL);
		}
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		initBuffers();
		initMarkers();
		//initTextureFramebuffer(); //#not ready
		initShaders();
		initShape();
		initViewport();
		initButtons();
		initFileList();
		resize();
		readFilesOnLoad();
		//setInterval(drawScene, 15);
		drawHelpText();
	  }
		imageCanvas=document.getElementById("imageCanvas");
		ctx=imageCanvas.getContext("2d");
		resizeCanvas2(1);
		labDiv.style.left=imgIconX+30*screenscale-canvas2.width+iconViewWidth+"px";
		labDiv.style.top = imgIconY-55*screenscale+"px";
		labDiv.style.display="none";
		
}

function initFileList(){
	getFileList("data/colorscale/","scale");
	getFileList("data/image/","data");
}

function on_resize(c,t){onresize=function(){clearTimeout(t);t=setTimeout(c,100)};return c};//http://louisremi.mit-license.org/

function resize(){
	
	var newwidth = Math.max(min_width,canvas.clientWidth);
	var newheight = Math.max(min_height,canvas.clientHeight);
	if (canvas.width != newwidth || canvas.height != newheight) {
	canvas.width = newwidth;
    canvas.height = newheight;
	gl.viewport(0,0,canvas.width,canvas.height);
	var scaleX=newwidth/min_width;
	var scaleY=newheight/min_height;
	var scaleSquare=Math.min(scaleX,scaleY);
	screenscale=scaleSquare;
	var iconDim=50*scaleSquare;
    iconHeight = iconDim;
    iconWidth = iconDim;
	targ.width=iconDim;
	targ.height=iconDim;
	textCanvas.width=canvas.width;
	textCanvas.height=canvas.height;
    iconX = 50*scaleSquare;
    iconY = 150*scaleY;
    imgIconX=1080*scaleX;
    imgIconY=150*scaleY;
    receiveX = 200*scaleX;
    receiveY = 150*scaleY;
    receiveDelta = 325*scaleY;
    iconViewWidth = 70*scaleSquare;
    iconViewHeight = 400*scaleY;
    resetIconX = 630*scaleX;
    resetIconY = 10*scaleY;
    scaleWidth = 400*scaleSquare;
    scaleHeight = 100*scaleSquare;
	setView(0,canvas.width,-canvas.height,0);
	orthoMatrix = makeOrtho(orthogonal.l, orthogonal.r, orthogonal.b, orthogonal.t, 0.1, 100.0);
	initButtons();
	initViewport();
    drawScene();
	drawHelpText();
   }
	
}

function resizeCanvas2(scale){
	var left=Number(labDiv.style.left.slice(0,-2));
	var top=Number(labDiv.style.top.slice(0,-2));
	if(left+32>canvas.width){
		left=canvas.width-32;
	}
	if(top+30>canvas.height){
		labDiv.style.top=canvas.height-30+"px";
	}

	canvas2.width*=scale;
	canvas2.height*=scale;
	
	labDiv.style.width=canvas2.width+"px";
	labDiv.style.height=30+"px";
	canvas2.style.width=canvas2.width+"px";
	canvas2.style.height=canvas2.height+"px";
	labDiv.style.left=left-canvas2.width+canvas2.width/scale+"px";
	if(canvas2.height*1.1>canvas.height)
		expandLab.style.visibility="hidden";
	else
		expandLab.style.visibility="visible";
	
	if(canvas2.height/1.1<640)
		strinkLab.style.visibility="hidden";
	else
		strinkLab.style.visibility="visible";
	draw2LabSpaces();
}
function initButtons(){
	var imgbutton = document.getElementById("button1");
	var colorbutton = document.getElementById("button2");
	var tubebutton = document.getElementById("button3");
	var resetbutton = document.getElementById("button4");
	var labbutton = document.getElementById("button5");
	var modalbutton = document.getElementById("button6");
	var modalbutton2 = document.getElementById("button7");
	var invertbutton1=document.getElementById("invert1");
	var invertbutton2=document.getElementById("invert2");
	
	var offset60=60*screenscale;
	var offset30=30*screenscale;
	$(".button").width(iconViewWidth+offset60+"px").height(offset30+"px")
	.css("font-size",((12*screenscale)|0)+"px").css("line-height",offset30+"px");

	$(".fadeButton").width(32*screenscale).height(32*screenscale);

	imgbutton.style.left = imgIconX-offset30+"px";
	imgbutton.style.top = imgIconY+iconViewHeight+40*screenscale+"px";
	//imgbutton.style.width = iconViewWidth+offset60+"px";
	//imgbutton.style.height = offset30+"px";
	
	colorbutton.style.left = iconX-offset30+"px";
	colorbutton.style.top = iconY+iconViewHeight+40*screenscale+"px";
	//colorbutton.style.width = iconViewWidth+offset60+"px";
	//colorbutton.style.height = offset30+"px";
	
	tubebutton.style.left = imgIconX-offset30+"px";
	tubebutton.style.top = imgIconY+iconViewHeight+75*screenscale+"px";
	//tubebutton.style.width = iconViewWidth+offset60+"px";
	//tubebutton.style.height = offset30+"px";
	
	resetbutton.style.left = imgIconX-offset30+"px";
	resetbutton.style.top = imgIconY+iconViewHeight+110*screenscale+"px";
	//resetbutton.style.width = iconViewWidth+offset60+"px";
	//resetbutton.style.height = offset30+"px";
	
	labbutton.style.left = imgIconX-offset30+"px";
	labbutton.style.top = imgIconY-90*screenscale+"px";
	//labbutton.style.width = iconViewWidth+offset60+"px";
	//labbutton.style.height = offset30+"px";
	
	invertbutton1.style.top=receiveY+"px";
	invertbutton1.style.left=receiveX-33*screenscale+"px";
	invertbutton2.style.top=receiveY+receiveDelta+"px";
	invertbutton2.style.left=receiveX-33*screenscale+"px";
	
	var drop1  = document.getElementById('drop1');
	var drop2 = document.getElementById('drop2');
	
	drop1.style.left= imgIconX+'px';
	drop1.style.top= imgIconY+"px";
	drop1.style.width=iconViewWidth+"px";
	drop1.style.height=iconViewHeight+"px";
	drop1.style.position= 'absolute';
	
	drop2.style.left= iconX+'px';
	drop2.style.top= iconY+"px";
	drop2.style.width=iconViewWidth+"px";
	drop2.style.height=iconViewHeight+"px";
	drop2.style.position= 'absolute';

	resizeCanvas2(1);

	modalbutton.style.left = iconX-offset30+"px";
	modalbutton.style.top = iconY-55*screenscale+"px";
	//modalbutton.style.width = iconViewWidth+offset60+"px";
	//modalbutton.style.height = offset30+"px";
	
	modalbutton2.style.left = imgIconX-offset30+"px";
	modalbutton2.style.top = imgIconY-55*screenscale+"px";
	//modalbutton2.style.width = iconViewWidth+offset60+"px";
	//modalbutton2.style.height = offset30+"px";

}
function initViewport(){ 
	var temp = screenscale*min_height/2-20*screenscale;
	var x=receiveX+scaleWidth+100*(canvas.width/min_width);
	var y1=(canvas.height/2-temp)/2;
	var y2=canvas.height*0.75-temp/2;
	viewports.length=0;
	viewports.push(	new Viewport(x,y1,temp,temp));
	viewports.push(	new Viewport(x,y2,temp,temp));
	var screenshot1=document.getElementById("screenshot1");
	var screenshot2=document.getElementById("screenshot2");
	screenshot1.style.top=y1+"px";
	screenshot1.style.left=(x-35*screenscale)+"px";
	screenshot2.style.top=y2+"px";
	screenshot2.style.left=(x-35*screenscale)+"px";
}

function initBuffers(){
	verticesBuffer = gl.createBuffer();
	verticesColorBuffer = gl.createBuffer();
	verticesIndexBuffer=gl.createBuffer();
	verticesBuffer2=gl2.createBuffer();
	verticesColorBuffer2=gl2.createBuffer();
	//verticesIndexBuffer2=gl2.createBuffer();
	pointBuffer2[0]=gl2.createBuffer();
	pointColorBuffer2[0]=gl2.createBuffer();
	pointBuffer2[1]=gl2.createBuffer();
	pointColorBuffer2[1]=gl2.createBuffer();
	defaultColor=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, defaultColor);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 129, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,blackWhite(129));
	setTexParameter();
}
function blackWhite(len){
	var array=[];
	var step=255/(len-1);
	for(var i=0;i<len;i++){
		var v=step*i;
		array.push(v);
		array.push(v);
		array.push(v);
		array.push(255);
	}
	return new Uint8Array(array);
}

function initMarkers(){
	for(var i=0;i<mapCIndices.length;i++){
		markerLocs[i] = [.2,.4,.6,.8];
	}
}

function setTexParameter(){
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


function initWebGL() {
  gl = null;

  try {
    gl = canvas.getContext("experimental-webgl",{preserveDrawingBuffer: true});
  }
  catch(e) {
  }
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  
  //second gl canvas
   gl2 = null;

  try {
    gl2 = canvas2.getContext("experimental-webgl");
  }
  catch(e) {
  }
  if (!gl2) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

/////////////Not Done////////Do not use
function initTextureFramebuffer(){
	framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    Framebuffer.width = 512;
    Framebuffer.height = 512;
	thumbnailTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, thumbnailTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Framebuffer.width, Framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, Framebuffer.width, Framebuffer.height);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, thumbnailTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
//
// initShaders
// Initialize the shaders
//
function initShaders() {
	var img_vertexShader = getShader(gl, "img-shader-vs");
	var img_fragmentShader = getShader(gl, "img-shader-fs");
	shaderProgram.imgShader = gl.createProgram();
	gl.attachShader(shaderProgram.imgShader, img_vertexShader);
	gl.attachShader(shaderProgram.imgShader, img_fragmentShader);
	gl.linkProgram(shaderProgram.imgShader);
	if (!gl.getProgramParameter(shaderProgram.imgShader, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: " );
	}
	attributes.imgShader={
		vertexPositionAttribute : gl.getAttribLocation(shaderProgram.imgShader, "aVertexPosition"),
		vertexTexCoordAttribute : gl.getAttribLocation(shaderProgram.imgShader, "aVertexTexCoord")
	};
	uniforms.imgShader={
		pUniform : gl.getUniformLocation(shaderProgram.imgShader, "uPMatrix"),
		mvUniform : gl.getUniformLocation(shaderProgram.imgShader, "uMVMatrix"),
		uTexValLoc : gl.getUniformLocation(shaderProgram.imgShader, "uTexVal"),
		uColormapLoc : gl.getUniformLocation(shaderProgram.imgShader, "uColormap"),
		uInvertedLoc : gl.getUniformLocation(shaderProgram.imgShader, "uInverted")
	};
	
	var colormap_vertexShader = getShader(gl, "colormap-shader-vs");
	var colormap_fragmentShader = getShader(gl, "colormap-shader-fs");
	shaderProgram.colormapShader = gl.createProgram();
	gl.attachShader(shaderProgram.colormapShader, colormap_vertexShader);
	gl.attachShader(shaderProgram.colormapShader, colormap_fragmentShader);
	gl.linkProgram(shaderProgram.colormapShader);
	if (!gl.getProgramParameter(shaderProgram.colormapShader, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: ");
	}
	attributes.colormapShader={
		vertexPositionAttribute : gl.getAttribLocation(shaderProgram.colormapShader, "aVertexPosition"),
		vertexTexCoordAttribute : gl.getAttribLocation(shaderProgram.colormapShader, "aVertexTexCoord")
	};
	uniforms.colormapShader={
		pUniform : gl.getUniformLocation(shaderProgram.colormapShader, "uPMatrix"),
		mvUniform : gl.getUniformLocation(shaderProgram.colormapShader, "uMVMatrix"),
		uColormapLoc : gl.getUniformLocation(shaderProgram.colormapShader, "uColormap")
	};
	
	var simple_vertexShader = getShader(gl, "simple-shader-vs");
	var simple_fragmentShader = getShader(gl, "simple-shader-fs");
	shaderProgram.simpleShader = gl.createProgram();
	gl.attachShader(shaderProgram.simpleShader, simple_vertexShader);
	gl.attachShader(shaderProgram.simpleShader, simple_fragmentShader);
	gl.linkProgram(shaderProgram.simpleShader);
	if (!gl.getProgramParameter(shaderProgram.simpleShader, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: " );
	}
	attributes.simpleShader={
		vertexPositionAttribute : gl.getAttribLocation(shaderProgram.simpleShader, "aVertexPosition"),
		vertexColorAttribute : gl.getAttribLocation(shaderProgram.simpleShader, "aVertexColor")
	};
	uniforms.simpleShader={
		pUniform : gl.getUniformLocation(shaderProgram.simpleShader, "uPMatrix"),
		mvUniform : gl.getUniformLocation(shaderProgram.simpleShader, "uMVMatrix")
	};
	
	var tube_vertexShader = getShader(gl, "tube-shader-vs");
	var tube_fragmentShader = getShader(gl, "tube-shader-fs");
	shaderProgram.tubeShader = gl.createProgram();
	gl.attachShader(shaderProgram.tubeShader, tube_vertexShader);
	gl.attachShader(shaderProgram.tubeShader, tube_fragmentShader);
	gl.linkProgram(shaderProgram.tubeShader);
	if (!gl.getProgramParameter(shaderProgram.tubeShader, gl.LINK_STATUS)) {
		alert("Unable to initialize the shader program: ");
	}
	attributes.tubeShader={
		vertexPositionAttribute : gl.getAttribLocation(shaderProgram.tubeShader, "aVertexPosition"),
		vertexNormalAttribute : gl.getAttribLocation(shaderProgram.tubeShader, "aVertexNormal"),
		vertexWeightAttribute : gl.getAttribLocation(shaderProgram.tubeShader, "aVertexWeight")
	};
	uniforms.tubeShader={
		pUniform : gl.getUniformLocation(shaderProgram.tubeShader, "uPMatrix"),
		mvUniform : gl.getUniformLocation(shaderProgram.tubeShader, "uMVMatrix"),
		uColormapLoc : gl.getUniformLocation(shaderProgram.tubeShader, "uColormap"),
		uInvertedLoc : gl.getUniformLocation(shaderProgram.tubeShader, "uInverted")
	};
	//second gl 
	var simple_vertexShader2 = getShader(gl2, "simple-shader-vs");
	var simple_fragmentShader2 = getShader(gl2, "simple-shader-fs");
	shaderProgram.simpleShader2 = gl2.createProgram();
	gl2.attachShader(shaderProgram.simpleShader2, simple_vertexShader2);
	gl2.attachShader(shaderProgram.simpleShader2, simple_fragmentShader2);
	gl2.linkProgram(shaderProgram.simpleShader2);
	if (!gl2.getProgramParameter(shaderProgram.simpleShader2, gl2.LINK_STATUS)) {
		alert("Unable to initialize the shader program: " );
	}
	attributes.simpleShader2={
		vertexPositionAttribute : gl2.getAttribLocation(shaderProgram.simpleShader2, "aVertexPosition"),
		vertexColorAttribute : gl2.getAttribLocation(shaderProgram.simpleShader2, "aVertexColor")
	};
	uniforms.simpleShader2={
		pUniform : gl2.getUniformLocation(shaderProgram.simpleShader2, "uPMatrix"),
		mvUniform : gl2.getUniformLocation(shaderProgram.simpleShader2, "uMVMatrix")
	};
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.

  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.

  var theSource = "";
  var currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  // Now figure out what type of shader script we have,
  // based on its MIME type.

  var shader;

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object

  gl.shaderSource(shader, theSource);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initShape(){
	Shape.rectangle= new Rectangle();
}

function testResetButtonHit(mouseX,mouseY){
	if(mouseX>resetIconX&&mouseX<resetIconX+60){
		if(mouseY>resetIconY&&mouseY<resetIconY+20){
			return true;
		}
	}
	return false;
}

function testImageIconHit(mouseX,mouseY){
	//First test x value
	if(mouseX<imgIconX+10||mouseX>imgIconX+10+iconWidth){
		return -1;
	}
	//Test y values
	for(var i=0;i<img_data.length+Tubes3DList.length;i++){
		if(mouseY>imgIconY+10+i*(iconHeight+10)-imgIconViewOffset&&mouseY<imgIconY+10+iconHeight+i*(iconHeight+10)-imgIconViewOffset){
			return i+10000;
		}
	}
	return -1;
}

//Returns the index of the marker which is clicked on, returns -1 if none
function testMarkerHit(mouseX,mouseY){
	//Find which scale the click is on
	var scale=-1;
	for(var i=0;i<mapCIndices.length;i++){
		if(mouseY>receiveY+scaleHeight/2+receiveDelta*i&&mouseY<receiveY+scaleHeight+receiveDelta*i){
			scale=i;
			break;
		}
	}
	if(scale==-1){
		return -1;
	}
	for(var i=0;i<markerLocs[scale].length;i++){
		if(mouseX>1.0*scaleWidth*markerLocs[scale][i]-4+receiveX&&mouseX<1.0*scaleWidth*markerLocs[scale][i]+4+receiveX){
			return scale*markerLocs[0].length+i;
		}
	}
	return -1;
}

//Checks if the set color should be changed based on the click, returns -1 if click missed
function checkSetColor(mouseX,mouseY){
	for(var i=0;i<mapCIndices.length;i++){
		var tempHeight = testColorMapHit(mouseX,mouseY,i);
		if(tempHeight!=-1){
			setColorHeight[i]=tempHeight;
			return i;
		}
	}
	return -1;
}

//Returns the color height that was clicked, otherwise returns -1
function testColorMapHit(mouseX,mouseY,rindex){
	//Check if the click is within the bounds of the color map
	if(mouseX<receiveX||mouseX>=receiveX+scaleWidth){
		return -1;
	}
	if(mouseY<receiveY+receiveDelta*rindex||mouseY>receiveY+receiveDelta*rindex+scaleHeight){
		return -1;
	}
	return 1.0*(mouseX-receiveX)/scaleWidth;
}

function testIconViewHit(mouseX,mouseY){
	if(mouseX>iconX&&mouseX<iconX+iconViewWidth){
		if(mouseY>iconY&&mouseY<iconY+iconViewHeight){
			return true;
		}
	}
	return false;
}

function testImageIconViewHit(mouseX,mouseY){
	if(mouseX>imgIconX&&mouseX<imgIconX+iconViewWidth){
		if(mouseY>imgIconY&&mouseY<imgIconY+iconViewHeight){
			return true;
		}
	}
	return false;
}

//Returns the index of the receiver at the coords or -1 if there is no receiver at location
function testreceiverHit(mouseX,mouseY){
	//Receivers will always be in the same x value
	if(mouseX<receiveX-iconWidth/2||mouseX>receiveX+scaleWidth+iconWidth/2){
		return -1;
	}
	//Test y values
	for(var i=0;i<mapCIndices.length;i++){
		if(mouseY>receiveY+i*receiveDelta-iconHeight/2&&mouseY<receiveY+scaleHeight+i*receiveDelta+iconHeight/2){
			return i;
		}
	}
}

//Returns which index of the color map the icon represents or -1 if no icon was hit
function testIconHit(mouseX,mouseY){
	//First test x value
	if(mouseX<iconX+10||mouseX>iconX+10+iconWidth){
		return -1;
	}
	//Test y values
	for(var i=0;i<scales.length;i++){
		if(mouseY>iconY+10+i*(iconHeight+10)-iconViewOffset&&mouseY<iconY+10+iconHeight+i*(iconHeight+10)-iconViewOffset){
			return i;
		}
	}
	return -1;
}

//test if mouse is in image viewport
function testViewportHit(mouse){
	for(var i=0;i<viewports.length;i++){
		var viewp=viewports[i];
		if(mouse.x>viewp.x&&mouse.x<viewp.x+viewp.w&&mouse.y>viewp.y&&mouse.y<viewp.y+viewp.h){
			return i+1;
		}
	}
	return false;
	
}
function testDragLabHit(mousex,mousey){
	if(labDiv.style.display=="none") return false;
	var left=Number(labDiv.style.left.slice(0,-2));
	var top=Number(labDiv.style.top.slice(0,-2));
	if(mousex>left&&mousex<left+canvas2.width&&mousey>top&&mousey<(top+30)){
		return true;
	}
	return false;
}

function testCanvas2Hit(mouse){
	if(labDiv.style.display=="none") return false;
	var c2left=Number(labDiv.style.left.slice(0,-2));
	var c2top=Number(labDiv.style.top.slice(0,-2))+30;
	if(mouse.x>c2left&&mouse.x<(c2left+canvas2.width)&&mouse.y>c2top&&mouse.y<(c2top+canvas2.height)){
		return true;
	}
	return false;
}

//Gets the color at the specified "height" assuming first color in a map is 0.0 and last color is 1.0
function getColorHeight(cindex,height,inverse){
	if(cindex<0||cindex>=scales.length){
		//console.log("Warning: Attempted to get invalid color index("+cindex+").");
		return {'R' : 0,'G' : 0,'B' : 0};
	}
	//if(inverse)
	//	height=1.0-height;
	if(height>=1.0||height<0.0){
		console.log("Warning: Attempted to get invalid color height("+height+").");
		return {'R' : 0,'G' : 0,'B' : 0};
	}
	if(scales[cindex]==null){
		console.log("Color Height debug:"+cindex+","+scales[cindex]);
	}
	var index=Math.floor(1.0*(scales[cindex].length)*height);
	if(inverse)
		index=scales[cindex].length-index-1;
	return scales[cindex][index];
}

function getImageIconxy(iindex){
	iindex = iindex-10000;
	var tempx=imgIconX+10;
	var tempy=imgIconY+(iconHeight+10)*iindex+10;
	return [tempx,tempy];
}

function getIconxy(cindex){
	var tempx=iconX+10;
	var tempy=iconY+(iconHeight+10)*cindex+10-iconViewOffset;
	return [tempx,tempy];
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width),
	  y: Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height)
	};
}

function handleMouseDown(event){
	// assign default values for top and left properties
	if(!targ.style.left) { targ.style.left='0px'};
	if (!targ.style.top) { targ.style.top='0px'};
	if(mouseDown||modal1.style.display=="block"||modal2.style.display=="block"){
		return;
	}
	
	mouseDown=true;
	//Get the mouse x and y
	var mouse = getMousePos(canvas, event);
	var tmh=testMarkerHit(mouse.x,mouse.y);
	
	if(testCanvas2Hit(mouse)){
		rotCanvas2=true;
	}
	else if(testDragLabHit(mouse.x,mouse.y)){
		dragLab=true;
	}
	else if(dragView=testViewportHit(mouse)){
		
	}
	
	//Test if resetbutton was pressed
	/*
	else if(testResetButtonHit(mouse.x,mouse.y)&&img_panels.length!=0){
		imageSet=false;
		initView();
		drawView();
	}*/
	//Test if the icon view box was hit
	else if(testIconViewHit(mouse.x,mouse.y)){
		
		dragIcon=testIconHit(mouse.x,mouse.y);
		if(dragIcon==-1){
			dragIcon=-2;
		}
	}

	else if(testImageIconViewHit(mouse.x,mouse.y)){
		dragIcon = testImageIconHit(mouse.x,mouse.y);
		if(dragIcon==-1){
			dragIcon=-3;
		}
	}
	//Only check setting the color if the markers did not get hit
	else if(tmh==-1){
		colorMapDrag=checkSetColor(mouse.x,mouse.y);
		if(colorMapDrag!=-1)
			drawGraphs();
		//drawPanels();
		//drawMarkers();
		//drawInfoBoxes();
	}
	else{
		dragMarker=tmh;
	}
	
	if(dragIcon>=0){
		var tempxy;
		if(dragIcon<10000){
			tempxy=getIconxy(dragIcon);
			LabSpaceColor=dragIcon;
			//drawLabSpace();
			changeImage(dragIcon);
			targ.style.left=mouse.x-iconWidth/2+'px';
			targ.style.top=mouse.y-iconHeight/2+'px';
			targ.style.display="block";
		}
		else{
			var temp = dragIcon-10000;
			if(temp<img_panels.length){
				TubesIndex=-1;
				if(imgIndex<0||(img_data[imgIndex].w!=img_data[temp].w||img_data[imgIndex].h!=img_data[temp].h))
					imageSet=false;
				imgIndex=temp;
				view3D = false;
			}
			else{
				TubesIndex=temp-img_panels.length;
				imgIndex=-1;
				view3D = true;
			}
			initView();
			drawView();
			updateViewportText();
		}
		
	}
	
	lastMouseX=mouse.x;
	lastMouseY=mouse.y;
}


//Called when the mouse is released
function handleMouseUp(event){
	var mouse = getMousePos(canvas, event);
	mouseDown = false;
	if(dragIcon>=0&&dragIcon<10000){
		var receiveIndex =  testreceiverHit(mouse.x,mouse.y);
		if(receiveIndex!=-1){
			mapCIndices[receiveIndex]=dragIcon;
			drawScene();
		}
	}
	colorMapDrag=-1;
	dragIcon=-1;
	dragMarker=-1;
	clearDrag();
	rotCanvas2=false;
	dragView=false;
	dragLab=false;
}

//Called when the mouse moves
function handleMouseMove(event){
	var mouse = getMousePos(canvas, event);
	updateFilenameIndicator(mouse.x,mouse.y);
	updateImgFilenameIndicator(mouse.x,mouse.y);
	if(rotCanvas2){
		rotateT2(mouse.x-lastMouseX,lastMouseY-mouse.y);
		draw2LabSpaces();
	}
	else if(dragLab){
		var left=Number(labDiv.style.left.slice(0,-2))+(mouse.x-lastMouseX);
		var top=Number(labDiv.style.top.slice(0,-2))+(mouse.y-lastMouseY);
		if(left>-canvas2.width+32&&left<canvas.width-32)
			labDiv.style.left=left+"px";
		if(top>0&&top<canvas.height-30)
			labDiv.style.top=top+"px";
	}
	else if(dragView>0){
		if(!view3D)
			moveView(mouse.x-lastMouseX,lastMouseY-mouse.y);
		else{
			//console.log("x "+mouse.x);
			//console.log("lastx "+lastMouseX);
			moveView(mouse.x,mouse.y,lastMouseX,lastMouseY,dragView-1);
		}
		drawView();
	}
	else if(colorMapDrag!=-1){
		checkSetColor(mouse.x,mouse.y);
		drawGraphs();
	}
	else if(dragIcon==-1&&dragMarker==-1){
		return;
	}
	if(dragIcon>=0){
		targ.style.left=mouse.x-iconWidth/2+'px';
		targ.style.top=mouse.y-iconHeight/2+'px';
	}
	
	
	else if(dragIcon==-2&&iconViewHeight<scales.length*(iconHeight+10)+10){
		updateIconViewOffset(mouse.x,mouse.y);
		drawColorThumbnails();
	}
	
	else if(dragMarker!=-1){
		updateMarkerLoc(mouse.x,mouse.y);
		drawPanels();
		drawMarkers();
		drawInfoBoxes();
	}
	
	
	lastMouseX=mouse.x;
	lastMouseY=mouse.y;
	return false;
}

function MouseWheelHandler(e) {
	if(modal1.style.display=="block"||modal2.style.display=="block") return false;
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	var mouse = getMousePos(canvas,e);
	if(testCanvas2Hit(mouse)){
		if(delta>0)
			scaleT2(1.1);
		else if(delta<0)
			scaleT2(0.9);
		draw2LabSpaces();
		e.preventDefault();
		e.returnValue=false;
	}
	else if(testViewportHit(mouse)){
		if(delta>0)
			scaleView(1.1);
		else if(delta<0)
			scaleView(0.9);
		drawView();
		e.preventDefault();
		e.returnValue=false;
	}
	else if(testIconViewHit(mouse.x,mouse.y)){
		if(iconViewHeight<scales.length*(iconHeight+10)+10){
			if(delta>0)
				scrollIconView(-15);
			else if(delta<0)
				scrollIconView(15);
			drawColorThumbnails();
		}
		e.preventDefault();
		e.returnValue=false;
	}else if(testImageIconViewHit(mouse.x,mouse.y)){
		if(iconViewHeight<imgIconsTex.length*(iconHeight+10)+10){
			if(delta>0)
				scrollImageIconView(-15);
			else if(delta<0)
				scrollImageIconView(15);
			drawImgIcons();
		}
		e.preventDefault();
		e.returnValue=false;
	}
	return false;
}

function scrollImageIconView(delta){
	imgIconViewOffset = imgIconViewOffset+delta;
	var spacing=iconHeight+10;
	if(imgIconViewOffset<0){
		imgIconViewOffset=0;
	}
	else if(0<imgIconsTex.length*spacing-iconViewHeight+10&&imgIconViewOffset>imgIconsTex.length*spacing-iconViewHeight+10){
		imgIconViewOffset=imgIconsTex.length*spacing-iconViewHeight+10;
	}
}

function scrollIconView(delta){
	iconViewOffset = iconViewOffset+delta;
	var spacing=iconHeight+10;
	if(iconViewOffset<0){
		iconViewOffset=0;
	}
	else if(0<scales.length*spacing-iconViewHeight+10&&iconViewOffset>scales.length*spacing-iconViewHeight+10){
		iconViewOffset=scales.length*spacing-iconViewHeight+10;
	}
}

function updateImgFilenameIndicator(mouseX,mouseY){
	//Clear the text area where the fileName will go
	ctx2.clearRect(imgIconX-30,imgIconY-40*screenscale,600*screenscale, 45*screenscale);
	
	if(!testImageIconViewHit(mouseX,mouseY))
		return;
	//Check what fileIcon the mouse is over
	var hit=testImageIconHit(mouseX,mouseY);
	//console.log(hit);
	if(hit!=-1){
		if(hit<imgFileNames.length)
			drawText(imgFileNames[hit],imgIconX-20,imgIconY-10);
		else
			drawText(tubesFileNames[hit],imgIconX-20,imgIconY-10);
	}
}

function updateFilenameIndicator(mouseX,mouseY){
	//Clear the text area where the fileName will go
	ctx2.clearRect(iconX-30,iconY-40*screenscale,600*screenscale, 45*screenscale);
	
	if(!testIconViewHit(mouseX,mouseY))
		return;
	//Check what fileIcon the mouse is over
	var hit=testIconHit(mouseX,mouseY);
	
	if(hit!=-1){
		drawText(colormapFileNames[hit],iconX-20,iconY-10);
	}
}

function clearDrag(){
	createImage(0,0,iconWidth|0,iconHeight|0);
	targ.style.left='0px';
	targ.style.top='0px';
	targ.style.display="none";
}

function updateMarkerLoc(mouseX,mouseY){
	var dx=lastMouseX-mouseX;
	var scaleIndex = Math.floor(dragMarker/markerLocs[0].length);
	var markerIndex = dragMarker%markerLocs[0].length;
	var tempx = markerLocs[scaleIndex][markerIndex];
	tempx=tempx-dx/scaleWidth;
	
	//Edge checking
	if(tempx<0){
		tempx=0;
	}
	if(tempx>.999){
		tempx=.999;
	}
	//Checking for previous and next markers
	if(markerIndex>0&&tempx<markerLocs[scaleIndex][markerIndex-1]+.01){
		tempx=markerLocs[scaleIndex][markerIndex-1]+.01;
	}
	if(markerIndex<3&&tempx>markerLocs[scaleIndex][markerIndex+1]-.01){
		tempx=markerLocs[scaleIndex][markerIndex+1]-.01;
	}
	markerLocs[scaleIndex][markerIndex]=tempx;
}

function updateIconViewOffset(mouseX,mouseY){
	var dy=lastMouseY-mouseY;
	scrollIconView(dy);
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
	updateLoader();
	gl.clearColor(.5, .5, .5, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawImgIcons();
	viewports[0].drawBorder();
	viewports[1].drawBorder();
	
	if(img_panels.length+Tubes3DList.length!=0&&color_panels.length>0){
		//initialize and draw img in viewports
		initView();
		drawView();
		updateViewportText();
	}
	
	drawColorThumbnails();
	//drawReceiveThumbnails();
	drawPanels();
	drawGraphs();
	drawMarkers();
	drawInfoBoxes();
	//drawLine(0,0,400,400,{r:100,g:100,b:100});
	//drawResetIcon();
	draw2LabSpaces();
}

function drawHelpText(){
	//Draw notifications for drag and drop
	drawText("Drag new color maps",iconX-24*screenscale,iconY+iconViewHeight+15*screenscale);
	drawText("into the box above",iconX-20*screenscale,iconY+iconViewHeight+29*screenscale);
	
	drawText("Drag new image files",imgIconX-34*screenscale,imgIconY+iconViewHeight+15*screenscale);
	drawText("into the box above",imgIconX-30*screenscale,imgIconY+iconViewHeight+29*screenscale);
}

function drawResetIcon(){
	var rectangle=Shape.rectangle;
	rectangle.scale(60,20);
	rectangle.move(resetIconX,resetIconY,0.5);
	rectangle.changeColor(1.0,0.0,0.0);
	rectangle.draw();
	drawText("RESET",resetIconX+7,resetIconY+15);
}

function drawImgIcons(){
	
	//Draw the border for the img icons
	var rectangle=Shape.rectangle;
	
	clearRectangle(imgIconX,imgIconY+iconViewHeight,iconViewWidth,iconViewHeight);
	for(var i=0;i<imgIconsTex.length;i++){
		if((iconHeight+10)*i+10-imgIconViewOffset+iconHeight<0||(iconHeight+10)*i+10-imgIconViewOffset>iconViewHeight){
			continue;
		}
		rectangle.scale(iconWidth,iconHeight);
		rectangle.move(imgIconX+10,i*(iconHeight+10)+imgIconY+10-imgIconViewOffset,0);
		rectangle.drawWithTexture(imgIconsTex[i]);
		
	}
	drawBorder(imgIconX,imgIconY,iconViewWidth,iconViewHeight,{r:.3,g:.3,b:.3});
	
	//Clear the edges
	clearRectangle(imgIconX,imgIconY-3,iconViewWidth,iconHeight+3);
	clearRectangle(imgIconX,imgIconY+iconViewHeight+iconHeight+5,iconViewWidth,iconHeight+3);
}
function updateLoader(){
	var loader=document.getElementById("load");
	if(loading>0){
		var y = imgIconsTex.length*(iconHeight+10)+imgIconY+10-imgIconViewOffset;
		var x = imgIconX+10;
		loader.style.top=y+iconHeight*(screenscale-1)/2+"px";
		loader.style.left= x+(iconWidth-iconWidth/screenscale)/2+"px";

		loader.style.display="block";
	}
	else{
		loader.style.display="none";
	}
}
function drawLine(x,y,x2,y2,color){
	if(lastShader!=="simple"){
		lastShader="simple";
		gl.useProgram(shaderProgram.simpleShader);
		gl.enableVertexAttribArray(attributes.simpleShader.vertexPositionAttribute);
		gl.enableVertexAttribArray(attributes.simpleShader.vertexColorAttribute);
	}
	//gl.lineWidth(5);
	
	perspectiveMatrix = orthoMatrix;
	
	
	loadIdentity();
	mvPushMatrix();
	
	var thickness=1;
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x,-y,-1,	x2,-y2,-1]), gl.STATIC_DRAW);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([color.r,color.g,color.b,1,	color.r,color.g,color.b,1]), gl.STATIC_DRAW);
	/*
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,	1200,-600,0]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(attributes.simpleShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([color.r,color.g,color.b,1, color.r,color.g,color.b,1]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(attributes.simpleShader.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
*/
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1]), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.vertexAttribPointer(attributes.simpleShader.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
	gl.vertexAttribPointer(attributes.simpleShader.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	
	setMatrixUniforms();
	gl.drawArrays(gl.LINES, 0,2);
	mvPopMatrix();
}


function drawInfoBoxes(){
	var rectangle=Shape.rectangle;
	var xoffset=2*screenscale;
	var yoffset=30*screenscale;
	//Clear the area the lines go in
	clearRectangle(receiveX-5,receiveY+scaleHeight+yoffset,scaleWidth+10,yoffset+1);
	drawInfoBox(scaleWidth*.108+receiveX,receiveY+scaleHeight+yoffset,0,0,1);
	drawInfoBox(scaleWidth*.56+receiveX,receiveY+scaleHeight+yoffset,0,2,3);
	drawText("RGB:",receiveX+xoffset,receiveY+scaleHeight+(30+25)*screenscale);
	drawText("LAB:",receiveX+xoffset,receiveY+scaleHeight+(30+45)*screenscale);
	ctx2.clearRect(receiveX,receiveY,scaleWidth,scaleHeight);
	drawText(colormapFileNames[mapCIndices[0]],receiveX+10,receiveY+scaleHeight/4);
	rectangle.scale(scaleWidth*.095,75*screenscale);
	rectangle.move(receiveX,receiveY+scaleHeight+yoffset);
	rectangle.changeColor(.9,.9,.9);
	rectangle.draw();
	
	//Clear the area the lines go in
	clearRectangle(receiveX-5,receiveY+scaleHeight+yoffset+receiveDelta,scaleWidth+10,yoffset+1);
	drawInfoBox(scaleWidth*.108+receiveX,receiveY+scaleHeight+yoffset+receiveDelta,1,0,1);
	drawInfoBox(scaleWidth*.56+receiveX,receiveY+scaleHeight+yoffset+receiveDelta,1,2,3);
	drawText("RGB:",receiveX+xoffset,receiveY+scaleHeight+receiveDelta+(30+25)*screenscale);
	drawText("LAB:",receiveX+xoffset,receiveY+scaleHeight+receiveDelta+(30+45)*screenscale);
	ctx2.clearRect(receiveX,receiveY+receiveDelta,scaleWidth,scaleHeight);
	drawText(colormapFileNames[mapCIndices[1]],receiveX+10,receiveY+receiveDelta+scaleHeight/4);
	rectangle.scale(scaleWidth*.095,75*screenscale);
	rectangle.move(receiveX,receiveY+scaleHeight+receiveDelta+yoffset);
	rectangle.changeColor(.9,.9,.9);
	rectangle.draw();
	
}

function drawInfoBox(x,y,graphIndex, marker1, marker2){
	//if(mapCIndices[graphIndex]>=scales.length){
	//	return;
	//}
	var rectangle=Shape.rectangle;
	var width = scaleWidth*.44;
	var height = 75*screenscale;
	ctx2.clearRect(x,y,width,height);
	rectangle.scale(width,height);
	rectangle.move(x,y);
	rectangle.changeColor(1,1,1);
	rectangle.draw();
	
	//Draw lines to the markers
	var marker1Loc = markerLocs[graphIndex][marker1];
	var marker2Loc = markerLocs[graphIndex][marker2];
	var color1 = getColorHeight(mapCIndices[graphIndex],marker1Loc,inverseColorHeight[graphIndex]);
	var color2 = getColorHeight(mapCIndices[graphIndex],marker2Loc,inverseColorHeight[graphIndex]);
	
	drawLine(receiveX+scaleWidth*marker1Loc,receiveY+scaleHeight+receiveDelta*graphIndex,x,y,color1);
	drawLine(receiveX+scaleWidth*marker2Loc,receiveY+scaleHeight+receiveDelta*graphIndex,x+width,y,color2);
	
	//Draw color boxes
	rectangle.scale(width/2-2,6*screenscale);
	rectangle.changeColor(color1.r,color1.g,color1.b);
	rectangle.move(x+2,y+2);
	rectangle.draw();
	rectangle.changeColor(color2.r,color2.g,color2.b);
	rectangle.move(x+width/2,y+2);
	rectangle.draw();
	var xoffset=2*screenscale;
	if(mapCIndices[graphIndex]<scales.length){
		//write rgb values
		drawText(Math.round(color1.r*255)+" "+Math.round(color1.g*255)+" "+Math.round(color1.b*255),x+xoffset,y+25*screenscale);
		drawText(Math.round(color2.r*255)+" "+Math.round(color2.g*255)+" "+Math.round(color2.b*255),x+width/2+xoffset,y+25*screenscale);

		var lab1=rgb_to_lab({'R':color1.r*255, 'G':color1.g*255, 'B':color1.b*255});
		var lab2=rgb_to_lab({'R':color2.r*255, 'G':color2.g*255, 'B':color2.b*255});
		
		//write lab values
		drawText(Math.round(lab1.L)+" "+Math.round(lab1.a)+" "+Math.round(lab1.b),x+xoffset,y+45*screenscale);
		drawText(Math.round(lab2.L)+" "+Math.round(lab2.a)+" "+Math.round(lab2.b),x+width/2+xoffset,y+45*screenscale);
		
		
		var deltaE=ciede2000(lab1,lab2);
		//write ciede difference
		drawText("CIEDE2000: "+deltaE.toPrecision(9),x+xoffset,y+65*screenscale);
	}
	else{
		drawText("Error: Invalid Index",x+xoffset,y+25*screenscale);
		//drawText("invalid index",x+width/2+xoffset,y+25*screenscale);
		drawText("Was colormap removed?",x+xoffset,y+45*screenscale);
		//drawText("this colormap.",x+width/2+xoffset,y+45*screenscale);
		drawText("Please change colormap",x+xoffset,y+65*screenscale);
	}
	


}

function drawMarkers(){
	for(var i=0;i<mapCIndices.length;i++){
		for(var j=0;j<markerLocs[i].length;j++){
			drawMarker(i,markerLocs[i][j]);
		}
	}
}

function drawMarker(graphIndex,height){
	//Height is the color that is to be seen
	var tempx = receiveX+Math.floor(scaleWidth*height);
	var tempy = receiveY+scaleHeight/2+receiveDelta*graphIndex;	
	
	var rectangle=Shape.rectangle;
	rectangle.scale(3,scaleHeight/2);
	rectangle.move(tempx-3,tempy);
	rectangle.changeColor(.3,.3,.3);
	rectangle.draw();
	rectangle.move(tempx+1,tempy);
	rectangle.draw();
}

function clearText(){
	ctx2.clearRect(0,0,ctx2.canvas.width, ctx2.canvas.height);
}

function drawText(string,x,y){
	ctx2.font = ((15*screenscale)|0)+"px serif";
	ctx2.fillText(string,x,y);
}

function clearRectangle(x,y,w,h){
	gl.enable(gl.SCISSOR_TEST);
	
	gl.scissor(x,canvas.height-y,w,h);
	
	gl.clearColor(0.5,0.5,0.5,1.0);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.disable(gl.SCISSOR_TEST);

}

function drawGraphs(){
	var vscale=canvas.height/min_height;
	for(var i=0;i<mapCIndices.length;i++){
		var colorPanel=color_panels[mapCIndices[i]];
		if(colorPanel==null){
			continue;
		}
		clearRectangle(receiveX,receiveY+receiveDelta*i,scaleWidth+2,120*vscale);
		drawGraph(receiveX,receiveY+receiveDelta*i-scaleHeight*2,scaleWidth,scaleHeight*2,mapCIndices[i],setColorHeight[i],inverseColorHeight[i]);//x,y,w,h,colorID, relative position(0 to 1)
	}
}

//Abandoned
function errorCheckMapCIndices(){
	for(var i=0;i<mapCIndices.length;i++){
	if(mapCIndices[i]<0)
		mapCIndices[i]=0;
	console.log(""+i+":"+mapCIndices[i]+","+scales.length);
	while(mapCIndices[i]>=scales.length&&mapCIndices[i]>=0)
		mapCIndices[i]-=1;
	}
}
function drawPanels(){
	
	for(var i=0;i<mapCIndices.length;i++){
		var colorPanel=color_panels[mapCIndices[i]];
		clearRectangle(receiveX-10,receiveY+receiveDelta*i+scaleHeight,scaleWidth+20,scaleHeight);
		if(colorPanel==null){
			continue;
		}
		colorPanel.scale(scaleWidth,scaleHeight);
		colorPanel.move(receiveX,receiveY+receiveDelta*i);
		colorPanel.draw(inverseColorHeight[i]);
	}
}

function drawReceiveThumbnails(){
	for(var i=0;i<mapCIndices.length;i++){
		var tempy=receiveY+receiveDelta*i;
		if(mapCIndices[i]<scales.length){
			drawThumbnail(receiveX,tempy,mapCIndices[i]);
		}
	}
}

function drawBorder(x,y,w,h,color){
	var rectangle=Shape.rectangle;
	rectangle.scale(w+6,3);
	rectangle.move(x-3,y-3,-.5);
	rectangle.changeColor(color.r,color.g,color.b);
	rectangle.draw();
	rectangle.move(x-3,y+h,-.5);
	rectangle.draw();
	rectangle.scale(3,h+6);
	rectangle.move(x-3,y-3,-.5);
	rectangle.draw();
	rectangle.move(x+w,y-3,-.5);
	rectangle.draw();
}

function drawColorThumbnails(){
	
	//Erase the whole of the iconview area
	clearRectangle(iconX,iconY+iconViewHeight,iconViewWidth,iconViewHeight);
	
	//this draw colormap as thumbnails;
	for(var i=0;i<color_panels.length;i++){
		if((iconHeight+10)*i+10-iconViewOffset+iconHeight<0||(iconHeight+10)*i+10-iconViewOffset>iconViewHeight){
			continue;
		}
		drawThumbnail(iconX+10,iconY+(iconHeight+10)*i+10-iconViewOffset,i);
	}
	
	//Draw the borders
	drawBorder(iconX,iconY,iconViewWidth,iconViewHeight,{r:.3,g:.3,b:.3});
	
	//Clear the edges
	clearRectangle(iconX,iconY-3,iconViewWidth,iconHeight+3);
	clearRectangle(iconX,iconY+iconViewHeight+iconHeight+5,iconViewWidth,iconHeight+3);
}

function drawThumbnail(x,y,cindex){
	color_panels[cindex].scale(iconWidth,iconHeight);
	color_panels[cindex].move(x,y);
	color_panels[cindex].draw();
}

var pMatrix2=makeOrtho(-256,256,-256,256,-10000,10000);
var lastShader2;
var transform2={
	degx: 0,
	degy: 0,
	scale: 1
};

function initT2(){
	transform2.degx=45;
	transform2.degy=45;
	transform2.scale=1;
}

function rotateT2(x,y){
	transform2.degy+=x;
	transform2.degx+=-y;
	if(transform2.degy>=360)
		transform2.degy-=360;
	else if(transform2.degy<= -360)
		transform2.degy+=360;
	if(transform2.degx<-90)
		transform2.degx=-90;
	else if(transform2.degx>90)
		transform2.degx=90;
}
function scaleT2(scalar){
	transform2.scale*=scalar;
}
var tempid=[null,null];
function drawLabSpace(cid,bufid){
	
	if(cid==null) cid=LabSpaceColor;
	if(bufid==null) bufid=0;
	
	if(lastShader2!=="simple"){
			lastShader2="simple";
			gl2.useProgram(shaderProgram.simpleShader2);
			gl2.enableVertexAttribArray(attributes.simpleShader2.vertexPositionAttribute);
			gl2.enableVertexAttribArray(attributes.simpleShader2.vertexColorAttribute);
		}
	gl2.lineWidth(3);
	
	var radx = transform2.degx * Math.PI / 180.0;
	var rady = transform2.degy * Math.PI / 180.0;
	var s=transform2.scale;

	var mvMatrix2 = Matrix.I(4).x(Matrix.RotationX(radx).ensure4x4()).x(Matrix.RotationY(rady).ensure4x4()).x(Matrix.Diagonal([s,s,s,1])).x(Matrix.Translation($V([0,-50,0])));

	gl2.uniformMatrix4fv(uniforms.simpleShader2.pUniform, false, new Float32Array(pMatrix2.flatten()));
	gl2.uniformMatrix4fv(uniforms.simpleShader2.mvUniform, false, new Float32Array(mvMatrix2.flatten()));
	
	//draw axes
	gl2.bindBuffer(gl2.ARRAY_BUFFER, verticesBuffer2);
	gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([-128,50,0,	128,50,0, 0,0,0,	0,100,0, 0,50,-128, 0,50,128]), gl2.STATIC_DRAW);
	gl2.vertexAttribPointer(attributes.simpleShader2.vertexPositionAttribute, 3, gl2.FLOAT, false, 0, 0);
	gl2.bindBuffer(gl2.ARRAY_BUFFER, verticesColorBuffer2);
	gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([0,154.5/255,116.4/255,1,	1,0,124.7/255,1,	0,0,0,1, 1,1,1,1,	148.6/255,116/255,0,1,	0,138.4/255,1,1]), gl2.STATIC_DRAW);
	gl2.vertexAttribPointer(attributes.simpleShader2.vertexColorAttribute, 4, gl2.FLOAT, false, 0, 0);
	gl2.drawArrays(gl2.LINES, 0, 6);
	
	//draw colors
	if(scales[cid]==undefined)return;
	var len=scales[cid].length;
	
	if(tempid[bufid]!=cid){
		tempid[bufid]=cid;
		var scale=scales[cid];
		var list_rgba=[];
		var list_pos=[];
		for(var i=0;i<len;i++){
			var rgb=scale[i];
			list_rgba.push(rgb.r);
			list_rgba.push(rgb.g);
			list_rgba.push(rgb.b);
			list_rgba.push(1);
			var lab=rgb_to_lab({'R':rgb.r*255, 'G':rgb.g*255, 'B':rgb.b*255});
			list_pos.push(lab.a);
			list_pos.push(lab.L);
			list_pos.push(-lab.b);
		}

		gl2.bindBuffer(gl2.ARRAY_BUFFER, pointBuffer2[bufid]);
		gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(list_pos), gl2.STATIC_DRAW);
		gl2.bindBuffer(gl2.ARRAY_BUFFER, pointColorBuffer2[bufid]);
		gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(list_rgba), gl2.STATIC_DRAW);
	}

	gl2.bindBuffer(gl2.ARRAY_BUFFER, pointBuffer2[bufid]);
	gl2.vertexAttribPointer(attributes.simpleShader2.vertexPositionAttribute, 3, gl2.FLOAT, false, 0, 0);
	gl2.bindBuffer(gl2.ARRAY_BUFFER, pointColorBuffer2[bufid]);
	gl2.vertexAttribPointer(attributes.simpleShader2.vertexColorAttribute, 4, gl2.FLOAT, false, 0, 0);
	
	gl2.drawArrays(gl2.POINTS, 0, len);
	
}

function draw2LabSpaces(){
	var w=canvas2.width;
	var h=canvas2.height/2;
	//|
	//(0,0)__
	var x1=0;
	var y1=h;
	var x2=0;
	var y2=0;

	gl2.clearColor(0.5,0.5,0.5,1.0);
	gl2.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl2.viewport(x1,y1,w,h);
	if(mapCIndices[0]<scales.length)
		drawLabSpace(mapCIndices[0],0);
	gl2.viewport(x2,y2,w,h);
	if(mapCIndices[1]<scales.length){
		drawLabSpace(mapCIndices[1],1);
		//draw the line in between
		gl2.viewport(0,0,w,h*2);
		gl2.bindBuffer(gl2.ARRAY_BUFFER, verticesBuffer2);
		gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([-1,0,0,1,0,0]), gl2.STATIC_DRAW);
		gl2.vertexAttribPointer(attributes.simpleShader2.vertexPositionAttribute, 3, gl2.FLOAT, false, 0, 0);
		gl2.bindBuffer(gl2.ARRAY_BUFFER, verticesColorBuffer2);
		gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([0.8,0.8,0.8,1,0.8,0.8,0.8,1]), gl2.STATIC_DRAW);
		gl2.vertexAttribPointer(attributes.simpleShader2.vertexColorAttribute, 4, gl2.FLOAT, false, 0, 0);
		gl2.uniformMatrix4fv(uniforms.simpleShader2.pUniform, false, new Float32Array(Matrix.I(4).flatten()));
		gl2.uniformMatrix4fv(uniforms.simpleShader2.mvUniform, false, new Float32Array(Matrix.I(4).flatten()));
		gl2.drawArrays(gl2.LINES,0,2);
	}
}

function setView(l,r,b,t){
	orthogonal.l=l;
	orthogonal.r=r;
	orthogonal.b=b;
	orthogonal.t=t;
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}
function mvScale(v){
	multMatrix(Matrix.Diagonal([v[0], v[1], v[2],1]).ensure4x4());
}


var mvMatrixStack = [];
function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function setMatrixUniforms(shader) {
	if(!shader)
		shader = uniforms.simpleShader;
  gl.uniformMatrix4fv(shader.pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
  gl.uniformMatrix4fv(shader.mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

function addEventHandler(obj, evt, handler) {
    if(obj.addEventListener) {
        // W3C method
        obj.addEventListener(evt, handler, false);
    } else if(obj.attachEvent) {
        // IE method.
        obj.attachEvent('on'+evt, handler);
    } else {
        // Old school method.
        obj['on'+evt] = handler;
    }
}

function FileListenerInit(){
	if(window.FileReader) {
		addEventHandler(window, 'load', function() {
			var drop1  = document.getElementById('drop1');
			var drop2 = document.getElementById('drop2');
			var select1 = document.getElementById('selector1');
			var select2 = document.getElementById('selector2');
			var select3 = document.getElementById('selector3');
			var button1 = document.getElementById('button1');
			var button2 = document.getElementById('button2');
			var button3 = document.getElementById('button3');
			var button4 = document.getElementById('button4');
			var button5 = document.getElementById('button5');
			var screenshot1=document.getElementById("screenshot1");
			var screenshot2=document.getElementById("screenshot2");
			var button6 = document.getElementById('button6');
			var button7 = document.getElementById('button7');
			var hideLab= document.getElementById('hideLab');
			var invert1 = document.getElementById("invert1");
			var invert2 = document.getElementById("invert2");
			var expandLab=document.getElementById("expandLab");
			var strinkLab=document.getElementById("strinkLab");
			if(canvas2.height*1.1>canvas.height)expandLab.style.visibility="hidden";
			if(canvas2.height/1.1<640)strinkLab.style.visibility="hidden";
			
			function cancel(e) {
			   e.preventDefault(); 
			}
			
			function readDroppedFiles(e,type) {
				e = e || window.event;
				cancel(e);
				e.stopPropagation();
				
				var files = e.dataTransfer.files; // Array of all files
				readFiles(files,type);
			}
			
			addEventHandler(drop1, 'dragover', cancel);
			addEventHandler(drop1, 'dragenter', cancel);
			addEventHandler(drop1,'drop', function(e){readDroppedFiles(e,'data');});
			addEventHandler(drop2, 'dragover', cancel);
			addEventHandler(drop2, 'dragenter', cancel);
			addEventHandler(drop2,'drop', function(e){readDroppedFiles(e,'color');});
			addEventHandler(select1,'change', handleImageFileSelect);
			addEventHandler(select2,'change', handleColorFileSelect);
			addEventHandler(select3,'change', handleTubesFileSelect);
			addEventHandler(button1,'click', function(){select1.click();});
			addEventHandler(button2,'click', function(){select2.click();});
			addEventHandler(button3,'click', function(){select3.click();});
			addEventHandler(button4,'click', handleResetButton);
			addEventHandler(button5,'click', handleLabButton);
			addEventHandler(button6,'click', handleColorModalButton);
			addEventHandler(button7,'click', handleImgModalButton);
			addEventHandler(screenshot1,'click', function(){downloadView(0);});
			addEventHandler(screenshot2,'click', function(){downloadView(1);});
			addEventHandler(hideLab,'click', handleLabButton);
			addEventHandler(invert1,'click', function(){handleInvertButton(0);});
			addEventHandler(invert2,'click', function(){handleInvertButton(1);});
			addEventHandler(expandLab,'click', function(){resizeCanvas2(1.1);});
			addEventHandler(strinkLab,'click', function(){resizeCanvas2(1/1.1);});
		});
	} else {
	  alert('Your browser does not support the HTML5 FileReader.');
	}
}

function readFiles(files,type){
	if(iconViewHeight<(imgIconsTex.length+1)*(iconHeight+10)+10){
		imgIconViewOffset=(imgIconsTex.length+1)*(iconHeight+10)+10-iconViewHeight;
		drawImgIcons();
	}
	if(type!="color"){
		loading+=files.length;
		updateLoader();
	}
	for (var i=0; i<files.length;  i++) {
		var file=files[i];
		//if (!file.type.match('plain')) continue;
		var reader = new FileReader();
		reader.file=file;
		reader.onload = function(e2) { // finished reading file data.
			if(type=='img'){
				readTextToImage(e2.target.result,this.file.name,this.file);
			}
			else if(type=='color'){
				readTextToScale(e2.target.result,this.file.name);
			}
			else if(type=='tubes'){
				readTextToTubes(e2.target.result,this.file.name);
			}
			else if(type=='data'){
				var fname=this.file.name;
				if(fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2)=="data")//if extension is .data
					readTextToTubes(e2.target.result,fname);
				else
					readTextToImage(e2.target.result,fname,this.file);
			}
		}
		reader.readAsText(file); // start reading the file data.
	}
}

function readImage(file){
    function addImage(bitmap){
        targ.height=bitmap.height;
        targ.width=bitmap.width;
        ctx.clearRect(0,0,targ.width,targ.height);
        ctx.drawImage(bitmap,0,0);
        var img=ctx.getImageData(0,0,targ.width,targ.height);
        //console.log(img.data);
        var img_arr=[];
        for(var i=0;i<targ.height;i++){
            for(var j=0; j<targ.width; j++){
                var idx=(i*targ.width+j)*4;
                var lab=rgb_to_lab({'R':img.data[idx],'G':img.data[idx+1],'B':img.data[idx+2]});
                img_arr.push(lab.L/100);
            }
        }
        
        var imgData ={
            w: targ.width,
            h: targ.height,
            data: img_arr
        };
        var filename=file.name;
        if(filename[filename.length-1]=="\r") filename=filename.slice(0,-1);
        img_data.push(imgData);
        img_panels.push(new ImagePanel(0,0,1,1,img_data.length-1,null));
        imgFileNames.push(filename);
        var tempIndex = img_panels.length-1;
        img_panels[tempIndex].changeColor(null);
        img_panels[tempIndex].scale(iconWidth, iconHeight);
        img_panels[tempIndex].move(0,0,0);
        img_panels[tempIndex].draw();
        addNewImgIconData(2);

        targ.height=iconHeight;
        targ.width=iconWidth; 
		loading--;
    }
    createImageBitmap(file).then(addImage,function(err){alert("cannot read this image"); loading--;}).then(drawScene,drawScene);
}
function readFilesOnLoad(){
	readFilesFromServer("data/colorscale/","scale");
	readFilesFromServer("data/image/","data");
}

function getFileList(directory,type){
	$.ajax({
    type:    "GET",
    url:     directory+"index.txt",
    success: function(text) {		
            var lines=text.split('\n');
			if(lines[lines.length-1]==""||lines[lines.length-1]=="/r")lines.pop();
			if(type=="scale")
				colorscaleList=lines;
			if(type=="data")
				dataList=lines;
    },
    error:   function() {
        // An error occurred
		alert("cannot read files from server");
    }
});
}

function readFilesFromServer(directory,type){//type=scale, image
	$.ajax({
    type:    "GET",
    url:     directory+"start.txt",
    success: function(text) {		
            var lines=text.split('\n');
			if(lines[lines.length-1]==""||lines[lines.length-1]=="/r")lines.pop();
			if(iconViewHeight<(imgIconsTex.length+1)*(iconHeight+10)+10){
				imgIconViewOffset=(imgIconsTex.length+1)*(iconHeight+10)+10-iconViewHeight;
				drawImgIcons();
			}
			if(type!="scale"){
				loading+=lines.length;
				updateLoader();
			}
			for(var i=0;i<lines.length;i++) {
				if(lines[i][lines[i].length-1]==""||lines[i][lines[i].length-1]=="\r")
					readOneFileFromServer(directory,lines[i].slice(0,-1),type);
				else
					readOneFileFromServer(directory,lines[i],type);
			}
    },
    error:   function() {
        // An error occurred
		alert("cannot read files from server");
    }
});
}

function readOneFileFromServer(directory,filename,type){
	$.ajax({
    type:    "GET",
    url:     directory+filename,
    success: function(text) {
        // `text` is the file text
		if(type=="scale"){
			readTextToScale(text,filename);
		}
		else if(type=="image"){
			readTextToImage(text,filename,null);
		}
		else if(type=="tubes"){
			readTextToTubes(text,filename);
		}
		else if(type=='data'){
			if(filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)=="data")//if extension is .data
				readTextToTubes(text,filename);
			else
				readTextToImage(text,filename,null);
			}
		else{
			console.log("file does not match:");
			console.log(text);
		}
    },
    error:   function() {
        // An error occurred
		alert("cannot read files from server");
    }
});
}

function readTextToImage(text,filename,file){
	var image2DArray=[];
	var imageHeight= undefined;
	var imageWidth= undefined;
	
	try{
		//parse the data into the array
		var lines=text.split('\n');
		if(lines[lines.length-1]==""||lines[lines.length-1]=="\r")lines.pop();
		imageHeight=lines.length;
		for(var i=0;i<lines.length;i++) {
			var values=lines[i].split(' ');
			if(values[values.length-1]=="\r"||values[values.length-1]=="")values.pop();
			if(!imageWidth){
				imageWidth = values.length;
			}else if(imageWidth!=values.length){
				throw('error reading the file. line:'+i+ ", num:"+values.length+", value=("+values[0]+")");
			}
			for(var j=0; j<values.length; j++){
				var v=Number(values[j]);
				if(isNaN(v)) throw("at ("+j+", "+i+") value="+v);
				else image2DArray.push(v);
			}
		}
		var imgData ={
			w: imageWidth,
			h: imageHeight,
			data: fillBackground(image2DArray,imageWidth,imageHeight)
		};
		if(filename[filename.length-1]=="\r") filename=filename.slice(0,-1);
		img_data.push(imgData);
		img_panels.push(new ImagePanel(0,0,1,1,img_data.length-1,null));
		imgFileNames.push(filename);
		var tempIndex = img_panels.length-1;
		img_panels[tempIndex].changeColor(null);
		img_panels[tempIndex].scale(iconWidth, iconHeight);
		img_panels[tempIndex].move(0,0,0);
		img_panels[tempIndex].draw();
		addNewImgIconData(2);
		loading--;
	}
	catch(e){
		if(file)
			readImage(file);
		else{
			alert("Error reading: "+e);
		}
	}
	finally{
		drawScene();
	}
	
}

function readTextToScale(text,filename){
	var scale=[];
	var lines=text.split('\n');
	if(lines[lines.length-1]=="")lines.pop();
	try{
	for(var i=0; i<lines.length;i++){
		var color=lines[i].split(" ");
		var rgb={
			r: Number(color[0]),
			g: Number(color[1]),
			b: Number(color[2])
		};
		if(isNaN(rgb.r)||isNaN(rgb.g)||isNaN(rgb.b))
			throw("error reading at line "+(i+1));
		scale.push(rgb);
	}
	if(filename[filename.length-1]=="\r") filename=filename.slice(0,-1);
	scales.push(scale);
	color_panels.push(new ColorPanel(0,0,50,50,scales.length-1));
	colormapFileNames.push(filename);
	addNewColorIconData(scales.length-1);
	}catch(e){
		alert(e);
	}
	finally{
		drawScene();
	}
}

function addNewColorIconData(cindex){
	var icondataside=64;
	var pixelData = ctx.createImageData(icondataside,1);//new Uint8Array(iconWidth*iconHeight*4);
	var interval = 1/icondataside;
	var tempColor;
	for(var i=0;i<icondataside;i++){
		tempColor = getColorHeight(cindex,i*interval);
		pixelData.data[i*4]=Math.round(tempColor.r*255);
		pixelData.data[i*4+1]=Math.round(tempColor.g*255);
		pixelData.data[i*4+2]=Math.round(tempColor.b*255);
		pixelData.data[i*4+3]=255;
	}
	/*for(var i=1;i<iconHeight;i++){
		for(var j=0;j<iconWidth*4;j++){
			pixelData[i*iconHeight*4+j]=pixelData[j];
		}
	}*/
	createImageBitmap(pixelData).then(function(response) { colorIconsData.push(response);});
	
}

function readTextToTubes(text,filename){
	if(filename[filename.length-1]=="\r") filename=filename.slice(0,-1);
	try{
		Tubes3DList.push(new Tubes3D(text));
		tubesFileNames.push(filename);
		Tubes3DList[Tubes3DList.length-1].draw(0,0,iconWidth, iconHeight);
		addNewImgIconData(3);
	}
	catch(e){
		alert(e);
	}
	finally{
		loading --;
		drawScene();
	}
}

//Reads the pixel data that's in the temporary zone and adds it to the pixeldata array
function addNewImgIconData(dimension){
	var w=iconWidth|0;
	var h=iconHeight|0;
	var x=0;
	var y=0;
	var pixelData = new Uint8Array(w*h*4);//unit8array
	gl.readPixels(x, (canvas.height|0)-y-h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
	var texture=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, iconWidth, iconHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE,pixelData);
	setTexParameter();
	//Test if the added file is 2d
	if(dimension==2){
		//img_data.length+Tubes3DList.length
		//Shift all the 3d textures down the array
		for(var i=imgIconsTex.length-1;i>=img_data.length-1;i--){
			imgIconsTex[i+1]=imgIconsTex[i];
		}
		imgIconsTex[img_data.length-1]=texture;
	}
	else{
		//If it's 3d, just add it to the end
		imgIconsTex.push(texture);
	}
}

function handleImageFileSelect(evt) {
    var files = evt.target.files;
    readFiles(files,"img");
}

function handleColorFileSelect(evt) {
    var files = evt.target.files;
    readFiles(files,"color");
}
function handleTubesFileSelect(evt){
	var files = evt.target.files;
    readFiles(files,"tubes");
}

function handleResetButton(evt){
	imageSet=false;
	initView();
	drawView();
	initT2();
	draw2LabSpaces();
}

function handleLabButton(evt){
	var button = document.getElementById('button5');
	if(labDiv.style.display=="none"||labDiv.style.display==""){
		//canvas2.style.display="block";
		labDiv.style.display="block";
		button.innerHTML = "Hide LabGraph";
	}else{
		//canvas2.style.display="none";
		labDiv.style.display="none";
		button.innerHTML = "Show LabGraph";
	}
}

function handleInvertButton(id){
	var button = document.getElementById("invert"+(id+1));
	if(inverseColorHeight[id]===false){
		button.src="icon/invert2.png";
		inverseColorHeight[id]=true;
	}
	else{
		button.src="icon/invert1.png";
		inverseColorHeight[id]=false;
	}
	drawScene();
}
function updateColorModal(){
	var sel1 = document.getElementById('select1');
	var sel2 = document.getElementById('select2');
	var sel3 = document.getElementById('select3');
	for(var i=sel1.options.length-1;i>=0;i--)
		sel1.removeChild(sel1.options[i]); 
	for(var i=sel2.options.length-1;i>=0;i--)
		sel2.removeChild(sel2.options[i]); 
	for(var i=sel3.options.length-1;i>=0;i--)
		sel3.removeChild(sel3.options[i]); 
	for(var i=0;i<colorscaleList.length;i++){
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(colorscaleList[i]));
		opt.value = colorscaleList[i]; 
		sel1.appendChild(opt); 
	}
	for(var i=0;i<colormapFileNames.length;i++){
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(colormapFileNames[i]));
		opt.value = colormapFileNames[i]; 
		sel3.appendChild(opt); 
	}
}

function handleColorModalButton(evt){
	updateColorModal();
}

function getCIndexFromName(colorName){
	for(var i=0;i<colormapFileNames.length;i++){
		if(colormapFileNames[i]==colorName){
			return i;
		}
	}
}

//Removes the following 
function removeColor(cindex){
	colormapFileNames.splice(cindex,1);
	scales.splice(cindex,1);
	color_panels.splice(cindex,1);
	colorIconsData.splice(cindex,1);
}

function removeColors(){
	var sel3 = document.getElementById('select3');
	var remove=false;
	//check if there are any colors selected to be removed
	for(var i=0;i<sel3.length;i++){
		if (sel3.options[i].selected){
			remove=true;
			break;
		}
	}
	
	//if(!confirm("Are you sure you want to remove selected colormaps?"))
		//return;
	for(var i=sel3.length-1;i>=0;i--){
		if(sel3.options[i].selected)
			removeColor(getCIndexFromName(sel3.options[i].innerHTML));
	}
	//Check if there are not enough icons to validate scrolling
	if(iconViewHeight>=scales.length*(iconHeight+10)+10)
		iconViewOffset=0;
	
	updateColorModal();
	drawScene();
}

function addColors(){
	var colorDirectory = "data/colorscale/";
	//Iterate through all html elements to get an array
	var sel2 = document.getElementById('select2');
	for(var i=0;i<sel2.options.length;i++){
		//console.log(sel2.options[i].innerHTML);
		readOneFileFromServer(colorDirectory,sel2.options[i].innerHTML,"scale");
	}
	
	drawScene();
	//array.splice(start,amount);
}

function updateImgModal(){
	var sel4 = document.getElementById('select4');
	var sel5 = document.getElementById('select5');
	var sel6 = document.getElementById('select6');
	for(var i=sel4.options.length-1;i>=0;i--)
		sel4.removeChild(sel4.options[i]); 
	for(var i=sel5.options.length-1;i>=0;i--)
		sel5.removeChild(sel5.options[i]); 
	for(var i=sel6.options.length-1;i>=0;i--)
		sel6.removeChild(sel6.options[i]); 
	for(var i=0;i<dataList.length;i++){
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(dataList[i]));
		opt.value = dataList[i]; 
		sel4.appendChild(opt); 
	}

	//Add all the imgfiles that are already loaded
	for(var i=0;i<imgFileNames.length;i++){
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(imgFileNames[i]));
		opt.value = imgFileNames[i]; 
		sel6.appendChild(opt); 
	}
	
	//Add all the tube files that are loaded
	for(var i=0;i<tubesFileNames.length;i++){
		var opt = document.createElement('option');
		opt.appendChild(document.createTextNode(tubesFileNames[i]));
		opt.value = tubesFileNames[i]; 
		sel6.appendChild(opt); 
	}
}

function handleImgModalButton(evt){
	updateImgModal();
}

function getImgIndexFromName(imgName){
	//Check if it's in the 2d image array
	for(var i=0;i<imgFileNames.length;i++)
		if(imgFileNames[i]==imgName)
			return i;
	//if not then check if it's in the 2d img array
	for(var i=0;i<tubesFileNames.length;i++)
		if(tubesFileNames[i]==imgName)
			return imgFileNames.length+i;
}

function removeImg(imgIndex){
	//Remove from icons
	imgIconsTex.splice(imgIndex,1);
	//If below the length of 2d images, remove from 2d images array
	if(imgIndex<imgFileNames.length){
		imgFileNames.splice(imgIndex,1);
		img_data.splice(imgIndex,1);
		img_panels.splice(imgIndex,1);
	}
	else{//else remove from 3d images
		Tubes3DList.splice(imgIndex-imgFileNames.length,1);
		tubesFileNames.splice(imgIndex-imgFileNames.length,1);
	}
	
	
}

//Removes imagefiles
function removeImgs(){
	var sel6 = document.getElementById('select6');
	var remove=false;
	//check if there are any colors selected to be removed
	for(var i=0;i<sel6.length;i++){
		if (sel6.options[i].selected){
			remove=true;
			break;
		}
	}
	
	//if(!confirm("Are you sure you want to remove selected images?"))
		//return;
	for(var i=sel6.length-1;i>=0;i--){
		if(sel6.options[i].selected)
			removeImg(getImgIndexFromName(sel6.options[i].innerHTML));
	}
	
	//If there is no need to scroll, reset the imgviewoffset
	if(iconViewHeight>=imgIconsTex.length*(iconHeight+10)+10)
		imgIconViewOffset=0;
	updateImgModal();
	drawScene();
}

function addImgs(){
	var dataDirectory = "data/image/";
	//Iterate through all html elements to get an array
	var sel5 = document.getElementById('select5');
	console.log("Reading Images");
	for(var i=0;i<sel5.options.length;i++){
		console.log(sel5.options[i].innerHTML);
		readOneFileFromServer(dataDirectory,sel5.options[i].innerHTML,"data");
	}
	
	drawScene();
}

//change background 0 to -1
function fillBackground(data0,w,h){ //data = 2d array flattened to 1d
	//console.log("width and height:"+w+","+h);
	var data=data0;
	var spreadable=[];
	const bg=-1;
	//mark the 4 corners as spreadable
	if(data[(0)+(0)*w]===0){
		data[(0)+(0)*w]=bg;
		spreadable.push([0,0]);
	}
	if(data[(0)+(h-1)*w]===0){
		data[(0)*h+(h-1)]=bg;
		spreadable.push([0,h-1]);
	}
	if(data[(w-1)+(0)*w]===0){
		data[(w-1)+(0)*w]=bg;
		spreadable.push([w-1,0]);
	}
	if(data[(w-1)+(h-1)*w]===0){
		data[(w-1)+(h-1)*w]=bg;
		spreadable.push([w-1,h-1]);
	}
	
	while(spreadable.length>0){
		var spread=spreadable.pop();
		var x=spread[0];
		var y=spread[1];
		//check neighbor empty
		if(data[(x)+(y+1)*w]>0 || data[(x)+(y-1)*w]>0 || data[(x+1)+(y)*w]> 0|| data[(x-1)+(y)*w]>0){
			continue;
		}
		
		//spread upward
		if(y+1<h && data[(x)+(y+1)*w]===0){
			data[(x)+(y+1)*w]=bg;
			spreadable.push([x,y+1]);
		}
		//spread downward
		if(y-1>=0 && data[(x)+(y-1)*w]===0){
			data[(x)+(y-1)*w]=bg;
			spreadable.push([x,y-1]);
		}
		//spread right
		if(x+1<w && data[(x+1)+(y)*w]===0){
			data[(x+1)+(y)*w]=bg;
			spreadable.push([x+1,y]);
		}
		//spread left
		if(x-1>=0 && data[(x-1)+(y)*w]===0){
			data[(x-1)+(y)*w]=bg;
			spreadable.push([x-1,y]);
		}
	}
	return data;
}

function changeImage(cindex){
	
	//var myImageData=ctx.createImageData(w,h); //uint8clampedarray
	//myImageData.data.set(colorIconsData[cindex]);
	ctx.drawImage(colorIconsData[cindex],0,0,targ.width,targ.height);
}

function createImage(x,y,w,h){
	var myImageData=ctx.createImageData(w,h); //uint8clampedarray
	var pixelData = new Uint8Array(w*h*4);//uint8array
	gl.readPixels(x, canvas.height-y-h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
	myImageData.data.set(pixelData);
	ctx.putImageData(myImageData,0,0);
}

function drawGraph(x,y,w,h,cID,relative,inverted){
	var scale=scales[cID];
	var len=scale.length;
	var rect=Shape.rectangle;
	var cref=getColorHeight(cID,relative,inverted);
	var labref=rgb_to_lab({'R':cref.r*255, 'G':cref.g*255, 'B':cref.b*255});
	var vscale=canvas.height/min_height;
	
	rect.changeColor(cref.r,cref.g,cref.b);
	for(var i=0; i<len; i++){
		var barWidth=w/len;
		var color=getColorHeight(cID,i/len,inverted);
		var lab=rgb_to_lab({'R':color.r*255, 'G':color.g*255, 'B':color.b*255});
		var barHeight=ciede2000(labref,lab)*vscale;
		rect.scale(barWidth,barHeight);
		rect.move(x+(barWidth*i),y+h-barHeight);
		rect.draw();
	}
}

function computeDeltaE(cID){
	var outputText="";
	var scale=scales[cID];
	for(var i=0;i<scale.length;i++){
		var rgb1=scale[i-1];
		if(rgb1)
			var lab1=rgb_to_lab({'R':rgb1.r*255, 'G':rgb1.g*255, 'B':rgb1.b*255});
		var rgb2=scale[i];
		var lab2=rgb_to_lab({'R':rgb2.r*255, 'G':rgb2.g*255, 'B':rgb2.b*255});
		if(lab1&&lab2)
			var deltaE=ciede2000(lab1,lab2);
		outputText=outputText+rgb2.r+" "+rgb2.g+" "+rgb2.b+" "+"deltaE = "+deltaE+"\r\n";
	}
	download(outputText, colormapFileNames[cID]+"-deltaE.txt", 'text/plain');
}

function downloadColormap(cID){
	var outputText="";
	var scale=scales[cID];
	for(var i=0;i<scale.length;i++){
		var rgb=scale[i];
		var lab=rgb_to_lab({R:rgb.r*255,G:rgb.g*255,B:rgb.b*255});
		//outputText=outputText+rgb.r+" "+rgb.g+" "+rgb.b+"\r\n";
		outputText=outputText+lab.L+" "+lab.a+" "+lab.b+"\r\n";
	}
	download(outputText, colormapFileNames[cID], 'text/plain');
}

function downloadView(id){

	var viewp=viewports[id];
	var x=Math.round(viewp.x);
	var y=Math.round(viewp.y);
	var w=Math.round(viewp.w);
	var h=Math.round(viewp.h);
	var myImageData=ctx.createImageData(w,h); //uint8clampedarray
	var pixelData = new Uint8Array(w*h*4);//uint8array
	gl.readPixels(x, canvas.height-y-h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
	myImageData.data.set(pixelData);
	targ.width=w;
	targ.height=h;
    ctx.clearRect(0,0,w,h);
	ctx.putImageData(myImageData,0,0);
	ctx.translate(0,h);
	ctx.scale(1, -1);
	ctx.drawImage(targ,0,0);
	
	var a = document.createElement("a");
    a.href = targ.toDataURL();
    a.download = "screenshot";
    a.click();
	targ.width=iconWidth;
	targ.height=iconHeight;
}

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function linearizeLightness(cID){
	var newScale=[];
	var len=scales[cID].length;
	for(var i=0;i<len;i++){
		var newL=100*i/(len-1);
		var oldrgb=scales[cID][i];
		var oldLab=rgb_to_lab({'R':oldrgb.r, 'G':oldrgb.g, 'B':oldrgb.b});
		var newLab={L: newL, a: oldLab.a, b: oldLab.b};
		var newrgb=lab_to_rgb(newLab);
		newScale.push({r: newrgb.R, g: newrgb.G, b: newrgb.B});
	}
	scales.push(newScale);
	color_panels.push(new ColorPanel(0,0,50,50,scales.length-1));
	colormapFileNames.push(colormapFileNames[cID]+"(Adjusted Linear Lightness)");
	drawScene();
}
var constraint={
	steps: 1000,
	delta_e:2,
	tolerance: 0.01,
	//ctrl_points:[{L:0,a:0,b:0},{L:39,a:55,b:36},{L:57, a:42, b:64},{L:83,a:-10,b:83},{L:100,a:0,b:0}]
	ctrl_points:[]
}
constraint.addPoint=function(){
	this.ctrl_points.push({L:0,a:0,b:0});
}
constraint.removePoint=function(i){
	this.ctrl_points.splice(i,1);
}

var constraint2={
	steps: 200,
	delta_e:1.5,
	tolerance: 0.01,
	ctrl_points:[{L:39,a:39,b:-62},{L:60,a:24,b:-54},{L:76, a:10, b:-37},{L:86, a:1, b:-13},{L:86, a:6, b:11},{L:75, a:24, b:27},{L:58, a:44, b:34},{L:37, a:62, b:32}]
}

function generateColormap(constraint){
	var colors=[];
	var last_ctrl_point=0;
	var lastLab=constraint.ctrl_points[0];
	colors.push(lastLab); //first Lab color
	var i=1;
	var bound={min:0, max:1, mid:function(){return (this.min+this.max)/2}};
	
	var dirr=dir(constraint.ctrl_points[last_ctrl_point+1],lastLab);
	while(i<constraint.steps){
		
		var test=bound.mid()
		var newLab=Lab_add(lastLab,timesLen(dirr,test));
		var d_e=ciede2000(lastLab,newLab);
		//console.log(lastLab);
		//console.log(newLab);
		if(d_e>constraint.delta_e+constraint.tolerance){
			bound.max=test;//console.log(d_e+" max="+test);
		}
		else if(d_e<constraint.delta_e-constraint.tolerance){
			bound.min=test;//console.log(d_e+" min="+test);
		}
		else{
			colors.push(newLab);//console.log(newLab);
			lastLab=newLab;
			if(ciede2000(lastLab, constraint.ctrl_points[last_ctrl_point+1])<constraint.delta_e){
				last_ctrl_point++;
				if(last_ctrl_point>=constraint.ctrl_points.length-1){
					alert("cannot generate enough points, path is too short or deltaE is too large");
					break;
				}
				
			}
			dirr=dir(constraint.ctrl_points[last_ctrl_point+1],lastLab);
			bound.min=0;
			bound.max=1;
			i++;
		}
	}
	//return colors;
	var outputText="";
	for(var ii=0;ii<colors.length;ii++){
		var rgb=lab_to_rgb(colors[ii]);
		var r=rgb.R/255;
		var g=rgb.G/255;
		var b=rgb.B/255;
		if(r>1||r<0||g>1||g<0||b>1||b<0)
			console.log("non-displayable color on line "+ii);
		outputText+=r+" "+g+" "+b+"\n";
	}
	download(outputText, "generated_colormap", 'text/plain');
}

function Lab_add(Lab,arr){
	return {L:Lab.L+arr[0] , a:Lab.a+arr[1] , b:Lab.b+arr[2] };
}
function dir(Lab1,Lab2){
	return [Lab1.L-Lab2.L,Lab1.a-Lab2.a,Lab1.b-Lab2.b];
}
function timesLen(dir,len){
	return dir.map(function(x){return x*len});
}
},{"ndarray":11,"nifti-js":12,"pex-io":13}],8:[function(require,module,exports){
"use strict"

function iota(n) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    result[i] = i
  }
  return result
}

module.exports = iota
},{}],9:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],10:[function(require,module,exports){
var plask = require('plask-wrap')

module.exports = plask.SkCanvas ? true : false

},{"plask-wrap":19}],11:[function(require,module,exports){
var iota = require("iota-array")
var isBuffer = require("is-buffer")

var hasTypedArrays  = ((typeof Float64Array) !== "undefined")

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride
  var terms = new Array(stride.length)
  var i
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i]
  }
  terms.sort(compare1st)
  var result = new Array(terms.length)
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1]
  }
  return result
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("")
  if(dimension < 0) {
    className = "View_Nil" + dtype
  }
  var useGetters = (dtype === "generic")

  if(dimension === -1) {
    //Special case for trivial arrays
    var code =
      "function "+className+"(a){this.data=a;};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return -1};\
proto.size=0;\
proto.dimension=-1;\
proto.shape=proto.stride=proto.order=[];\
proto.lo=proto.hi=proto.transpose=proto.step=\
function(){return new "+className+"(this.data);};\
proto.get=proto.set=function(){};\
proto.pick=function(){return null};\
return function construct_"+className+"(a){return new "+className+"(a);}"
    var procedure = new Function(code)
    return procedure()
  } else if(dimension === 0) {
    //Special case for 0d arrays
    var code =
      "function "+className+"(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=function "+className+"_copy() {\
return new "+className+"(this.data,this.offset)\
};\
proto.pick=function "+className+"_pick(){\
return TrivialArray(this.data);\
};\
proto.valueOf=proto.get=function "+className+"_get(){\
return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
"};\
proto.set=function "+className+"_set(v){\
return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
};\
return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}"
    var procedure = new Function("TrivialArray", code)
    return procedure(CACHED_CONSTRUCTORS[dtype][0])
  }

  var code = ["'use strict'"]

  //Create constructor for view
  var indices = iota(dimension)
  var args = indices.map(function(i) { return "i"+i })
  var index_str = "this.offset+" + indices.map(function(i) {
        return "this.stride[" + i + "]*i" + i
      }).join("+")
  var shapeArg = indices.map(function(i) {
      return "b"+i
    }).join(",")
  var strideArg = indices.map(function(i) {
      return "c"+i
    }).join(",")
  code.push(
    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
      "this.shape=[" + shapeArg + "]",
      "this.stride=[" + strideArg + "]",
      "this.offset=d|0}",
    "var proto="+className+".prototype",
    "proto.dtype='"+dtype+"'",
    "proto.dimension="+dimension)

  //view.size:
  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
"}})")

  //view.order:
  if(dimension === 1) {
    code.push("proto.order=[0]")
  } else {
    code.push("Object.defineProperty(proto,'order',{get:")
    if(dimension < 4) {
      code.push("function "+className+"_order(){")
      if(dimension === 2) {
        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
      } else if(dimension === 3) {
        code.push(
"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})")
      }
    } else {
      code.push("ORDER})")
    }
  }

  //view.set(i0, ..., v):
  code.push(
"proto.set=function "+className+"_set("+args.join(",")+",v){")
  if(useGetters) {
    code.push("return this.data.set("+index_str+",v)}")
  } else {
    code.push("return this.data["+index_str+"]=v}")
  }

  //view.get(i0, ...):
  code.push("proto.get=function "+className+"_get("+args.join(",")+"){")
  if(useGetters) {
    code.push("return this.data.get("+index_str+")}")
  } else {
    code.push("return this.data["+index_str+"]}")
  }

  //view.index:
  code.push(
    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}")

  //view.hi():
  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
    indices.map(function(i) {
      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
    }).join(",")+","+
    indices.map(function(i) {
      return "this.stride["+i + "]"
    }).join(",")+",this.offset)}")

  //view.lo():
  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" })
  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" })
  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","))
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'&&i"+i+">=0){\
d=i"+i+"|0;\
b+=c"+i+"*d;\
a"+i+"-=d}")
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a"+i
    }).join(",")+","+
    indices.map(function(i) {
      return "c"+i
    }).join(",")+",b)}")

  //view.step():
  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
    indices.map(function(i) {
      return "a"+i+"=this.shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "b"+i+"=this.stride["+i+"]"
    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil")
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'){\
d=i"+i+"|0;\
if(d<0){\
c+=b"+i+"*(a"+i+"-1);\
a"+i+"=ceil(-a"+i+"/d)\
}else{\
a"+i+"=ceil(a"+i+"/d)\
}\
b"+i+"*=d\
}")
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a" + i
    }).join(",")+","+
    indices.map(function(i) {
      return "b" + i
    }).join(",")+",c)}")

  //view.transpose():
  var tShape = new Array(dimension)
  var tStride = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    tShape[i] = "a[i"+i+"]"
    tStride[i] = "b[i"+i+"]"
  }
  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}")

  //view.pick():
  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset")
  for(var i=0; i<dimension; ++i) {
    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}")
  }
  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}")

  //Add return statement
  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
    indices.map(function(i) {
      return "shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "stride["+i+"]"
    }).join(",")+",offset)}")

  //Compile procedure
  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
  return procedure(CACHED_CONSTRUCTORS[dtype], order)
}

function arrayDType(data) {
  if(isBuffer(data)) {
    return "buffer"
  }
  if(hasTypedArrays) {
    switch(Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64"
      case "[object Float32Array]":
        return "float32"
      case "[object Int8Array]":
        return "int8"
      case "[object Int16Array]":
        return "int16"
      case "[object Int32Array]":
        return "int32"
      case "[object Uint8Array]":
        return "uint8"
      case "[object Uint16Array]":
        return "uint16"
      case "[object Uint32Array]":
        return "uint32"
      case "[object Uint8ClampedArray]":
        return "uint8_clamped"
    }
  }
  if(Array.isArray(data)) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "array":[],
  "uint8_clamped":[],
  "buffer":[],
  "generic":[]
}

;(function() {
  for(var id in CACHED_CONSTRUCTORS) {
    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
  }
});

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0]
    return ctor([])
  } else if(typeof data === "number") {
    data = [data]
  }
  if(shape === undefined) {
    shape = [ data.length ]
  }
  var d = shape.length
  if(stride === undefined) {
    stride = new Array(d)
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  }
  if(offset === undefined) {
    offset = 0
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i]
      }
    }
  }
  var dtype = arrayDType(data)
  var ctor_list = CACHED_CONSTRUCTORS[dtype]
  while(ctor_list.length <= d+1) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length-1))
  }
  var ctor = ctor_list[d+1]
  return ctor(data, shape, stride, offset)
}

module.exports = wrappedNDArrayCtor

},{"iota-array":8,"is-buffer":9}],12:[function(require,module,exports){
"use strict"
var assert = require('assert')

var systemEndianness = (function() {
    var buf = new ArrayBuffer(4),
        intArr = new Uint32Array(buf),
        byteArr = new Uint8Array(buf)
    intArr[0] = 0x01020304
    if (byteArr[0]==1 && byteArr[1]==2 && byteArr[2]==3 && byteArr[3]==4) {
        return 'big'
    } else if (byteArr[0]==4 && byteArr[1]==3 && byteArr[2]==2 && byteArr[3]==1) {
        return 'little'
    }
    console.warn("Unrecognized system endianness!")
    return undefined
})()

// Parses a NIfTI header
module.exports.parseNIfTIHeader = parseNIfTIHeader
function parseNIfTIHeader(buffer_org) {
  var buf8 = new Uint8Array(buffer_org)
  var buffer = buf8.buffer // Make sure we have an ArrayBuffer
  var view = new DataView(buffer)
  if (buffer.byteLength<348) {
    throw new Error("The buffer is not even large enough to contain the minimal header I would expect from a NIfTI file!")
  }
  
  // First read dim[0], to determine byte order
  var littleEndian = true
  var dim = new Array(8)
  dim[0] = view.getInt16(40, littleEndian)
  if (1>dim[0] || dim[0]>7) {
    littleEndian = !littleEndian
    dim[0] = view.getInt16(40, littleEndian)
  }
  if (1>dim[0] || dim[0]>7) {
    // Even if there were other /byte/ orders, we wouldn't be able to detect them using a short (16 bits, so only two bytes).
    console.warn("dim[0] is out-of-range, we'll simply try continuing to read the file, but this will most likely fail horribly.")
  }
  
  // Now check header size and magic
  var sizeof_hdr = view.getInt32(0, littleEndian)
  if (sizeof_hdr !== 348 && (1>dim[0] || dim[0]>7)) {
    // Try to recover from weird dim info
    littleEndian = !littleEndian
    dim[0] = view.getInt16(40, littleEndian)
    sizeof_hdr = view.getInt32(0, littleEndian)
    if (sizeof_hdr !== 348) {
      throw new Error("I'm sorry, but I really cannot determine the byte order of the (NIfTI) file at all.")
    }
  } else if (sizeof_hdr < 348) {
    throw new Error("Header of file is smaller than expected, I cannot deal with this.")
  } else if (sizeof_hdr !== 348) {
    console.warn("Size of NIfTI header different from what I expect, but I'll try to do my best anyway (might cause trouble).")
  }
  var magic = String.fromCharCode.apply(null, buf8.subarray(344, 348))
  if (magic !== "ni1\0" && magic !== "n+1\0") {
    throw new Error("Sorry, but this does not appear to be a NIfTI-1 file. Maybe Analyze 7.5 format? or NIfTI-2?")
  }
  
  // Read some more structured header fields
  var dim_info = view.getInt8(39)
  dim.length = 1+Math.min(7, dim[0])
  for(var i=1; i<dim.length; i++) {
    dim[i] = view.getInt16(40+2*i, littleEndian)
    if (dim[i]<=0) {
      console.warn("dim[0] was probably wrong or corrupt")
      dim.length = i
    }
  }
  if (dim.length === 1) throw new Error("No valid dimensions!")
  
  var pixdim = new Array(dim.length)
  for(var i=0; i<pixdim.length; i++) {
    pixdim[i] = view.getFloat32(76+4*i, littleEndian)
  }
  
  var srow = new Float32Array(12)
  for(var i=0; i<12; i++) {
    srow[i] = view.getFloat32(280+4*i, littleEndian)
  }
  
  // Read simple header fields and build up object representing the header
  var header = {
    littleEndian: littleEndian,
    
    sizeof_hdr: sizeof_hdr,
    dim_info: dim_info,
    dim: dim,
    intent_p1: view.getFloat32(56, littleEndian),
    intent_p2: view.getFloat32(56, littleEndian),
    intent_p3: view.getFloat32(56, littleEndian),
    intent_code: view.getInt16(68, littleEndian),
  
    datatype: decodeNIfTIDataType(view.getInt16(70, littleEndian)),
    bitpix: view.getInt16(72, littleEndian),
    slice_start: view.getInt16(74, littleEndian),
    pixdim: pixdim,
    vox_offset: view.getFloat32(108, littleEndian),
    
    scl_slope: view.getFloat32(112, littleEndian),
    scl_inter: view.getFloat32(116, littleEndian),
    slice_end: view.getInt16(120, littleEndian),
    slice_code: view.getInt8(122),
    xyzt_units: decodeNIfTIUnits(view.getInt8(123)),
    cal_max: view.getFloat32(124, littleEndian),
    cal_min: view.getFloat32(128, littleEndian),
    slice_duration: view.getFloat32(132, littleEndian),
    toffset: view.getFloat32(136, littleEndian),
  
    descrip: String.fromCharCode.apply(null, buf8.subarray(148, 228)),
    aux_file: String.fromCharCode.apply(null, buf8.subarray(228, 252)),
  
    qform_code: view.getInt16(252, littleEndian),
    sform_code: view.getInt16(254, littleEndian),
  
    quatern_b: view.getFloat32(256, littleEndian),
    quatern_c: view.getFloat32(260, littleEndian),
    quatern_d: view.getFloat32(264, littleEndian),
    qoffset_x: view.getFloat32(268, littleEndian),
    qoffset_y: view.getFloat32(272, littleEndian),
    qoffset_z: view.getFloat32(276, littleEndian),
    
    srow: srow,
  
    intent_name: String.fromCharCode.apply(null, buf8.subarray(328, 344)),
    
    magic: magic,
  
    extension: buffer.byteLength < 348+4 ? [0,0,0,0] : [view.getInt8(348), view.getInt8(349), view.getInt8(350), view.getInt8(351)]
  }
  
  // Check bitpix
  
  // "Normalize" datatype (so that rgb/complex become several normal floats rather than compound types, possibly also do something about bits)
  // Note that there is actually both an rgb datatype and an rgb intent... (My guess is that the datatype corresponds to sizes = [3,dim[0],...], while the intent might correspond to sizes = [dim[0],...,dim[5]=3].)
  
  return header  
}

// Converts a NIfTI header to an NRRD-compatible structure
function NIfTIToNRRD(niftiHeader) {
  var ret = {}
  ret.dimension = niftiHeader.dim[0]
  ret.type = niftiHeader.datatype // TODO: Check that we do not feed anything incompatible?
  ret.encoding = 'raw'
  ret.endian = niftiHeader.littleEndian ? 'little' : 'big'
  ret.sizes = niftiHeader.dim.slice(1) // Note that both NRRD and NIfTI use the convention that the fastest axis comes first!
  ret.thicknesses=niftiHeader.pixdim.slice(1);

  if (niftiHeader.xyzt_units !== undefined) {
    ret.spaceUnits = niftiHeader.xyzt_units
    while(ret.spaceUnits.length < ret.dimension) { // Pad if necessary
      ret.spaceUnits.push("")
    }
    ret.spaceUnits.length = ret.dimension // Shrink if necessary
  }
  
  if (niftiHeader.qform_code === 0) { // "method 1"
    ret.spacings = niftiHeader.pixdim.slice(1)
    while(ret.spacings.length < ret.dimension) {
      ret.spacings.push(NaN)
    }
    ret.spaceDimension = Math.min(ret.dimension, 3) // There might be non-3D data sets? (Although the NIfTI format does seem /heavily/ reliant on assuming a 3D space.)
  } else if (niftiHeader.qform_code > 0) { // "method 2"
    // TODO: Figure out exactly what to do with the different qform codes.
    ret.space = "right-anterior-superior" // Any method for orientation (except for "method 1") uses this, apparently.
    var qfac = niftiHeader.pixdim[0] === 0.0 ? 1 : niftiHeader.pixdim[0]
    var a = Math.sqrt(Math.max(0.0,1.0-(niftiHeader.quatern_b*niftiHeader.quatern_b + niftiHeader.quatern_c*niftiHeader.quatern_c + niftiHeader.quatern_d*niftiHeader.quatern_d)))
    var b = niftiHeader.quatern_b
    var c = niftiHeader.quatern_c
    var d = niftiHeader.quatern_d
    ret.spaceDirections = [
      [niftiHeader.pixdim[1]*(a*a+b*b-c*c-d*d),niftiHeader.pixdim[1]*(2*b*c+2*a*d),niftiHeader.pixdim[1]*(2*b*d-2*a*c)],
      [niftiHeader.pixdim[2]*(2*b*c-2*a*d),niftiHeader.pixdim[2]*(a*a+c*c-b*b-d*d),niftiHeader.pixdim[2]*(2*c*d+2*a*b)],
      [qfac*niftiHeader.pixdim[3]*(2*b*d+2*a*c),qfac*niftiHeader.pixdim[3]*(2*c*d-2*a*b),qfac*niftiHeader.pixdim[3]*(a*a+d*d-c*c-b*b)]]
    ret.spaceOrigin = [niftiHeader.qoffset_x,niftiHeader.qoffset_y,niftiHeader.qoffset_z]
  } else {
    console.warn("Invalid qform_code: " + niftiHeader.qform_code + ", orientation is probably messed up.")
  }
  // TODO: Here we run into trouble, because in NRRD we cannot expose two DIFFERENT (not complementary, different!) transformations. Even more frustrating is that sform transformations are actually more compatible with NRRD than the qform methods.
  if (niftiHeader.sform_code > 0) {
    console.warn("sform transformation are currently ignored.")
  }
  /*if (niftiHeader.sform_code > 0) { // "method 3"
    ret.space = "right-anterior-superior" // Any method for orientation (except for "method 1") uses this, apparently.
    ret.spaceDirections = [
      [niftiHeader.srow[0*4 + 0],niftiHeader.srow[1*4 + 0],niftiHeader.srow[2*4 + 0]],
      [niftiHeader.srow[0*4 + 1],niftiHeader.srow[1*4 + 1],niftiHeader.srow[2*4 + 1]],
      [niftiHeader.srow[0*4 + 2],niftiHeader.srow[1*4 + 2],niftiHeader.srow[2*4 + 2]]]
    ret.spaceOrigin = [niftiHeader.srow[0*4 + 3],niftiHeader.srow[1*4 + 3],niftiHeader.srow[2*4 + 3]]
  }*/
  // TODO: Enforce that spaceDirections and so on have the correct size.
  
  // TODO: We're still missing an awful lot of info!
  
  return ret
}

// Just parses the header
// This expects an ArrayBuffer or (Node.js) Buffer
module.exports.parseHeader = function (buffer_org) {
  var niftiHeader = parseNIfTIHeader(buffer_org)
  var ret = NIfTIToNRRD(niftiHeader)
  return ret
}

// Parses both header and data
// This expects an ArrayBuffer or (Node.js) Buffer
module.exports.parse = function (buffer_org) {
  var niftiHeader = parseNIfTIHeader(buffer_org)
  var ret = NIfTIToNRRD(niftiHeader)

  if (niftiHeader.extension[0] !== 0) {
    console.warn("Looks like there are extensions in use in this NIfTI file, which will all be ignored!")
  }
  
  // Read data if it is here
  if (niftiHeader.magic === "n+1\0") {
    var buf8 = new Uint8Array(buffer_org)
    var buffer = buf8.buffer // Make sure we have an ArrayBuffer
    if (niftiHeader.vox_offset<352 || niftiHeader.vox_offset>buffer.byteLength) {
      throw new Error("Illegal vox_offset!")
    }
    ret.buffer = buffer.slice(Math.floor(niftiHeader.vox_offset))
    if (niftiHeader.datatype !== 0) {
      // TODO: It MIGHT make sense to equate DT_UNKNOWN (0) to 'block', with bitpix giving the block size in bits
      ret.data = parseNIfTIRawData(ret.buffer, niftiHeader.datatype, niftiHeader.dim, {endianFlag: niftiHeader.littleEndian})
    }
  }
  
  return ret
}

function parseNIfTIRawData(buffer, type, dim, options) {
  var i, arr, view, totalLen = 1, endianFlag = options.endianFlag, endianness = endianFlag ? 'little' : 'big'
  for(i=1; i<dim.length; i++) {
    totalLen *= dim[i]
  }
  if (type == 'block') {
    // Don't do anything special, just return the slice containing all blocks.
    return buffer.slice(0,totalLen*options.blockSize)
  } else if (type == 'int8' || type == 'uint8' || endianness == systemEndianness) {
    switch(type) {
    case "int8":
      checkSize(1)
      return new Int8Array(buffer.slice(0,totalLen))
    case "uint8":
      checkSize(1)
      return new Uint8Array(buffer.slice(0,totalLen))
    case "int16":
      checkSize(2)
      return new Int16Array(buffer.slice(0,totalLen*2))
    case "uint16":
      checkSize(2)
      return new Uint16Array(buffer.slice(0,totalLen*2))
    case "int32":
      checkSize(4)
      return new Int32Array(buffer.slice(0,totalLen*4))
    case "uint32":
      checkSize(4)
      return new Uint32Array(buffer.slice(0,totalLen*4))
    //case "int64":
    //  checkSize(8)
    //  return new Int64Array(buffer.slice(0,totalLen*8))
    //case "uint64":
    //  checkSize(8)
    //  return new Uint64Array(buffer.slice(0,totalLen*8))
    case "float":
      checkSize(4)
      return new Float32Array(buffer.slice(0,totalLen*4))
    case "double":
      checkSize(8)
      return new Float64Array(buffer.slice(0,totalLen*8))
    default:
      console.warn("Unsupported NIfTI type: " + type)
      return undefined
    }
  } else {
    view = new DataView(buffer)
    switch(type) {
    case "int8": // Note that here we do not need to check the size of the buffer, as the DataView.get methods should throw an exception if we read beyond the buffer.
      arr = new Int8Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getInt8(i)
      }
      return arr
    case "uint8":
      arr = new Uint8Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getUint8(i)
      }
      return arr
    case "int16":
      arr = new Int16Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getInt16(i*2)
      }
      return arr
    case "uint16":
      arr = new Uint16Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getUint16(i*2)
      }
      return arr
    case "int32":
      arr = new Int32Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getInt32(i*4)
      }
      return arr
    case "uint32":
      arr = new Uint32Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getUint32(i*4)
      }
      return arr
    //case "int64":
    //  arr = new Int64Array(totalLen)
    //  for(i=0; i<totalLen; i++) {
    //    arr[i] = view.getInt64(i*8)
    //  }
    // return arr
    //case "uint64":
    //  arr = new Uint64Array(totalLen)
    //  for(i=0; i<totalLen; i++) {
    //    arr[i] = view.getUint64(i*8)
    //  }
    //  return arr
    case "float":
      arr = new Float32Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getFloat32(i*4)
      }
      return arr
    case "double":
      arr = new Float64Array(totalLen)
      for(i=0; i<totalLen; i++) {
        arr[i] = view.getFloat64(i*8)
      }
      return arr
    default:
      console.warn("Unsupported NRRD type: " + type)
      return undefined
    }
  }
  function checkSize(sizeOfType) {
    if (buffer.byteLength<totalLen*sizeOfType) throw new Error("NIfTI file does not contain enough data!")
  }
}

function decodeNIfTIDataType(datatype) {
  switch(datatype) {
  case 1:
    return 'bit'
  case 2:
    return 'uint8'
  case 4:
    return 'int16'
  case 8:
    return 'int32'
  case 16:
    return 'float'
  case 32:
    return 'complex64'
  case 64:
    return 'double'
  case 128:
    return 'rgb24'
  case 256:
    return 'int8'
  case 512:
    return 'uint16'
  case 768:
    return 'uint32'
  case 1024:
    return 'int64'
  case 1280:
    return 'uint64'
  case 1536:
    return 'float128'
  case 1792:
    return 'complex128'
  case 2048:
    return 'complex256'
  case 2304:
    return 'rgba32'
  default:
    console.warn("Unrecognized NIfTI data type: " + datatype)
    return datatype
  }
}

function decodeNIfTIUnits(units) {
  var space, time
  switch(units & 7) {
  case 0:
    space = ""
    break
  case 1:
    space = "m"
    break
  case 2:
    space = "mm"
    break
  case 3:
    space = "um"
    break
  default:
    console.warn("Unrecognized NIfTI unit: " + (units&7))
    space = ""
  }
  switch(units & 56) {
  case 0:
    time = ""
    break
  case 8:
    time = "s"
    break
  case 16:
    time = "ms"
    break
  case 24:
    time = "us"
    break
  case 32:
    time = "Hz"
    break
  case 40:
    time = "ppm"
    break
  case 48:
    time = "rad/s"
    break
  default:
    console.warn("Unrecognized NIfTI unit: " + (units&56))
    time = ""
  }
  return (space === "" && time === "") ? undefined : [space, space, space, time]
}


},{"assert":2}],13:[function(require,module,exports){
module.exports = {
  load: require('./load'),
  loadBinary: require('./loadBinary'),
  loadImage: require('./loadImage'),
  loadText: require('./loadText'),
  loadJSON: require('./loadJSON')
}

},{"./load":14,"./loadBinary":15,"./loadImage":16,"./loadJSON":17,"./loadText":18}],14:[function(require,module,exports){
var loadImage = require('./loadImage')
var loadBinary = require('./loadBinary')
var loadText = require('./loadText')
var loadJSON = require('./loadJSON')

/**
 * Load provided resources
 * @param   {Object} resources - map of resources, see example
 * @param   {Function} callback function(err, resources), see example
 * @returns {Object}   - with same properties are resource list but resolved to the actual data
 *
 * @example
 * var resources = {
 *   img     : { image: __dirname + '/tex.jpg'},
 *   hdrImg  : { binary: __dirname + '/tex.hdr'}
 *   data    : { json: __dirname + '/data.json'},
 *   hello   : { text: __dirname + '/hello.txt'}
 * }
 * load(resources, function(err, res) {
 *   res.img    //{Image} in a Browser or {SkCanvas} in Plask
 *   res.hdrImg //{ArrayBuffer}
 *   res.data   //{JSON}
 *   res.hello  //{String}
 * })
 */
function load (resources, callback) {
  var results = {}
  var errors = {}
  var hadErrors = false

  // TODO: use `async` module instead?
  var loadedResources = 0
  var resourceNames = Object.keys(resources)
  var numResources = resourceNames.length

  function onFinish () {
    try {
      if (hadErrors) {
        callback(errors, null)
      } else {
        callback(null, results)
      }
    } catch (e) {
      console.log(e)
      console.log(e.stack)
    }
  }

  resourceNames.forEach(function (name) {
    function onLoaded (err, data) {
      if (err) {
        hadErrors = true
        errors[name] = err
      } else {
        results[name] = data
      }

      if (++loadedResources === numResources) {
        onFinish()
      }
    }

    var res = resources[name]
    if (res.image) {
      loadImage(res.image, onLoaded)
    } else if (res.text) {
      loadText(res.text, onLoaded)
    } else if (res.json) {
      loadJSON(res.json, onLoaded)
    } else if (res.binary) {
      loadBinary(res.binary, onLoaded)
    } else {
      onLoaded('pex-io/load unknown resource type ' + Object.keys(res), null)
    }
  })

  if (resourceNames.length === 0) {
    onFinish()
  }
}

module.exports = load

},{"./loadBinary":15,"./loadImage":16,"./loadJSON":17,"./loadText":18}],15:[function(require,module,exports){
var isPlask = require('is-plask')
var fs = require('fs')

function toArrayBuffer (buffer) {
  var ab = new ArrayBuffer(buffer.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i]
  }
  return ab
}

function loadBinaryBrowser (url, callback) {
  var request = new window.XMLHttpRequest()
  request.open('GET', url, true)
  request.responseType = 'arraybuffer'
  request.onreadystatechange = function (e) {
    if (request.readyState === 4) {
      if (request.status === 200) {
        callback(null, request.response)
      } else {
        callback('loadBinary error : ' + request.response, null)
      }
    }
  }
  request.send(null)
}

function loadBinaryPlask (file, callback) {
  try {
    if (!fs.existsSync(file)) {
      if (callback) {
        return callback('loadBinary error: File doesn\t exist', null)
      }
    }
  } catch(e) {
    return callback('loadBinary error : ' + e.toString(), null)
  }
  var rawData = fs.readFileSync(file)
  var data = toArrayBuffer(rawData)
  callback(null, data)
}

/**
 * Loads binary data
 * @param {String} file - url addess (Browser) or file path (Plask)
 * @param {Function} callback - function(err, data) { }
 * @param {Error} callback.err - error if any or null
 * @param {ArrayBuffer} callback.data - loaded binary data
 */
function loadBinary (file, callback) {
  if (isPlask) {
    loadBinaryPlask(file, callback)
  } else {
    loadBinaryBrowser(file, callback)
  }
}

module.exports = loadBinary

},{"fs":1,"is-plask":10}],16:[function(require,module,exports){
var isPlask = require('is-plask')
var plask = require('plask-wrap')

function loadImageBrowser (url, callback, crossOrigin) {
  var img = new window.Image()
  if (crossOrigin) {
    img.crossOrigin = 'anonymous'
  }
  img.onload = function () {
    callback(null, img)
  }
  img.src = url
}

function bgra2rgba (width, height, pixels) {
  var rgba = new Uint8Array(width * height * 4)
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var i = (x + y * width) * 4
      rgba[i + 0] = pixels[i + 2]
      rgba[i + 1] = pixels[i + 1]
      rgba[i + 2] = pixels[i + 0]
      rgba[i + 3] = pixels[i + 3]
    }
  }
  return rgba
}

function loadImagePlask (path, callback) {
  var img
  try {
    img = plask.SkCanvas.createFromImage(path)
    img.data = bgra2rgba(img.width, img.height, img.pixels)
  } catch(e) {
    callback(e + ' ' + '"' + path + '"', null)
  }
  callback(null, img)
}

/**
 * Loads a HTML Image from an url in the borwser, SkCanvas from a file in Plask
 * @param {String} file - url addess (Browser) or file path (Plask)
 * @param {Function} callback - function(err, image) { }
 * @param {Error} callback.err - error if any or null
 * @param {Image|SkCanvas} callback.image - loaded image
 */
function loadImage (file, callback, crossOrigin) {
  if (isPlask) {
    loadImagePlask(file, callback)
  } else {
    loadImageBrowser(file, callback, crossOrigin)
  }
}

module.exports = loadImage

},{"is-plask":10,"plask-wrap":19}],17:[function(require,module,exports){
var loadText = require('./loadText')

/**
 * Loads JSON data
 * @param {String} file - url addess (Browser) or file path (Plask)
 * @param {Function} callback - function(err, json) { }
 * @param {Error} callback.err - error if any or null
 * @param {String} callback.json - loaded JSON data
 */
function loadJSON (file, callback) {
  loadText(file, function (err, data) {
    if (err) {
      callback(err, null)
    } else {
      var json = null
      try {
        json = JSON.parse(data)
      } catch (e) {
        return callback(e.toString(), null)
      }
      callback(null, json)
    }
  })
}

module.exports = loadJSON

},{"./loadText":18}],18:[function(require,module,exports){
var isPlask = require('is-plask')
var fs = require('fs')

function loadTextBrowser (url, callback) {
  var request = new window.XMLHttpRequest()
  request.open('GET', url, true)
  request.onreadystatechange = function (e) {
    if (request.readyState === 4) {
      if (request.status === 200) {
        if (callback) {
          callback(null, request.responseText)
        }
      } else {
        callback('loadText error: ' + request.statusText, null)
      }
    }
  }
  request.send(null)
}

function loadTextPlask (path, callback) {
  if (!fs.existsSync(path)) {
    if (callback) {
      return callback('loadText error: File doesn\'t exist ' + '"' + path + '"', null)
    }
  }
  var data = fs.readFileSync(path, 'utf8')
  if (callback) {
    callback(null, data)
  }
}

/**
 * @desc Loads text string
 * @param {String} file - url addess (Browser) or file path (Plask)
 * @param {Function} callback - function(err, text) { }
 * @param {Error} callback.err - error if any or null
 * @param {String} callback.text - loaded text
 */
function loadText (file, callback) {
  if (isPlask) {
    loadTextPlask(file, callback)
  } else {
    loadTextBrowser(file, callback)
  }
}

module.exports = loadText

},{"fs":1,"is-plask":10}],19:[function(require,module,exports){
module.exports = { }

},{}]},{},[7]);
