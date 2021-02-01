# sails

a [Sails v1](https://sailsjs.com) application

### serverless-express WIP

This example is a WIP which works locally by simulating a Lambda handler invocation, however, in production we're receiving 404 'Cannot GET /'.

This example was created by:

1. Running `npx sails new sails` to generate a starter app
2. Updating `app.js` with:

```js
const appPromise = new Promise((resolve) => {
  sails.lift(rc('sails'), () => {
    resolve(sails.hooks.http.app)
  })
})

module.exports = appPromise
```
1. Adding `lambda.js`, `scripts/local.js`, `api-gateway-event.json`, and `sam-template.yaml`
2. Updating `package.json` with `config` and `scripts`


### Links

+ [Sails framework documentation](https://sailsjs.com/get-started)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)


### Version info

This app was originally generated on Thu Jul 18 2019 12:18:57 GMT-0700 (Pacific Daylight Time) using Sails v1.2.3.

<!-- Internally, Sails used [`sails-generate@1.16.13`](https://github.com/balderdashy/sails-generate/tree/v1.16.13/lib/core-generators/new). -->



<!--
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

