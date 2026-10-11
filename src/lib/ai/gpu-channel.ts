/** BroadcastChannel the LLM worker uses to report a lost GPU device. */
export const GPU_CHANNEL = "dose-gpu";

export type GpuMessage = { type: "device-lost"; message: string };
