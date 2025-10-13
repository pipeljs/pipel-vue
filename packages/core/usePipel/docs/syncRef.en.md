# syncRef - Bidirectional Sync

## Introduction

`syncRef` creates a bidirectional binding between a Pipel Stream and a Vue Ref, commonly used in form scenarios.

## Syntax

```typescript
function syncRef<T>(stream$: Stream<T>, vueRef: Ref<T>): () => void
```

## Parameters

- `stream$`: Pipel stream
- `vueRef`: Vue ref object

## Returns

Returns a cleanup function to unbind

## Examples

### Basic Usage

```typescript
import { ref } from 'vue'
import { $, syncRef } from 'pipel-vue'

const stream$ = $('')
const inputValue = ref('')

// Bidirectional binding
syncRef(stream$, inputValue)

// Updating ref syncs to stream
inputValue.value = 'hello'
// stream$.value === 'hello'

// Updating stream syncs to ref
stream$.next('world')
// inputValue.value === 'world'
```

### Form Binding

```vue
<template>
  <input v-model="inputValue" />
  <div>Stream value: {{ stream$ }}</div>
</template>

<script setup>
import { ref } from 'vue'
import { $, syncRef } from 'pipel-vue'

const stream$ = $('')
const inputValue = ref('')

syncRef(stream$, inputValue)

// Apply operators on stream
stream$
  .pipe(debounce(300))
  .then(value => {
    console.log('Debounced:', value)
  })
</script>
```

### Manual Cleanup

```typescript
const cleanup = syncRef(stream$, vueRef)

// Unbind
cleanup()
```

## Features

- ✅ Bidirectional sync
- ✅ Auto cleanup (on component unmount)
- ✅ Deep object support
- ✅ Prevents circular updates

## Best Practices

1. **Forms**: Bind v-model to ref while applying operators on stream
2. **Debounced Input**: Combine with debounce for search boxes
3. **State Sync**: Keep Vue component state in sync with Pipel streams

## Notes

- Auto cleanup on component unmount
- Avoid calling syncRef multiple times on same stream/ref pair
