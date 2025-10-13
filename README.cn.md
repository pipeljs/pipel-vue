# pipel-vue

<div align="center">
  <img src="./packages/public/logo.svg" alt="pipel-vue logo" width="120" height="120">
  <p style="margin-top: 20px;">基于 pipel 的 Vue 流式编程库</p>
</div>

<div align="center">

[![codecov](https://img.shields.io/codecov/c/github/pipeljs/pipel-vue?style=flat)](https://codecov.io/gh/pipeljs/pipel-vue)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/pipeljs/pipel-vue/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/pipel-vue.svg?style=flat)](https://www.npmjs.com/package/pipel-vue)
[![npm downloads](https://img.shields.io/npm/dm/pipel-vue.svg?style=flat)](https://www.npmjs.com/package/pipel-vue)
[![GitHub stars](https://img.shields.io/github/stars/pipeljs/pipel-vue?style=flat)](https://github.com/pipeljs/pipel-vue/stargazers)
[![Vue](https://img.shields.io/badge/Vue-3.2.0+-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/pipeljs/pipel-vue)

<div align="center">

[官方文档 📖 ](https://pipeljs.github.io/pipel-vue/cn/)

</div>

[English](./README.md) | [简体中文](./README.cn.md)

</div>

## 🎯 介绍

pipel-vue 是一个基于 [pipel](https://github.com/pipeljs/pipel) 的流式编程库。它提供了一系列实用的流方法和组合函数，将流式编程范式与 Vue 的响应式系统深度集成，享受流式编程范式带来的流畅开发体验。

## 🚀 特性

- 🌀 **完美融入生态**：与 vue 响应式无缝衔接，共享 vue 的生态和开发工具
- 🌊 **流式编程**：利用 pipel 强大的流式编程能力，实现逻辑的响应式编程
- 🌈 **流式渲染**：更细粒度的流式渲染能力，流式掌控渲染时机和渲染的频率
- 🤖 **开发体验**：通过插件实现极致的调试体验，享受流式编程带来的开发体验

## 📦 适用版本

- **Vue 3.2.0 及以上版本**：
  - ✅ Vue setup 中的所有流订阅行为会在组件销毁时自动取消订阅
  - ✅ 流数据具有响应式能力，可以与 Vue 的响应式系统无缝集成
- **Vue 2.7.0 ~ 3.1.x 版本**：
  - ❌ 流[订阅行为](https://pipeljs.github.io/pipel-doc/cn/guide/base.html#%E8%AE%A2%E9%98%85%E8%8A%82%E7%82%B9)需要手动[取消](https://pipeljs.github.io/pipel-doc/cn/guide/base.html#%E5%8F%96%E6%B6%88%E8%AE%A2%E9%98%85)，无法自动取消订阅
  - ✅ 流数据具有响应式能力，可以与 Vue 的响应式系统无缝集成
- **Vue 2.7.0 以下版本**：
  - ❌ 流订阅行为需要手动[取消](https://pipeljs.github.io/pipel-doc/cn/guide/base.html#%E5%8F%96%E6%B6%88%E8%AE%A2%E9%98%85)，无法自动取消订阅
  - ❌ 流数据不具备响应式能力，需要使用 [toCompt](https://pipeljs.github.io/pipel-vue/cn/usePipel/#tocompt) 转换为响应式数据

## 🛠️ 安装

```bash
npm install pipel-vue
# 或者
yarn add pipel-vue
# 或者
pnpm add pipel-vue
```

## 🎥 使用

[查看](https://code.juejin.cn/pen/7536440340963426314)

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
  "pipeljs",
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
