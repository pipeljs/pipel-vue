import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStream } from "../index";

describe("useStream function", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should return stream, value ref, and setValue", () => {
    const [stream$, valueRef, setValue] = useStream(42);

    expect(stream$.value).toBe(42);
    expect(valueRef.value).toBe(42);
    expect(typeof setValue).toBe("function");
  });

  it("should update value ref when setValue is called", async () => {
    const [stream$, valueRef, setValue] = useStream(10);

    setValue(20);
    await vi.runAllTimersAsync();

    expect(stream$.value).toBe(20);
    expect(valueRef.value).toBe(20);
  });

  it("should update value ref when stream emits", async () => {
    const [stream$, valueRef] = useStream("initial");

    stream$.next("updated");
    await vi.runAllTimersAsync();

    expect(valueRef.value).toBe("updated");
  });

  it("should work with objects", async () => {
    const [stream$, valueRef, setValue] = useStream({ count: 0 });

    setValue({ count: 5 });
    await vi.runAllTimersAsync();

    expect(valueRef.value.count).toBe(5);
    expect(stream$.value.count).toBe(5);
  });
});
