/** @type {import('vitest').UserConfig} */
export default {
  test: {
    globals: true,
    environment: 'node',
    include: [
      // Part 6 + signal engine tests
      'src/**/*.test.ts',
    ],
    exclude: [
      // server/tests/ contains legacy manual scripts (not Vitest-compatible).
      // CoherenceEngine.test.ts uses process.exit(1) and no describe/it/expect blocks.
      // It is a standalone verification script, NOT a Vitest test suite.
      // REPOSITORY_DEBT: CoherenceEngine.test.ts is a pre-existing manual script with
      // one or more pre-existing failures. It must be converted to Vitest to be counted
      // in the configured test gate. It is NOT excluded to hide failures — it cannot
      // run under Vitest at all without conversion.
      // See: REPOSITORY_GLOBAL_TEST_GATE = BLOCKED_BY_PRE_EXISTING_COHERENCE_DEBT
      'tests/**',
      'node_modules/**',
    ],
  },
};
