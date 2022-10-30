import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testMatch: ['**/server/src/**/*.(spec|test).[jt]s?(x)'],
	testEnvironment: 'node',
	moduleDirectories: ['node_modules', '<rootDir>'],
};

export default config;
