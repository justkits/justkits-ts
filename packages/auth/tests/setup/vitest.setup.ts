import { vi } from "vitest";

type MockBroadcastChannelType = {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: string) => void;
  close: () => void;
};

const reloadMock: () => void = vi.fn();

Object.defineProperty(globalThis.window, "location", {
  value: { reload: reloadMock },
  writable: true,
  configurable: true,
});

const mockChannelInstance: MockBroadcastChannelType = {
  name: "",
  onmessage: null,
  postMessage: vi.fn(),
  close: vi.fn(),
};

class TestBroadcastChannel {
  name: string;
  private _onmessage: ((event: MessageEvent) => void) | null = null;

  get onmessage() {
    return this._onmessage;
  }

  set onmessage(handler: ((event: MessageEvent) => void) | null) {
    this._onmessage = handler;
    mockChannelInstance.onmessage = handler;
  }

  constructor(name: string) {
    this.name = name;
    mockChannelInstance.name = name;
  }

  postMessage(message: string) {
    mockChannelInstance.postMessage(message);
  }

  close() {
    mockChannelInstance.close();
  }
}

vi.stubGlobal("BroadcastChannel", TestBroadcastChannel);

export { mockChannelInstance, reloadMock };
