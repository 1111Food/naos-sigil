/** @type {import('vitest').UserConfig} */
export default {
  test: {
    globals: true,
    environment: 'node',
    include: ['server/src/**/*.test.ts'],
  },
};
