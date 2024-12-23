export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    roots: ['<rootDir>/server'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
