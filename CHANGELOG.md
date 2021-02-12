# [4.3.0](https://github.com/vendia/serverless-express/compare/v4.2.0...v4.3.0) (2021-02-08)


### Features

* add backwards compatibility for most of v3 usage ([184f63e](https://github.com/vendia/serverless-express/commit/184f63e4e07f7b669d9b14917413523d5bcd6986))
* serverlessExpress({ app }) can now be used as well as serverlessExpress({ app }).handler ([1eb3100](https://github.com/vendia/serverless-express/commit/1eb310079bbd0b80a457b482f8ce8c399c8f151e))

# [4.2.0](https://github.com/vendia/serverless-express/compare/v4.1.3...v4.2.0) (2021-02-08)


### Features

* add logSettings to override log level and default log level to error ([a0e8bdb](https://github.com/vendia/serverless-express/commit/a0e8bdb60687946cf36fb1157b8c23aea1c0dae9)), closes [#360](https://github.com/vendia/serverless-express/issues/360)

## [4.1.3](https://github.com/vendia/serverless-express/compare/v4.1.2...v4.1.3) (2021-02-04)


### Bug Fixes

* add query strings to lambda@edge ([b15a72c](https://github.com/vendia/serverless-express/commit/b15a72cbe31ee6799724837c182946c2f8937564))

## [4.1.2](https://github.com/vendia/serverless-express/compare/v4.1.1...v4.1.2) (2021-02-02)


### Bug Fixes

* only show debug logs in 'development' ([ad2cca3](https://github.com/vendia/serverless-express/commit/ad2cca3578bfe61f5acd8921175e1b0013a84c7d))

## [4.1.1](https://github.com/vendia/serverless-express/compare/v4.1.0...v4.1.1) (2021-02-02)


### Bug Fixes

* only show debug logs in 'development' ([b0c4814](https://github.com/vendia/serverless-express/commit/b0c4814482ac4ed4f4e201237c0fabd8b5852d46))

# [4.1.0](https://github.com/vendia/serverless-express/compare/v4.0.0...v4.1.0) (2021-02-01)


### Features

* add support for additional frameworks other than Express ([16628b3](https://github.com/vendia/serverless-express/commit/16628b38a271bbe7dbb912ae55fdb6558e0154ea))

# [4.0.0](https://github.com/vendia/serverless-express/compare/v3.3.5...v4.0.0) (2021-02-01)


### Bug Fixes

* **audit:** npm audit fix ([66b03e5](https://github.com/vendia/serverless-express/commit/66b03e57b2c3ec5447f457dfe3dd804acdfa8dc7))
* add body parsing for lambda edge event source ([116949d](https://github.com/vendia/serverless-express/commit/116949d286d2e14fbc71c7811bb980b0a5b2ea20))
* add Promise return type for proxy function ([#332](https://github.com/vendia/serverless-express/issues/332)) ([5b23f3c](https://github.com/vendia/serverless-express/commit/5b23f3c7f3086a61fe359d9ca338c7c27137bcce))
* change logging to include a log key ([542d473](https://github.com/vendia/serverless-express/commit/542d47301bdfd0831e98dd443b6f4808010b30d0))
* clean up sockets on EADDRINUSE server close ([e768599](https://github.com/vendia/serverless-express/commit/e7685999acff9ee10bee188e9d6629777bceb2d8))
* dependabot alerts ([df60394](https://github.com/vendia/serverless-express/commit/df60394476116763c017faa0f44b72aefc559aa6))
* fix API Gateway V2 header response ([90bad18](https://github.com/vendia/serverless-express/commit/90bad18762f0f9548c1a1edba6eaa6a5913409ab)), closes [#352](https://github.com/vendia/serverless-express/issues/352)
* fix getRequestValuesFromEvent headers ([f915e94](https://github.com/vendia/serverless-express/commit/f915e9489b27ab77cfde55e4aa2c5b63737004e7))
* fix Lambda@Edge event source ([95b0aa6](https://github.com/vendia/serverless-express/commit/95b0aa6df746c7bb6751dd48787c2490a8ac1704))
* fix Lambda@Edge headers and body ([aabd9d3](https://github.com/vendia/serverless-express/commit/aabd9d3e23827b17215a2a0743d9720b70209aaf))
* fix remoteAddress undefined on ALB event source ([a092233](https://github.com/vendia/serverless-express/commit/a0922331446d9045dd7cd5897ebb7820619afcbe))
* log actual headers in SERVERLESS_EXPRESS:FORWARD_RESPONSE:EVENT_SOURCE_RESPONSE_PARAMS ([72f2ef5](https://github.com/vendia/serverless-express/commit/72f2ef52ee7ec98dd450e385925f353203c5a945))
* make optional the property `binarySettings` of `ConfigureParams` in typings ([b08ee87](https://github.com/vendia/serverless-express/commit/b08ee8748eb198aeeb684ff83378aa63687d2675))
* remove commitlint from travis ([7b12e56](https://github.com/vendia/serverless-express/commit/7b12e569c558c304f93fcb4e30f1533729468f2c))
* remove Node.js 4 support ([713ad14](https://github.com/vendia/serverless-express/commit/713ad14d4dbd4a938d88764b4302c92b7898f336))
* remove Node.js 4 support ([e01c9af](https://github.com/vendia/serverless-express/commit/e01c9af6ea34def7f648d22c0d863a46efa6f879))
* remove winston dependency and add basic logger ([5bd6c2c](https://github.com/vendia/serverless-express/commit/5bd6c2c895f44c0e0b3d025202f59a7539d1b8a3))
* transform lambda edge response headers to lower case ([922fec0](https://github.com/vendia/serverless-express/commit/922fec0ed38ebddf6887464414c111e4691e6bfb))
* transform request header keys to lower case ([daa656b](https://github.com/vendia/serverless-express/commit/daa656bda160404b0d5009a832ef2565f7faed00))
* update dependencies ([e705bc6](https://github.com/vendia/serverless-express/commit/e705bc6697d26d9348ae39ec9231fe2e3b629548))
* update dependencies ([075e15b](https://github.com/vendia/serverless-express/commit/075e15b6bf2e887a83d9b070e369e6bb0e909a09))
* update dependencies ([39c55eb](https://github.com/vendia/serverless-express/commit/39c55eb8feb980c3b8261d203686e2a2f453be86))


### Features

* add additional event mapping logic ([e5909b5](https://github.com/vendia/serverless-express/commit/e5909b58282e24aa6cf97b33fa1c782b4f27a589))
* add custom mapping example ([fe99c85](https://github.com/vendia/serverless-express/commit/fe99c85704997343aded82b85c3cc0cbd936c34a))
* add HTTP API (APIGW-V2) event source ([60cb8e1](https://github.com/vendia/serverless-express/commit/60cb8e1c0f43ea8dad8463c5c37cb4cd450617da))
* add lambda edge support and example ([230c9c5](https://github.com/vendia/serverless-express/commit/230c9c59c7a67b441a81afc851d7fc9a2ca27e8a))
* add logger ([e35a348](https://github.com/vendia/serverless-express/commit/e35a3484cd8da4b1bc436565ffe1e7318e3cf08a))
* add multiValueHeader and multiValueQueryStringParameters ([7199aa5](https://github.com/vendia/serverless-express/commit/7199aa52d9af72b238c72253b56d3a2ed4766de9))
* add respondWithErrors config ([53cf974](https://github.com/vendia/serverless-express/commit/53cf9744aef95de357330d29c02a0d17296c03c2))
* add stripBasePath for custom domain names ([3a5c7ed](https://github.com/vendia/serverless-express/commit/3a5c7ed3d86950a321d3de75e49820394aa12c08))
* auto-detect binary response and add binarySettings ([64a99dc](https://github.com/vendia/serverless-express/commit/64a99dca400ec2b7bc7487f1312a565a14b251b4))
* call Express directly instead of via a proxy server running on a local socket ([a468c72](https://github.com/vendia/serverless-express/commit/a468c7242a94e38ea7b5283d6bccb66331ece069))
* lay groundwork for different event sources ([2db86f2](https://github.com/vendia/serverless-express/commit/2db86f28f37658198d19654bbc8852843b65a9e7))
* refactor and expose a new interface ([7de5d45](https://github.com/vendia/serverless-express/commit/7de5d454284522806bddee21c7ea4dd6636bba3b))
* remove middleware and expose getCurrentLambdaInvoke method ([b56c13b](https://github.com/vendia/serverless-express/commit/b56c13bc43cdadf20abfde0f9de55a2fc64f537b))
* use multiValueHeaders for requests and responses ([c5ce62f](https://github.com/vendia/serverless-express/commit/c5ce62f5674fac397fccac75b06d138144001e57))
* use promise resolution by default ([a9c01a3](https://github.com/vendia/serverless-express/commit/a9c01a3581f486f9e226730a8f871d704faa4cb1))


### BREAKING CHANGES

* The new interface is backwards incompatible and includes new and simpler ways of configuring and using the package.

<a name="3.3.5"></a>
## [3.3.5](https://github.com/awslabs/aws-serverless-express/compare/v3.3.4...v3.3.5) (2018-08-20)


### Bug Fixes

* apply Content-Length header when missing ([b0927b8](https://github.com/awslabs/aws-serverless-express/commit/b0927b8)), closes [#147](https://github.com/awslabs/aws-serverless-express/issues/147) [#106](https://github.com/awslabs/aws-serverless-express/issues/106) [#130](https://github.com/awslabs/aws-serverless-express/issues/130)
* apply Content-Length header when missing ([#175](https://github.com/awslabs/aws-serverless-express/issues/175)) ([c2f416b](https://github.com/awslabs/aws-serverless-express/commit/c2f416b))

<a name="3.3.4"></a>
## [3.3.4](https://github.com/awslabs/aws-serverless-express/compare/v3.3.3...v3.3.4) (2018-08-19)


### Bug Fixes

* update example to use 3.3.3 ([bc7bdaf](https://github.com/awslabs/aws-serverless-express/commit/bc7bdaf))

<a name="3.3.3"></a>
## [3.3.3](https://github.com/awslabs/aws-serverless-express/compare/v3.3.2...v3.3.3) (2018-08-16)


### Bug Fixes

* add src/ to package.json files ([a412ec7](https://github.com/awslabs/aws-serverless-express/commit/a412ec7))

<a name="3.3.0"></a>
# [3.3.0](https://github.com/awslabs/aws-serverless-express/compare/v3.2.0...v3.3.0) (2018-08-16)


### Features

* add option of specifying resolveMode ([#173](https://github.com/awslabs/aws-serverless-express/issues/173)) ([582b88d](https://github.com/awslabs/aws-serverless-express/commit/582b88d))
