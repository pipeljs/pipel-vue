# 高级特性

## useStream - Hooks 风格 API

返回 `[stream$, value, setValue]` 元组,类似 React `useState`。

```typescript
import { useStream } from 'pipel-vue'

const [count$, count, setCount] = useStream(0)

// count 是只读 ref
console.log(count.value) // 0

// setCount 更新值
setCount(1)

// 也可以直接操作 stream
count$.next(2)
```

## computedStream$ - 计算流

基于多个流创建派生流,自动跟踪依赖。

```typescript
import { $, computedStream$ } from 'pipel-vue'

const price$ = $(100)
const quantity$ = $(2)

const total$ = computedStream$(() => price$.value * quantity$.value)

console.log(total$.value) // 200

price$.next(150)
console.log(total$.value) // 300
```

## watchStream - 监听流

将 Vue watch 源转换为流。

```typescript
import { ref } from 'vue'
import { watchStream } from 'pipel-vue'

const counter = ref(0)
const stream$ = watchStream(() => counter.value)

stream$.then(val => console.log('Changed:', val))

counter.value = 5 // 触发流
```

## fromEvent - 事件转流

从 DOM 事件创建流。

```typescript
import { ref } from 'vue'
import { fromEvent } from 'pipel-vue'

const buttonRef = ref<HTMLButtonElement>()

const clicks$ = fromEvent(buttonRef, 'click')

clicks$.then(event => {
  console.log('Clicked at:', event.timeStamp)
})
```

支持 Ref 作为目标:

```vue
<template>
  <button ref="buttonRef">Click me</button>
</template>

<script setup>
import { ref } from 'vue'
import { fromEvent } from 'pipel-vue'

const buttonRef = ref()
const clicks$ = fromEvent(buttonRef, 'click')

clicks$
  .pipe(throttle(1000))
  .then(() => console.log('Throttled click'))
</script>
```

## asyncStream$ - 异步流

处理异步操作,自动管理 loading/error 状态。

```typescript
import { asyncStream$ } from 'pipel-vue'

const fetchUser = async (id: number) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}

const { data$, loading$, error$, execute } = asyncStream$(fetchUser)

// 执行异步操作
execute(1)

// 响应式状态
console.log(loading$.value) // true
console.log(data$.value)    // undefined -> user data
console.log(error$.value)   // undefined or Error
```

在模板中使用:

```vue
<template>
  <div v-if="loading$">加载中...</div>
  <div v-else-if="error$">错误: {{ error$ }}</div>
  <div v-else>{{ data$ }}</div>
  
  <button @click="() => execute(userId)">刷新</button>
</template>

<script setup>
import { asyncStream$ } from 'pipel-vue'

const { data$, loading$, error$, execute } = asyncStream$(fetchUser)
</script>
```

## batch$ - 批量创建

快速创建多个流。

```typescript
import { batch$ } from 'pipel-vue'

const state = batch$({
  count: 0,
  name: 'John',
  active: true,
})

state.count.next(1)
state.name.next('Alice')
```

## persistStream$ - 持久化流

将流同步到 localStorage/sessionStorage。

```typescript
import { $, persistStream$ } from 'pipel-vue'

const theme$ = $('light')

// 持久化到 localStorage
persistStream$('app-theme', theme$)

// 修改会自动保存
theme$.next('dark')

// 刷新页面后自动恢复
```

自定义存储:

```typescript
persistStream$('key', stream$, sessionStorage)
```

## 综合示例

```vue
<template>
  <div>
    <!-- 双向绑定表单 -->
    <input v-model="searchInput" />
    
    <!-- 异步加载 -->
    <div v-if="loading$">搜索中...</div>
    <div v-else-if="error$">{{ error$ }}</div>
    <div v-else>
      <div v-for="item in data$" :key="item.id">
        {{ item.name }}
      </div>
    </div>
    
    <!-- 事件流 -->
    <button ref="loadMoreRef">加载更多</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  $,
  syncRef,
  asyncStream$,
  fromEvent,
  computedStream$,
} from 'pipel-vue'
import { debounce } from 'pipeljs'

const searchStream$ = $('')
const searchInput = ref('')
syncRef(searchStream$, searchInput)

const searchQuery$ = computedStream$(() => searchStream$.value.trim())

const searchFn = async (query: string) => {
  const res = await fetch(`/api/search?q=${query}`)
  return res.json()
}

const { data$, loading$, error$, execute } = asyncStream$(searchFn)

searchStream$
  .pipe(debounce(300))
  .then(query => {
    if (query) execute(query)
  })

const loadMoreRef = ref()
const loadMore$ = fromEvent(loadMoreRef, 'click')

loadMore$
  .pipe(throttle(1000))
  .then(() => {
    // 加载更多逻辑
  })
</script>
```
