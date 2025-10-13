import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { $, syncRef } from "../index";

describe("syncRef function", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should sync stream to ref", async () => {
    const stream$ = $(10);
    const vueRef = ref(10);

    syncRef(stream$, vueRef);

    stream$.next(20);
    await vi.runAllTimersAsync();

    expect(vueRef.value).toBe(20);
  });

  it("should sync ref to stream", async () => {
    const stream$ = $(10);
    const vueRef = ref(10);

    syncRef(stream$, vueRef);

    vueRef.value = 30;
    await vi.runAllTimersAsync();

    expect(stream$.value).toBe(30);
  });

  it("should handle bidirectional sync", async () => {
    const stream$ = $("hello");
    const vueRef = ref("hello");

    syncRef(stream$, vueRef);

    stream$.next("world");
    await vi.runAllTimersAsync();
    expect(vueRef.value).toBe("world");

    vueRef.value = "pipeljs";
    await vi.runAllTimersAsync();
    expect(stream$.value).toBe("pipeljs");
  });

  it("should cleanup when unwatch is called", async () => {
    const stream$ = $(10);
    const vueRef = ref(10);

    const cleanup = syncRef(stream$, vueRef);
    cleanup();

    stream$.next(20);
    await vi.runAllTimersAsync();

    // ref should not be updated after cleanup
    expect(vueRef.value).toBe(10);
  });
});
