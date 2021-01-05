const express = require('./express')

function getFramework ({ app }) {
  if (typeof app.handle === 'function') {
    return express
  }

  throw new Error('Invalid app supplied. Valid frameworks include: Express')
}

module.exports.getFramework = getFramework
