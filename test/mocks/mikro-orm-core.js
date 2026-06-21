'use strict';
// Minimal CJS stub for @mikro-orm/core used in unit tests
const EntityManager = class EntityManager {};

module.exports = {
  EntityManager,
  defineEntity: (config) => config,
  p: new Proxy({}, {
    get: () => new Proxy(() => ({}), {
      get: (target, prop) => {
        if (prop === 'apply') return target;
        return new Proxy(() => ({}), {
          get: () => new Proxy(() => ({}), { get: () => () => ({}) }),
          apply: () => ({}),
        });
      },
      apply: () => ({}),
    }),
  }),
};
