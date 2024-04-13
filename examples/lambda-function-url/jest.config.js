/** @type {import('ts-jest').JestConfigWithTsJest} */

process.env.ORGANIZATION_TABLE = 'OrganizationTable'
process.env.USER_TABLE = 'UserTable'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
}