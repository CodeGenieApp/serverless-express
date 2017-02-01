#!/usr/bin/env node
'use strict'

const fs = require('fs')

module.exports.modifyFiles = function modifyFiles(files, replacements) {
  files.forEach((file) => {
    let fileContentModified = fs.readFileSync(file, 'utf8')

    replacements.forEach((v) => {
      fileContentModified = fileContentModified.replace(v.regexp, v.replacement)
    })

    fs.writeFileSync(file, fileContentModified, 'utf8')
  })
}
