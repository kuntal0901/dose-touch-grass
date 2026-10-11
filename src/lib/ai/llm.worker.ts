// Runs WebLLM (Gemma) off the main thread so model loading, grammar
// compilation and token sampling never freeze the UI.
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";
import { GPU_CHANNEL, type GpuMessage } from "./gpu-channel";

// If the GPU driver resets (seen on integrated GPUs as DXGI_ERROR_DEVICE_HUNG),
// WebLLM unloads the model and any pending generation waits forever. Watch
// every device WebLLM creates and tell the main thread right away.
type LostInfo = { reason?: string; message: string };
type Device = { lost: Promise<LostInfo> };
type Adapter = { requestDevice(...args: unknown[]): Promise<Device> };
const AdapterClass = (globalThis as { GPUAdapter?: { prototype: Adapter } }).GPUAdapter;
if (AdapterClass) {
  const channel = new BroadcastChannel(GPU_CHANNEL);
  const requestDevice = AdapterClass.prototype.requestDevice;
  AdapterClass.prototype.requestDevice = async function (...args) {
    const device = await requestDevice.apply(this, args);
    void device.lost.then((info) => {
      // "destroyed" means we unloaded on purpose.
      if (info.reason === "destroyed") return;
      channel.postMessage({ type: "device-lost", message: info.message } satisfies GpuMessage);
    });
    return device;
  };
}

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => handler.onmessage(msg);
