// Jest unit-test configuration (extracted from package.json so we can annotate it).
// ESM/pnpm workaround — READ THIS BEFORE MODIFYING moduleNameMapper:
//
// ts-jest runs in CJS mode. @mikro-orm/core and @mikro-orm/postgresql are
// published as pure ESM (no CJS build). Under pnpm the packages live in a
// content-addressable store behind symlinks, so the usual fix of adding the
// package names to `transformIgnorePatterns` does NOT work — jest resolves the
// real path through the symlink and then fails to match the pattern anyway.
//
// The workaround: redirect those two imports to hand-rolled CJS stubs in
// test/mocks/ so ts-jest never has to parse the ESM source.
//
// LIMITATION: these stubs short-circuit MikroORM entirely (they export minimal
// no-op implementations). Any test that requires REAL MikroORM behavior — e.g.
// integration or e2e tests of repositories, entity decorators, or migration
// logic — MUST NOT run under this config. The e2e config at test/jest-e2e.json
// is separate and is NOT affected by this mapper.
//
// If you write a unit test that legitimately needs real MikroORM internals,
// create a dedicated jest config for that file and exclude it from this one.

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // ESM/pnpm workaround — see comment block at the top of this file.
  moduleNameMapper: {
    '^@mikro-orm/core$': '<rootDir>/../test/mocks/mikro-orm-core.js',
    '^@mikro-orm/postgresql$': '<rootDir>/../test/mocks/mikro-orm-postgresql.js',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
