/** @type {import('vitest').UserConfig} */
export default {
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
};
