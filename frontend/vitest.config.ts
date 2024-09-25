export default ({
    test: {
        environment: 'jsdom',
        setupFiles: ['vitest.setup.ts'],
    },
    coverage: {
        reporter: ['html'],
        reportsDirectory: './coverage',
        all: true,
    },
});
