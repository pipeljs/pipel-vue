import { Stream, Observable } from "pipel";
import { cloneDeep } from "lodash-es";
import {
  ref,
  computed,
  shallowRef,
  isRef,
  isReactive,
  toRaw,
  Reactive,
  Ref,
  ComputedRef,
  onScopeDispose,
  getCurrentScope,
  effectScope,
  EffectScope,
  defineComponent,
  VNodeChild,
  DefineComponent,
  RenderFunction,
  h,
  watch,
} from "vue";

export * from "pipel";

const skipKey = "__v_skip";
const isRefKey = "__v_isRef";
const isShallowRefKey = "__v_isShallow";

// enhance pipel stream and observable to have ref property
declare module "pipel" {
  interface Stream<T> extends Readonly<Ref<T>> {
    toCompt: () => ComputedRef<T>;
    render$: (
      renderFn?: (value: T) => VNodeChild | DefineComponent,
    ) => VNodeChild;
  }
  interface Observable<T> extends Readonly<Ref<T | undefined>> {
    toCompt: () => ComputedRef<T | undefined>;
    render$: (
      renderFn?: (value: T | undefined) => VNodeChild | DefineComponent,
    ) => VNodeChild;
  }
}

/**
 * convert stream or observable to computed ref
 * @param this stream or observable
 * @returns computed ref
 */
function toCompt<T>(this: Stream<T> | Observable<T>): ComputedRef<T> {
  // check input type
  if (!(this instanceof Stream) && !(this instanceof Observable)) {
    throw new Error("toComp only accepts Stream or Observable as input");
  }

  const value = ref(this.value);
  this.then((v: T) => {
    value.value = v;
  });
  return computed(() => value.value);
}

/**
 * create a component that render the stream value with render function or define component
 * @param this stream or observable
 * @param renderFn render function, if not provided, the stream value will be rendered as a span element
 * @returns component
 */
function render$<T>(
  this: Stream<T> | Observable<T>,
  renderFn?: (value: T) => VNodeChild | DefineComponent,
): VNodeChild {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const arg$ = this;
  const component = defineComponent({
    name: "PipelRender",
    setup() {
      const value = arg$.toCompt();
      // vue-devtool friendly
      return { value };
    },
    render() {
      if (typeof renderFn === "function") {
        try {
          // Safer type handling - handle undefined case
          const safeValue =
            this.value !== undefined ? this.value : (undefined as unknown as T);
          const result = renderFn(safeValue as T);

          // Handle null/undefined results
          if (result === null || result === undefined) {
            return ""; // Return empty string for null/undefined
          }

          // Check if it's a Vue component with improved detection (inline)
          const isComponent = (() => {
            if (typeof result === "function") {
              return true; // Function component
            }

            if (typeof result === "object" && result !== null) {
              // More strict component detection to avoid false positives
              const hasSetup =
                "setup" in result && typeof result.setup === "function";
              const hasRender =
                "render" in result && typeof result.render === "function";
              const hasTemplate =
                "template" in result && typeof result.template === "string";

              // Only consider it a component if it has functional properties, not just a name
              return hasSetup || hasRender || hasTemplate;
            }

            return false;
          })();

          if (isComponent) {
            return h(result as any);
          }

          // Otherwise return VNode directly
          return result;
        } catch (error) {
          // Error handling: render fallback content
          console.error("pipel render function run error:", error);
          return "";
        }
      } else {
        // Use textContent instead of innerHTML for better security (inline safeToString)
        const safeText = (() => {
          if (this.value === null || this.value === undefined) {
            return "";
          }
          return String(this.value);
        })();
        return safeText;
      }
    },
  });

  return h(component);
}

/**
 * enhance pipel stream and observable to have ref property
 * @param arg$ pipel stream
 */
function enhancePipelStream(arg$: Stream | Observable) {
  if ((arg$ as any)[isRefKey]) return;

  // set observable to ref
  (arg$ as any)[isRefKey] = true;
  (arg$ as any)[isShallowRefKey] = true;
  // add toCompt and render method to stream
  (arg$ as any).toCompt = toCompt;
  (arg$ as any).render$ = render$;

  const value = shallowRef<any>(arg$.value);
  // update ref value when observable value changes
  arg$.afterSetValue((v) => {
    value.value = v;
  });

  Object.defineProperty(arg$, "value", {
    get: () => value.value,
    enumerable: true,
    configurable: true,
  });
}

/**
 * vue plugin for pipel
 */
export const vuePlugin = {
  thenAll: (unsubscribe: () => void, observable: Observable) => {
    if (getCurrentScope()) onScopeDispose(unsubscribe);
    if (!(observable as any)[skipKey]) (observable as any)[skipKey] = true;
    enhancePipelStream(observable);
  },
};

/**
 * convert vue ref or computed ref or reactive to stream
 * @param arg vue ref or computed ref or reactive
 * @returns stream
 */
export function to$<T>(arg: Ref<T> | ComputedRef<T> | Reactive<T>): Stream<T> {
  const getClonedValue = (arg: Ref<T> | ComputedRef<T> | Reactive<T>) => {
    if (isRef(arg)) {
      return cloneDeep(arg.value);
    }
    if (isReactive(arg)) {
      return cloneDeep(toRaw(arg));
    }
    return cloneDeep(arg as any);
  };
  const stream$ = $<T>(getClonedValue(arg));

  const unWatch = watch(
    () => arg,
    () => {
      stream$.next(getClonedValue(arg));
    },
    { deep: true, immediate: false },
  );

  stream$.afterUnsubscribe(() => {
    unWatch();
  });

  return stream$;
}

/**
 * create a render effect scope wrapper that will clean up previous and last effect when render function is called
 * @param render render function
 * @returns render function
 */
export function effect$(render: RenderFunction): () => VNodeChild {
  let currentScope: EffectScope | null = null;

  //  remove last render effect when component unmount
  if (getCurrentScope()) {
    onScopeDispose(() => {
      currentScope?.stop();
    });
  }

  return function () {
    // remove previous render effect when render function is called again
    currentScope?.stop();

    // create a new effect scope
    const scope = effectScope?.();
    currentScope = scope;

    let result: VNodeChild | null = null;
    // Execute the render function within the new scope
    scope &&
      scope.run(() => {
        result = render();
      });

    return result;
  };
}

/**
 * batch convert object properties to streams
 * for recover stream or observable type which deconstructed in vue reactive
 * observable properties will also be converted to Stream
 * but once used some stream methods, it will be throw error
 * from a practical point of view, we can just convert all properties to Stream
 *
 * example:
 * const obj = reactive({
 *   a$: $("a"),
 *   b$: $("b"),
 * })
 * const { a$, b$ } = recover$(obj)
 * a$.next("c") // obj.a$ will be updated to "c"
 * b$.next("d") // obj.b$ will be updated to "d"
 *
 * @param reactiveObj reactive object
 * @returns object with converted streams
 */
export function recover$<T extends Record<string, any>>(
  reactiveObj: T,
): {
  [K in keyof T]: Stream<T[K]>;
} {
  return toRaw(reactiveObj) as any;
}

/**
 * create stream factory with default plugin
 */
export function $<T = any>(): Stream<T | undefined>;
export function $<T = any>(data: T): Stream<T>;

export function $<T = any>(data?: T) {
  const stream$ = new Stream<T>(data);
  (stream$ as any)[skipKey] = true;
  enhancePipelStream(stream$);
  return stream$.use(vuePlugin);
}

/**
 * sync stream and ref bidirectionally
 * useful for v-model scenarios
 * @param stream$ pipel stream
 * @param vueRef vue ref
 * @returns unwatch function
 */
export function syncRef<T>(stream$: Stream<T>, vueRef: Ref<T>): () => void {
  // sync ref to stream
  const unwatchRef = watch(
    vueRef,
    (newVal) => {
      if (newVal !== stream$.value) {
        stream$.next(newVal);
      }
    },
    { deep: true },
  );

  // sync stream to ref
  stream$.then((newVal) => {
    if (newVal !== vueRef.value) {
      vueRef.value = newVal;
    }
  });

  const cleanup = () => {
    unwatchRef();
    stream$.complete();
  };

  if (getCurrentScope()) {
    onScopeDispose(cleanup);
  }

  return cleanup;
}

/**
 * create a stream with hooks-style API
 * returns [stream$, value (readonly ref), setValue]
 * @param initialValue initial value
 * @returns tuple of stream, value ref, and setter
 */
export function useStream<T = any>(
  initialValue: T,
): [Stream<T>, Readonly<Ref<T>>, (value: T) => void] {
  const stream$ = $(initialValue);
  const valueRef = computed(() => stream$.value);
  const setValue = (value: T) => stream$.next(value);

  return [stream$, valueRef, setValue];
}

/**
 * create a computed stream from multiple streams
 * automatically tracks dependencies and updates
 * @param getter compute function
 * @returns computed stream
 */
export function computedStream$<T>(getter: () => T): Stream<T> {
  const result$ = $<T>() as Stream<T>;
  const computedValue = computed(getter);

  watch(
    computedValue,
    (newVal) => {
      result$.next(newVal);
    },
    { immediate: true },
  );

  return result$;
}

/**
 * watch a source and emit values as stream
 * @param source watch source
 * @param callback optional callback
 * @returns stream of watch values
 */
export function watchStream<T>(
  source: () => T,
  callback?: (value: T) => void,
): Stream<T> {
  const stream$ = $<T>() as Stream<T>;

  watch(
    source,
    (newVal) => {
      stream$.next(newVal);
      callback?.(newVal);
    },
    { immediate: true },
  );

  return stream$;
}

/**
 * create stream from DOM event
 * @param target event target (element or ref)
 * @param event event name
 * @returns stream of events
 */
export function fromEvent<T extends Event = Event>(
  target: EventTarget | Ref<EventTarget | null | undefined>,
  event: string,
): Stream<T> {
  const stream$ = $<T>() as Stream<T>;

  const getTarget = () => (isRef(target) ? target.value : target);

  const handler = (e: Event) => {
    stream$.next(e as T);
  };

  const attach = () => {
    const t = getTarget();
    if (t) {
      t.addEventListener(event, handler);
    }
  };

  const detach = () => {
    const t = getTarget();
    if (t) {
      t.removeEventListener(event, handler);
    }
  };

  if (isRef(target)) {
    watch(target, (newTarget, oldTarget) => {
      if (oldTarget) {
        oldTarget.removeEventListener(event, handler);
      }
      if (newTarget) {
        newTarget.addEventListener(event, handler);
      }
    });
  }

  attach();

  stream$.afterUnsubscribe(() => {
    detach();
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stream$.complete();
    });
  }

  return stream$;
}

/**
 * create async stream with loading/error state
 * @param asyncFn async function
 * @returns object with data$, loading$, error$, execute
 */
export function asyncStream$<T>(asyncFn: (...args: any[]) => Promise<T>): {
  data$: Stream<T | undefined>;
  loading$: Stream<boolean>;
  error$: Stream<Error | undefined>;
  execute: (...args: any[]) => Promise<void>;
} {
  const data$ = $<T | undefined>(undefined);
  const loading$ = $(false);
  const error$ = $<Error | undefined>(undefined);

  const execute = async (...args: any[]) => {
    loading$.next(true);
    error$.next(undefined);

    try {
      const result = await asyncFn(...args);
      data$.next(result);
    } catch (e) {
      error$.next(e as Error);
    } finally {
      loading$.next(false);
    }
  };

  return { data$, loading$, error$, execute };
}

/**
 * batch create multiple streams
 * @param config object with stream names and initial values
 * @returns object with created streams
 */
export function batch$<T extends Record<string, any>>(
  config: T,
): { [K in keyof T]: Stream<T[K]> } {
  const result: any = {};

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      result[key] = $(config[key]);
    }
  }

  return result;
}

/**
 * persist stream to localStorage/sessionStorage
 * @param key storage key
 * @param stream$ stream to persist
 * @param storage storage type (default: localStorage)
 * @returns cleanup function
 */
export function persistStream$<T>(
  key: string,
  stream$: Stream<T>,
  storage: Storage = typeof localStorage !== "undefined"
    ? localStorage
    : ({} as Storage),
): () => void {
  // load initial value from storage
  try {
    const stored = storage.getItem(key);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      stream$.next(parsed);
    }
  } catch (e) {
    console.warn(`Failed to load persisted stream ${key}:`, e);
  }

  // save on change
  const unsubscribe = stream$.then((value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to persist stream ${key}:`, e);
    }
  });

  const cleanup = () => {
    unsubscribe.unsubscribe();
  };

  if (getCurrentScope()) {
    onScopeDispose(cleanup);
  }

  return cleanup;
}

/**
 * set global factory
 */
if (typeof globalThis !== "undefined") {
  (globalThis as any).__pipel_global_factory__ = $;
} else if (typeof window !== "undefined") {
  // @ts-expect-error window is not defined in node
  window.__pipel_global_factory__ = $;
}
// @ts-expect-error global is not defined in browser
else if (typeof global !== "undefined") {
  // @ts-expect-error global is not defined in browser
  global.__pipel_global_factory__ = $;
} else if (typeof self !== "undefined") {
  // @ts-expect-error self is not defined in browser
  self.__pipel_global_factory__ = $;
}
