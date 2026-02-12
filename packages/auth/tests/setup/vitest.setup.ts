import { vi } from "vitest";

class MockBroadcastChannel {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  postMessage = vi.fn();
  close = vi.fn();
}

vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
