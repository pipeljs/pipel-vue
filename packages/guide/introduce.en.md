# Introduction

pipel-vue is a streaming programming library based on [pipel](https://pipeljs.github.io/pipel-doc/index.html). It provides a series of practical stream methods and composable functions, deeply integrating the streaming programming paradigm with Vue's reactive system, fully enjoying the smooth development experience brought by streaming programming paradigm.

## Features

- 🌀 **Perfect Ecosystem Integration**: Seamlessly integrates with Vue's reactivity, sharing Vue's ecosystem and development tools
- 🌊 **Stream-based Programming**: Leverages pipel's powerful streaming programming capabilities to implement reactive programming for logic
- 🌈 **Stream Rendering**: More fine-grained stream rendering capabilities, controlling rendering timing and frequency in a stream-based way
- 🤖 **Development Experience**: Achieves ultimate debugging experience through plugins, enjoying the development experience brought by streaming programming

## Applicable Versions

- **Vue 3.2.0 and above**:
  - ✅ All stream subscription behaviors in Vue setup will automatically cancel subscriptions when components are destroyed
  - ✅ Stream data has reactive capabilities and can seamlessly integrate with Vue's reactive system
- **Vue 2.7.0 ~ 3.1.x versions**:
  - ❌ Stream [subscription behaviors](https://pipeljs.github.io/pipel-doc/en/guide/base.html#subscription-nodes) need to be manually [canceled](https://pipeljs.github.io/pipel-doc/en/guide/base.html#cancel-subscription), cannot automatically cancel subscriptions
  - ✅ Stream data has reactive capabilities and can seamlessly integrate with Vue's reactive system
- **Vue versions below 2.7.0**:
  - ❌ Stream subscription behaviors need to be manually [canceled](https://pipeljs.github.io/pipel-doc/en/guide/base.html#cancel-subscription), cannot automatically cancel subscriptions
  - ❌ Stream data doesn't have reactive capabilities, need to use [toCompt](https://pipeljs.github.io/pipel-vue/en/usePipel/#tocompt) to convert to reactive data

::: tip Note
We recommend Vue 3.2.0+ for optimal experience. You may see a peer dependency warning if using Vue < 3.2.0, but the library will still work.
:::
