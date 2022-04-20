## [4.7.1](https://github.com/vendia/serverless-express/compare/v4.7.0...v4.7.1) (2022-04-20)


### Bug Fixes

* remove npm-force-resolutions ([9f23265](https://github.com/vendia/serverless-express/commit/9f23265b4c5f0f45c108acbffa67a8d8425366fb))

# [4.7.0](https://github.com/vendia/serverless-express/compare/v4.6.0...v4.7.0) (2022-04-19)


### Features

* added sqs as event source ([#483](https://github.com/vendia/serverless-express/issues/483)) ([3f86b23](https://github.com/vendia/serverless-express/commit/3f86b23d234bf1f814d2a79630f78302f0f8deae))

# [4.6.0](https://github.com/vendia/serverless-express/compare/v4.5.4...v4.6.0) (2022-04-19)


### Bug Fixes

* fix minimist security issue ([9be1f96](https://github.com/vendia/serverless-express/commit/9be1f96bc589e82d690dd7b0a5e15eba5929bf9c))
* npm audit fix ([0495697](https://github.com/vendia/serverless-express/commit/049569796d84019ca582cd5a200a3ad0bcb29a11))


### Features

* add Eventbridge events ([#477](https://github.com/vendia/serverless-express/issues/477)) ([a25cbad](https://github.com/vendia/serverless-express/commit/a25cbad4d81bbafafb00366d8554b8e2312ad78c))

## [4.5.4](https://github.com/vendia/serverless-express/compare/v4.5.3...v4.5.4) (2022-02-24)


### Bug Fixes

* npm audit fix ([81c52af](https://github.com/vendia/serverless-express/commit/81c52afdc8b3b658b765349255e381fffa664e6a))

## [4.5.3](https://github.com/vendia/serverless-express/compare/v4.5.2...v4.5.3) (2022-01-23)


### Bug Fixes

* **types:** add missing config params ([#486](https://github.com/vendia/serverless-express/issues/486)) ([#488](https://github.com/vendia/serverless-express/issues/488)) ([093af02](https://github.com/vendia/serverless-express/commit/093af02839d36be0806c7113eac83208590c9e2b))

## [4.5.2](https://github.com/vendia/serverless-express/compare/v4.5.1...v4.5.2) (2021-10-14)


### Bug Fixes

* ensure response header value is string type ([#474](https://github.com/vendia/serverless-express/issues/474)) ([cb4b0e8](https://github.com/vendia/serverless-express/commit/cb4b0e82642c0110095f267c66751ed01370f768))

## [4.5.1](https://github.com/vendia/serverless-express/compare/v4.5.0...v4.5.1) (2021-10-13)


### Bug Fixes

* bug when empty event headers ([#462](https://github.com/vendia/serverless-express/issues/462)) ([#463](https://github.com/vendia/serverless-express/issues/463)) ([2b66164](https://github.com/vendia/serverless-express/commit/2b661640c23940fc873f70409c4c9689b65e512d))

# [4.5.0](https://github.com/vendia/serverless-express/compare/v4.4.0...v4.5.0) (2021-10-13)


### Features

* support both enable/disable attribute for multi value headers on ALB ([#392](https://github.com/vendia/serverless-express/issues/392)) ([a5cb5b5](https://github.com/vendia/serverless-express/commit/a5cb5b5c6f0a9dfa17e23c4759a286483a80f45d))

# [4.4.0](https://github.com/vendia/serverless-express/compare/v4.3.12...v4.4.0) (2021-10-06)


### Features

* add support for SNS and DynamoDB event sources ([#468](https://github.com/vendia/serverless-express/issues/468)) ([276a6da](https://github.com/vendia/serverless-express/commit/276a6da64d22acec931dc0d567993f1e1f65597f))

## [4.3.12](https://github.com/vendia/serverless-express/compare/v4.3.11...v4.3.12) (2021-10-06)


### Bug Fixes

* change workflow to release under 14.x instead of 12.x ([#472](https://github.com/vendia/serverless-express/issues/472)) ([f949200](https://github.com/vendia/serverless-express/commit/f9492006f4d046023f6f3387f5ab36d2dd45691f))
* npm audit fix --force ([#469](https://github.com/vendia/serverless-express/issues/469)) ([35c686c](https://github.com/vendia/serverless-express/commit/35c686c95795ad146dc53f4a919c40adea5ffe0f))

## [4.3.11](https://github.com/vendia/serverless-express/compare/v4.3.10...v4.3.11) (2021-08-31)


### Bug Fixes

* revert [#441](https://github.com/vendia/serverless-express/issues/441) ([#455](https://github.com/vendia/serverless-express/issues/455)) ([87aa26f](https://github.com/vendia/serverless-express/commit/87aa26f5395de9dc22591a817a476a006268fa73)), closes [#454](https://github.com/vendia/serverless-express/issues/454)

## [4.3.10](https://github.com/vendia/serverless-express/compare/v4.3.9...v4.3.10) (2021-08-28)


### Bug Fixes

* fix for non-root proxy+ ([45edbfa](https://github.com/vendia/serverless-express/commit/45edbfa79bac97ce3429dda68add5ee16ab45d5b))

## [4.3.9](https://github.com/vendia/serverless-express/compare/v4.3.8...v4.3.9) (2021-06-09)


### Bug Fixes

* auto-unescape query parameters on ALB ([#219](https://github.com/vendia/serverless-express/issues/219), [#241](https://github.com/vendia/serverless-express/issues/241)) ([#393](https://github.com/vendia/serverless-express/issues/393)) ([8cb4206](https://github.com/vendia/serverless-express/commit/8cb4206103e730e61a3acb38fceba4cc9c355d91))

## [4.3.8](https://github.com/vendia/serverless-express/compare/v4.3.7...v4.3.8) (2021-05-31)


### Bug Fixes

* make headers an object instead of an array ([#386](https://github.com/vendia/serverless-express/issues/386)) ([a987fee](https://github.com/vendia/serverless-express/commit/a987feee3f8b3d03972b0756b22f9f363f65e739))

## [4.3.7](https://github.com/vendia/serverless-express/compare/v4.3.6...v4.3.7) (2021-05-11)


### Bug Fixes

* **deps:** npm audit fix ([3a64de6](https://github.com/vendia/serverless-express/commit/3a64de6d25a1249e1c18e03ad336afc75253837c))

## [4.3.6](https://github.com/vendia/serverless-express/compare/v4.3.5...v4.3.6) (2021-05-11)


### Bug Fixes

* **types:** update configure.d.ts ([#394](https://github.com/vendia/serverless-express/issues/394)) ([921319d](https://github.com/vendia/serverless-express/commit/921319dc4e2bf635bb02291de9fb961a2c7daa40))

## [4.3.5](https://github.com/vendia/serverless-express/compare/v4.3.4...v4.3.5) (2021-05-11)


### Bug Fixes

* fix aws api gateway v2 event source cookies handling ([#389](https://github.com/vendia/serverless-express/issues/389)) ([6e0868c](https://github.com/vendia/serverless-express/commit/6e0868cb7665cfbd8145205098c4945e0292d79b))

## [4.3.4](https://github.com/vendia/serverless-express/compare/v4.3.3...v4.3.4) (2021-03-03)


### Bug Fixes

* **types:** enhance accuracy of type definitions ([#379](https://github.com/vendia/serverless-express/issues/379)) ([15e11d2](https://github.com/vendia/serverless-express/commit/15e11d28d3e74193e820a9504f77619f50f6019c))

## [4.3.3](https://github.com/vendia/serverless-express/compare/v4.3.2...v4.3.3) (2021-02-25)


### Bug Fixes

* fix types ([#375](https://github.com/vendia/serverless-express/issues/375)) ([d0aad6a](https://github.com/vendia/serverless-express/commit/d0aad6a0d5a8317a02f9f59565f96573bb807764))

## [4.3.2](https://github.com/vendia/serverless-express/compare/v4.3.1...v4.3.2) (2021-02-18)


### Bug Fixes

* default contentEncodings and contentTypes to constants ([e0bd86e](https://github.com/vendia/serverless-express/commit/e0bd86e7b1ee5e2c26287ae6c8af54005df9e21d)), closes [#373](https://github.com/vendia/serverless-express/issues/373)
* refactor proxy and add deprecation warnings ([d50b7e7](https://github.com/vendia/serverless-express/commit/d50b7e7acf715f0e34ce401b8704f2970d79e2fa))

## [4.3.1](https://github.com/vendia/serverless-express/compare/v4.3.0...v4.3.1) (2021-02-13)


### Bug Fixes

* fix sam local for httpapi ([#371](https://github.com/vendia/serverless-express/issues/371)) ([b9df473](https://github.com/vendia/serverless-express/commit/b9df4730b8f5a9a14cd4fda6895d28286bc62017))

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
