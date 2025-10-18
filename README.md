# pipel-vue

<div align="center">
  <img src="./packages/public/logo.svg" alt="pipel-vue logo" width="120" height="120">
  <p style="margin-top: 20px;">Flowline-based Streaming Programming Library for Vue</p>
</div>

<div align="center">

[![codecov](https://img.shields.io/codecov/c/github/flowlinejs/pipel-vue?style=flat)](https://codecov.io/gh/flowlinejs/pipel-vue)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/flowlinejs/pipel-vue/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/pipel-vue.svg?style=flat)](https://www.npmjs.com/package/pipel-vue)
[![npm downloads](https://img.shields.io/npm/dm/pipel-vue.svg?style=flat)](https://www.npmjs.com/package/pipel-vue)
[![GitHub stars](https://img.shields.io/github/stars/flowlinejs/pipel-vue?style=flat)](https://github.com/flowlinejs/pipel-vue/stargazers)
[![Vue](https://img.shields.io/badge/Vue-3.2.0+-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/flowlinejs/pipel-vue)

<div align="center">

[official website](https://flowlinejs.github.io/pipel-vue/en/)

</div>

[English](./README.md) | [简体中文](./README.cn.md)

</div>

## 🎯 Introduction

pipel-vue is a streaming programming library based on [flowline](https://github.com/flowlinejs/flowline). It provides a series of practical stream methods and composable functions, deeply integrating the streaming programming paradigm with Vue's reactive system, fully enjoying the smooth development experience brought by streaming programming.

## 🚀 Features

- 🌀 **Perfect Ecosystem Integration**: Seamlessly integrates with Vue's reactivity, sharing Vue's ecosystem and development tools
- 🌊 **Stream-based Programming**: Leverages flowline's powerful streaming programming capabilities to implement reactive programming for logic
- 🌈 **Stream Rendering**: More fine-grained stream rendering capabilities, giving you control over rendering timing and frequency
- 🤖 **Development Experience**: Achieves ultimate debugging experience through plugins, enjoying the development experience brought by streaming programming

## 📦 Applicable Versions

- **Vue 3.2.0 and above**:
  - ✅ All stream subscription behaviors in Vue setup will automatically cancel subscriptions when components are destroyed
  - ✅ Stream data has reactive capabilities and can seamlessly integrate with Vue's reactive system
- **Vue 2.7.0 ~ 3.1.x versions**:
  - ❌ Stream [subscription behaviors](https://pipeljs.github.io/pipel-doc/en/guide/base.html#subscription-node) need to be manually [canceled](https://pipeljs.github.io/pipel-doc/en/guide/base.html#unsubscribe), cannot automatically cancel subscriptions
  - ✅ Stream data has reactive capabilities and can seamlessly integrate with Vue's reactive system
- **Vue versions below 2.7.0**:
  - ❌ Stream subscription behaviors need to be manually [canceled](https://pipeljs.github.io/pipel-doc/en/guide/base.html#unsubscribe), cannot automatically cancel subscriptions
  - ❌ Stream data doesn't have reactive capabilities, need to use [toCompt](https://pipeljs.github.io/pipel-vue/en/usePipel/#tocompt) to convert to reactive data

## 🛠️ Installation

```bash
npm install pipel-vue
# or
yarn add pipel-vue
# or
pnpm add pipel-vue
```

## 🎥 Usage Example

[View](https://code.juejin.cn/pen/7536440340963426314)

```vue
<template>
  <div>{{ stream$ }}</div>
  <div>{{ tips$ }}</div>

  <button @click="updateStream">click</button>
</template>

<script setup lang="ts">
import { $, debounce, filter, map } from "pipel-vue";

const words = [
  "word",
  "i",
  "am",
  "flowline",
  "vue",
  "welcome",
  "everyone",
  "to",
  "try",
  "and",
  "experience",
  "the",
  "amazing",
  "pipel-vue",
  "library",
  "for",
  "reactive",
  "programming",
  "in",
  "vue",
  "applications",
];

const stream$ = $("hello");

const tips$ = stream$.pipe(
  debounce(300),
  map((value) => `debounce: ${value}`),
  filter((value) => value.includes("welcome")),
  map((value) => `filter: ${value}`),
);

const updateStream = () => {
  if (words.length > 0) {
    stream$.next(`${stream$.value} ${words.shift()}`);
  }
};
</script>
```


采用 Pipel 作为最终名？帮我批量完成：

包名与导出：pipel/package.json 改名、入口与徽标链接更新
文档与站点：文案、官网链接、徽标替换
生态包与示例：pipel-vue、pipel-vue-demo 依赖与导入名替换
徽章/CI：npm、codecov、homepage 地址同步更新