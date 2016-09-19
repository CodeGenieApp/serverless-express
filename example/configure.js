#!/usr/bin/env node
'use strict'
const fs = require('fs')
const exec = require('child_process').exec
const args = process.argv.slice(2)
const accountId = args[0]
const bucketName = args[1]

if (!accountId || accountId.length !== 12) {
    console.error('You must supply a 12 digit account id as the first argument')
    return
}

if (!bucketName) {
    console.error('You must supply a bucket name as the second argument')
    return
}

exec('aws configure get region', (err, stdout, stderr) => {
    if (err) {
        console.log(err)
        return
    }

    if (stderr) {
        console.log(stderr)
        return
    }

    const region = stdout.match(/.*-.*-[0-9]*/)[0]// Command output has a newline

    modifySimpleProxyFile(region)
    modifyPackageFile(region)
})

function modifySimpleProxyFile(region) {
    const simpleProxyApiPath = './simple-proxy-api.yaml'
    const simpleProxyApi = fs.readFileSync(simpleProxyApiPath, 'utf8')
    const simpleProxyApiModified = simpleProxyApi
        .replace(/YOUR_ACCOUNT_ID/g, accountId)
        .replace(/YOUR_AWS_REGION/g, region)

    fs.writeFileSync(simpleProxyApiPath, simpleProxyApiModified, 'utf8')
}

function modifyPackageFile(region) {
    const packageJsonPath = './package.json'
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8')
    const packageJsonModified = packageJson.replace(/YOUR_UNIQUE_BUCKET_NAME/g, bucketName)

    fs.writeFileSync(packageJsonPath, packageJsonModified, 'utf8')
}
