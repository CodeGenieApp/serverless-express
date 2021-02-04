#!/usr/bin/env node

function isTrue (value) {
  return !!value && value !== '0' && value !== 'false'
}

const envDisable = isTrue(process.env.DISABLE_OPENCOLLECTIVE) || isTrue(process.env.OPEN_SOURCE_CONTRIBUTOR) || isTrue(process.env.CI)
const logLevel = process.env.npm_config_loglevel
const logLevelDisplay = ['silent', 'error', 'warn'].indexOf(logLevel) > -1

if (!envDisable && !logLevelDisplay) {
  console.log('\u001b[96m\u001b[1mThank you for using Serverless Express by Vendia!\u001b[96m\u001b[1m')
  console.log('\u001b[0m\u001b[96mVendia just released their Developer Preview of Vendia Share, a service that lets you share data with partners on a distributed ledger with ease!\u001b[22m\u001b[39m')
  console.log('\u001b[0m\u001b[96mSign up for the Developer Preview at https://vendia.net?ref=se \u001b[22m\u001b[39m')
}
