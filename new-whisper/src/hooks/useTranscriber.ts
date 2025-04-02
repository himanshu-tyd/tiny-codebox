// hooks/useTranscriber.ts
import { useCallback, useMemo, useState } from 'react';
import { useWorker } from './useWorker';

export interface Transcriber {
  isBusy: boolean;
  start: (audioData: AudioBuffer) => void;
  output?: {
    text: string;
    chunks: { text: string; timestamp: [number, number | null] }[];
  };
}

export function useTranscriber(): Transcriber {
  const [output, setOutput] = useState<Transcriber['output']>();
  const [isBusy, setIsBusy] = useState(false);
  
  const worker = useWorker((event) => {
    const message = event.data;
    switch (message.status) {
      case 'update':
        setOutput({
          text: message.data[0],
          chunks: message.data[1].chunks
        });
        break;
        
      case 'complete':
        setOutput({
          text: message.data.text,
          chunks: message.data.chunks
        });
        setIsBusy(false);
        break;

      case 'error':
        console.error('Transcription error:', message.data);
        setIsBusy(false);
        break;
    }
  });

  const start = useCallback((audioData: AudioBuffer) => {
    setIsBusy(true);
    setOutput(undefined);
    
    // Convert stereo to mono if needed
    let audio: Float32Array;
    if (audioData.numberOfChannels === 2) {
      const left = audioData.getChannelData(0);
      const right = audioData.getChannelData(1);
      audio = new Float32Array(left.length);
      for (let i = 0; i < left.length; i++) {
        audio[i] = (left[i] + right[i]) / 2;
      }
    } else {
      audio = audioData.getChannelData(0);
    }

    worker.postMessage({ audio });
  }, [worker]);

  return useMemo(() => ({
    isBusy,
    start,
    output
  }), [isBusy, output, start]);
}