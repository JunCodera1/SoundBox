export default { test: { environment: "node", env: { NODE_ENV: "test" }, include: ["tests/**/*.test.js"], fileParallelism: false, testTimeout: 20000 } };
