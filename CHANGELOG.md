# [1.1.0-beta.1](https://github.com/vue-modeler/model/compare/v1.0.7-beta.6...v1.1.0-beta.1) (2025-09-10)


### Code Refactoring

* **createModel:** remove export of create-model ([c263002](https://github.com/vue-modeler/model/commit/c263002d51ae38e77a0173d95b4ac04e4dfa919e))


### Features

* **proto-model:** enhance watch functionality and improve documentation ([749a2b9](https://github.com/vue-modeler/model/commit/749a2b9979216984c0643bc04dc6d0230e20d7d4))


### BREAKING CHANGES

* **createModel:** -  createModel function removed from public module API

## [1.0.7-beta.6](https://github.com/vue-modeler/model/compare/v1.0.7-beta.5...v1.0.7-beta.6) (2025-08-22)


### Code Refactoring

 * implements new way to create a model. The factory function `model` has been removed. The static method "model" is used to create the model. [qd98f069]
    
### BREAKING CHANGES
* the factory function `model` has been removed
* the model instance is not automatically placed in the dependency container. You must put the model instance into the container yourself when configuring dependencies.
* dependency on vue-modeler/dc has been removed


## [1.0.7-beta.5](https://github.com/vue-modeler/model/compare/v1.0.7-beta.4...v1.0.7-beta.5) (2025-08-19)


### Bug Fixes

* **tests:** update action decorator tests for promise handling ([367ed0f](https://github.com/vue-modeler/model/commit/367ed0fa2fbac2c6ae9d5ea76038dc474337b13a))


### Code Refactoring

* **decorator:** update TypeScript configuration and action decorator ([5dceb0c](https://github.com/vue-modeler/model/commit/5dceb0c53acb87fced831ecbd5ead191bb9c90f1))


### BREAKING CHANGES

* **decorator:** used new syntax for `action` decorator based on Decorator Proposal for TC39. It is not compatible with TypeScript experimental decorator. New syntax working only with TypeScript >= 5.0. see https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators

## [1.0.7-beta.4](https://github.com/vue-modeler/model/compare/v1.0.7-beta.3...v1.0.7-beta.4) (2025-08-15)


### Bug Fixes

* add '@vue-modeler/dc' to external dependencies in Vite config ([c3e03d4](https://github.com/vue-modeler/model/commit/c3e03d498a1af08317e5d82d86229ba0b6c71ded))

## [1.0.7-beta.3](https://github.com/vue-modeler/model/compare/v1.0.7-beta.2...v1.0.7-beta.3) (2025-08-12)


### Bug Fixes

* update .gitignore and adjust peer dependency version in package.json ([63f68df](https://github.com/vue-modeler/model/commit/63f68df6117ebfb6e2fb9dd7554de607ad4c3dff))
* update pnpm-lock.yaml for dependency version specification ([fc52be8](https://github.com/vue-modeler/model/commit/fc52be86c31dbc333ae6ae27ab6ed98fa23c4056))

## [1.0.7-beta.2](https://github.com/vue-modeler/model/compare/v1.0.7-beta.1...v1.0.7-beta.2) (2025-08-09)


### Bug Fixes

* enhance action decorator to accept both string and symbol types ([da62a24](https://github.com/vue-modeler/model/commit/da62a24041886cd5bc43916a3643b3eaf8a296e8))

## [1.0.7-beta.1](https://github.com/vue-modeler/model/compare/v1.0.6...v1.0.7-beta.1) (2025-08-03)

## [1.0.7](https://github.com/vue-modeler/model/compare/v1.0.6...v1.0.7) (2025-08-06)


### Bug Fixes

* update peer dependency version ranges in package.json ([696ac0c](https://github.com/vue-modeler/model/commit/696ac0c58c4d09304eb1cd29fadbc7b0ceeed3fc))
* update pnpm-lock.yaml for dependency version changes ([843ed8b](https://github.com/vue-modeler/model/commit/843ed8b8ced65ae4dd987cc4c794418c37bf64e9))

## [1.0.6](https://github.com/vue-modeler/model/compare/v1.0.5...v1.0.6) (2025-04-03)

## [1.0.6-beta.4](https://github.com/vue-modeler/model/compare/v1.0.6-beta.3...v1.0.6-beta.4) (2025-04-02)

## [1.0.6-beta.3](https://github.com/vue-modeler/model/compare/v1.0.6-beta.2...v1.0.6-beta.3) (2025-04-01)

## [1.0.6-beta.2](https://github.com/vue-modeler/model/compare/v1.0.6-beta.1...v1.0.6-beta.2) (2025-04-01)

## [1.0.6-beta.1](https://github.com/vue-modeler/model/compare/v1.0.5...v1.0.6-beta.1) (2025-04-01)

## [1.0.5](https://github.com/vue-modeler/model/compare/v1.0.4...v1.0.5) (2025-03-31)


### Bug Fixes

* remove unnecessary name field from vite.config.ts ([a74235c](https://github.com/vue-modeler/model/commit/a74235c2dfac7dca79536d89009a66a1fbd96885))

## [1.0.4](https://github.com/vue-modeler/model/compare/v1.0.3...v1.0.4) (2025-03-31)


### Bug Fixes

* remove main and module entry points from package.json ([172906b](https://github.com/vue-modeler/model/commit/172906beb17178666648897d56ec6bccd96141b5))

## [1.0.3](https://github.com/vue-modeler/model/compare/v1.0.2...v1.0.3) (2025-03-31)


### Bug Fixes

* update package.json and vite.config.ts for module file naming conventions ([2955f49](https://github.com/vue-modeler/model/commit/2955f4953b9d2776697285f5f7a4085a157d1936))

## [1.0.2](https://github.com/vue-modeler/model/compare/v1.0.1...v1.0.2) (2025-03-31)

## [1.0.1](https://github.com/vue-modeler/model/compare/v1.0.0...v1.0.1) (2025-03-31)

# 1.0.0 (2025-03-31)


### Features

* enhance Action class with improved error handling and state management ([0a652a3](https://github.com/vue-modeler/model/commit/0a652a394901cdb77732fb8b5f942c89458ef17e))
* enhance action decorator with error handling and original method preservation ([4962490](https://github.com/vue-modeler/model/commit/4962490c9202ebc0f0028d617833a512ce65803a))
* implement createModel function with proxy support and add unit tests ([cb3a992](https://github.com/vue-modeler/model/commit/cb3a9922592a41ca8a0144fce9148c3ffe8e94c7))
* update package dependencies and enhance Action class ([b462234](https://github.com/vue-modeler/model/commit/b462234003732b522be9e66c05faf9dd9c696dac))

# 1.0.0-beta.1 (2025-03-31)


### Features

* enhance Action class with improved error handling and state management ([0a652a3](https://github.com/vue-modeler/model/commit/0a652a394901cdb77732fb8b5f942c89458ef17e))
* enhance action decorator with error handling and original method preservation ([4962490](https://github.com/vue-modeler/model/commit/4962490c9202ebc0f0028d617833a512ce65803a))
* implement createModel function with proxy support and add unit tests ([cb3a992](https://github.com/vue-modeler/model/commit/cb3a9922592a41ca8a0144fce9148c3ffe8e94c7))
* update package dependencies and enhance Action class ([b462234](https://github.com/vue-modeler/model/commit/b462234003732b522be9e66c05faf9dd9c696dac))
