// useModelTranscriber.ts
import { useState, useRef, useEffect, useCallback } from "react";

export type WorkerStatus =
  | "idle"
  | "downloading"
  | "ready"
  | "error"
  | "transcribing"
  | "transcriptionCompleted";

export interface DownloadProgress {
  downloaded: number;
  total: number;
  percent: number;
}

interface TranscriberState {
  workerStatus: WorkerStatus;
  downloadProgress: DownloadProgress | null;
  transcript: string;
  error: string | null;
}

export interface ModelTranscriber {
  workerStatus: WorkerStatus;
  downloadProgress: DownloadProgress | null;
  transcript: string;
  error: string | null;
  downloadModel: () => void;
  transcribe: (audioData: Float32Array, language?: string) => void;
}

export function useModelTranscriber(modelURL: string): ModelTranscriber {
  const [state, setState] = useState<TranscriberState>({
    workerStatus: "idle",
    downloadProgress: null,
    transcript: "",
    error: null,
  });
  const workerRef = useRef<Worker | null>(null);

  // Create and initialize the worker.
  useEffect(() => {
    const worker = new Worker(new URL("./transcriptionWorker.js", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    
    worker.onmessage = (event) => {
      const msg = event.data;
      switch (msg.status) {
        case "progress":
          setState((prev) => ({
            ...prev,
            workerStatus: "downloading",
            downloadProgress: {
              downloaded: msg.downloaded,
              total: msg.total,
              percent: msg.percent,
            },
          }));
          break;
        case "finished":
          console.info(msg.message);
          break;
        case "ready":
          setState((prev) => ({
            ...prev,
            workerStatus: "ready",
            downloadProgress: null,
          }));
          break;
        case "transcriptionCompleted":
          setState((prev) => ({
            ...prev,
            workerStatus: "transcriptionCompleted",
            transcript: msg.transcript,
          }));
          break;
        case "error":
          setState((prev) => ({
            ...prev,
            workerStatus: "error",
            error: msg.error,
          }));
          break;
        default:
          console.warn("Unhandled worker status:", msg.status);
          break;
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Function to initiate a real model download.
  const downloadModel = useCallback(() => {
    if (!workerRef.current) return;
    setState((prev) => ({
      ...prev,
      workerStatus: "downloading",
      downloadProgress: { downloaded: 0, total: 0, percent: 0 },
      error: null,
    }));
    workerRef.current.postMessage({
      command: "downloadModel",
      payload: { modelURL },
    });
  }, [modelURL]);

  // Function to start a transcription process.
  const transcribe = useCallback(
    (audioData: Float32Array, language: string = "en") => {
      if (!workerRef.current) return;
      setState((prev) => ({
        ...prev,
        workerStatus: "transcribing",
        transcript: "",
        error: null,
      }));
      workerRef.current.postMessage({
        command: "transcribe",
        payload: { audioData, language },
      });
    },
    []
  );

  return {
    workerStatus: state.workerStatus,
    downloadProgress: state.downloadProgress,
    transcript: state.transcript,
    error: state.error,
    downloadModel,
    transcribe,
  };
}
