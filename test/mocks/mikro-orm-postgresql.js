'use strict';
// Minimal CJS stub for @mikro-orm/postgresql used in unit tests
// Returns infinitely chainable proxy for fluent builder calls like p.integer().primary().nullable()
function makeChainable(val) {
  return new Proxy(function() { return makeChainable(val); }, {
    get(_target, prop) {
      return function() { return makeChainable(val); };
    },
    apply() { return makeChainable(val); },
  });
}

const defineEntity = (config) => config;

const p = new Proxy({}, {
  get(_target, prop) {
    return function() { return makeChainable({}); };
  },
});

module.exports = { defineEntity, p };
