# syncRef - 双向同步

## 介绍

`syncRef` 用于将 Pipel Stream 和 Vue Ref 进行双向绑定,常用于表单场景。

## 语法

```typescript
function syncRef<T>(stream$: Stream<T>, vueRef: Ref<T>): () => void
```

## 参数

- `stream$`: Pipel 流
- `vueRef`: Vue ref 对象

## 返回值

返回清理函数,调用后解除绑定

## 示例

### 基础用法

```typescript
import { ref } from 'vue'
import { $, syncRef } from 'pipel-vue'

const stream$ = $('')
const inputValue = ref('')

// 双向绑定
syncRef(stream$, inputValue)

// 修改 ref 会同步到 stream
inputValue.value = 'hello'
// stream$.value === 'hello'

// 修改 stream 会同步到 ref
stream$.next('world')
// inputValue.value === 'world'
```

### 表单绑定

```vue
<template>
  <input v-model="inputValue" />
  <div>Stream 值: {{ stream$ }}</div>
</template>

<script setup>
import { ref } from 'vue'
import { $, syncRef } from 'pipel-vue'

const stream$ = $('')
const inputValue = ref('')

syncRef(stream$, inputValue)

// 可以对 stream 应用操作符
stream$
  .pipe(debounce(300))
  .then(value => {
    console.log('防抖后:', value)
  })
</script>
```

### 手动清理

```typescript
const cleanup = syncRef(stream$, vueRef)

// 解除绑定
cleanup()
```

## 特性

- ✅ 双向同步
- ✅ 自动清理(组件卸载时)
- ✅ 支持深层对象
- ✅ 防止循环更新

## 最佳实践

1. **表单场景**: v-model 绑定 ref,同时在 stream 上应用操作符
2. **防抖输入**: 结合 debounce 操作符处理搜索框
3. **状态同步**: 保持 Vue 组件状态与 Pipel 流同步

## 注意事项

- 组件卸载时会自动清理
- 避免在同一个 stream 和 ref 上多次调用 syncRef
