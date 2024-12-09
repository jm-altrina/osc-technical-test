export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testPathIgnorePatterns: ["<rootDir>/dist/"], // Ignore the dist folder
    modulePathIgnorePatterns: ["<rootDir>/dist/"], // Also ignore dist for module resolution
};