# Advanced Features

## useStream - Hooks-style API

Returns `[stream$, value, setValue]` tuple, similar to React `useState`.

```typescript
import { useStream } from 'pipel-vue'

const [count$, count, setCount] = useStream(0)

// count is readonly ref
console.log(count.value) // 0

// setCount updates value
setCount(1)

// Can also manipulate stream directly
count$.next(2)
```

## computedStream$ - Computed Stream

Create derived stream from multiple sources with auto dependency tracking.

```typescript
import { $, computedStream$ } from 'pipel-vue'

const price$ = $(100)
const quantity$ = $(2)

const total$ = computedStream$(() => price$.value * quantity$.value)

console.log(total$.value) // 200

price$.next(150)
console.log(total$.value) // 300
```

## watchStream - Watch as Stream

Convert Vue watch source to stream.

```typescript
import { ref } from 'vue'
import { watchStream } from 'pipel-vue'

const counter = ref(0)
const stream$ = watchStream(() => counter.value)

stream$.then(val => console.log('Changed:', val))

counter.value = 5 // triggers stream
```

## fromEvent - Event to Stream

Create stream from DOM events.

```typescript
import { ref } from 'vue'
import { fromEvent } from 'pipel-vue'

const buttonRef = ref<HTMLButtonElement>()

const clicks$ = fromEvent(buttonRef, 'click')

clicks$.then(event => {
  console.log('Clicked at:', event.timeStamp)
})
```

Supports Ref as target:

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

## asyncStream$ - Async Stream

Handle async operations with auto loading/error state management.

```typescript
import { asyncStream$ } from 'pipel-vue'

const fetchUser = async (id: number) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}

const { data$, loading$, error$, execute } = asyncStream$(fetchUser)

// Execute async operation
execute(1)

// Reactive states
console.log(loading$.value) // true
console.log(data$.value)    // undefined -> user data
console.log(error$.value)   // undefined or Error
```

Use in template:

```vue
<template>
  <div v-if="loading$">Loading...</div>
  <div v-else-if="error$">Error: {{ error$ }}</div>
  <div v-else>{{ data$ }}</div>
  
  <button @click="() => execute(userId)">Refresh</button>
</template>

<script setup>
import { asyncStream$ } from 'pipel-vue'

const { data$, loading$, error$, execute } = asyncStream$(fetchUser)
</script>
```

## batch$ - Batch Create

Quickly create multiple streams.

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

## persistStream$ - Persist Stream

Sync stream to localStorage/sessionStorage.

```typescript
import { $, persistStream$ } from 'pipel-vue'

const theme$ = $('light')

// Persist to localStorage
persistStream$('app-theme', theme$)

// Changes auto-saved
theme$.next('dark')

// Auto-restored on page refresh
```

Custom storage:

```typescript
persistStream$('key', stream$, sessionStorage)
```

## Comprehensive Example

```vue
<template>
  <div>
    <!-- Bidirectional form binding -->
    <input v-model="searchInput" />
    
    <!-- Async loading -->
    <div v-if="loading$">Searching...</div>
    <div v-else-if="error$">{{ error$ }}</div>
    <div v-else>
      <div v-for="item in data$" :key="item.id">
        {{ item.name }}
      </div>
    </div>
    
    <!-- Event stream -->
    <button ref="loadMoreRef">Load More</button>
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
import { debounce } from 'pipel'

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
    // Load more logic
  })
</script>
```
