import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref, computed } from "vue";
import {
  $,
  computedStream$,
  watchStream,
  asyncStream$,
  batch$,
  persistStream$,
} from "../index";

describe("Advanced usePipel features", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("computedStream$", () => {
    it("should create computed stream from multiple sources", async () => {
      const a$ = $(10);
      const b$ = $(20);

      const sum$ = computedStream$(() => a$.value + b$.value);

      expect(sum$.value).toBe(30);

      a$.next(15);
      await vi.runAllTimersAsync();

      expect(sum$.value).toBe(35);
    });

    it("should auto-track dependencies", async () => {
      const price$ = $(100);
      const quantity$ = $(2);

      const total$ = computedStream$(() => price$.value * quantity$.value);

      expect(total$.value).toBe(200);

      quantity$.next(3);
      await vi.runAllTimersAsync();

      expect(total$.value).toBe(300);
    });
  });

  describe("watchStream", () => {
    it("should create stream from watch source", async () => {
      const counter = ref(0);
      const stream$ = watchStream(() => counter.value);

      expect(stream$.value).toBe(0);

      counter.value = 5;
      await vi.runAllTimersAsync();

      expect(stream$.value).toBe(5);
    });

    it("should call callback on change", async () => {
      const counter = ref(0);
      const values: number[] = [];

      watchStream(() => counter.value, (val) => values.push(val));

      counter.value = 1;
      await vi.runAllTimersAsync();

      expect(values).toContain(1);
    });
  });

  describe("asyncStream$", () => {
    it("should handle async operations with loading state", async () => {
      const asyncFn = vi.fn(async (x: number) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return x * 2;
      });

      const { data$, loading$, error$, execute } = asyncStream$(asyncFn);

      expect(loading$.value).toBe(false);
      expect(data$.value).toBeUndefined();

      const promise = execute(5);
      expect(loading$.value).toBe(true);

      vi.advanceTimersByTime(100);
      await promise;
      await vi.runAllTimersAsync();

      expect(loading$.value).toBe(false);
      expect(data$.value).toBe(10);
      expect(error$.value).toBeUndefined();
    });

    it("should handle errors", async () => {
      const asyncFn = vi.fn(async () => {
        throw new Error("Test error");
      });

      const { data$, loading$, error$, execute } = asyncStream$(asyncFn);

      await execute();
      await vi.runAllTimersAsync();

      expect(loading$.value).toBe(false);
      expect(error$.value).toBeInstanceOf(Error);
      expect(error$.value?.message).toBe("Test error");
    });
  });

  describe("batch$", () => {
    it("should create multiple streams", () => {
      const streams = batch$({
        count: 0,
        name: "test",
        active: true,
      });

      expect(streams.count.value).toBe(0);
      expect(streams.name.value).toBe("test");
      expect(streams.active.value).toBe(true);
    });

    it("should allow updating individual streams", async () => {
      const streams = batch$({
        x: 10,
        y: 20,
      });

      streams.x.next(15);
      await vi.runAllTimersAsync();

      expect(streams.x.value).toBe(15);
      expect(streams.y.value).toBe(20);
    });
  });

  describe("persistStream$", () => {
    let mockStorage: Record<string, string>;

    beforeEach(() => {
      mockStorage = {};
      const storage = {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
        clear: () => {
          mockStorage = {};
        },
        length: 0,
        key: () => null,
      };

      vi.stubGlobal("localStorage", storage);
    });

    it("should persist stream to storage", async () => {
      const stream$ = $(42);

      persistStream$("testKey", stream$);

      stream$.next(100);
      await vi.runAllTimersAsync();

      expect(mockStorage.testKey).toBe("100");
    });

    it("should load initial value from storage", async () => {
      mockStorage.testKey = JSON.stringify(999);

      const stream$ = $(0);
      persistStream$("testKey", stream$);

      await vi.runAllTimersAsync();

      expect(stream$.value).toBe(999);
    });

    it("should handle objects", async () => {
      const stream$ = $({ count: 0 });

      persistStream$("objKey", stream$);

      stream$.next({ count: 5 });
      await vi.runAllTimersAsync();

      const stored = JSON.parse(mockStorage.objKey);
      expect(stored.count).toBe(5);
    });
  });
});
