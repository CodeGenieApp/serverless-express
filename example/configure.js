#!/usr/bin/env node
'use strict'
const fs = require('fs')
const exec = require('child_process').exec
const args = process.argv.slice(2)
const accountId = args[0]
const bucketName = args[1]
const region = args[2] || 'us-east-1'

if (!accountId || accountId.length !== 12) {
    console.error('You must supply a 12 digit account id as the first argument')
    return
}

if (!bucketName) {
    console.error('You must supply a bucket name as the second argument')
    return
}

if (!region.test(/.*-.*-[0-9]*/)) {
    console.warn('The supplied region does not match the expected pattern, eg. us-east-1')
}

modifyCloudFormationFile()
modifySimpleProxyFile()
modifyPackageFile()

function modifyCloudFormationFile() {
    const cloudFormationPath = './cloudformation.json'
    const cloudFormation = fs.readFileSync(cloudFormationPath, 'utf8')
    const cloudFormationModified = cloudFormation
        .replace(/YOUR_ACCOUNT_ID/g, accountId)
        .replace(/YOUR_AWS_REGION/g, region)

    fs.writeFileSync(cloudFormationPath, cloudFormationModified, 'utf8')
}

function modifySimpleProxyFile() {
    const simpleProxyApiPath = './simple-proxy-api.yaml'
    const simpleProxyApi = fs.readFileSync(simpleProxyApiPath, 'utf8')
    const simpleProxyApiModified = simpleProxyApi
        .replace(/YOUR_ACCOUNT_ID/g, accountId)
        .replace(/YOUR_AWS_REGION/g, region)

    fs.writeFileSync(simpleProxyApiPath, simpleProxyApiModified, 'utf8')
}

function modifyPackageFile() {
    const packageJsonPath = './package.json'
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8')
    const packageJsonModified = packageJson
        .replace(/YOUR_UNIQUE_BUCKET_NAME/g, bucketName)
        .replace(/YOUR_AWS_REGION/g, region)

    fs.writeFileSync(packageJsonPath, packageJsonModified, 'utf8')
}
