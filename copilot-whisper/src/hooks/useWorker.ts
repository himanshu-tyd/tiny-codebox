import { useState } from "react";

export interface MessageEventHandler {
  (event: MessageEvent): void;
}

export function useWorker(messageEventHandler: MessageEventHandler): Worker {
  const [worker] = useState(() => createWorker(messageEventHandler));
  return worker;
}

function createWorker(messageEventHandler: MessageEventHandler): Worker {
  const worker = new Worker(new URL("../transcribeWorker.js", import.meta.url), {
    type: "module",
  });
  worker.addEventListener("message", messageEventHandler);
  
  return worker;
}