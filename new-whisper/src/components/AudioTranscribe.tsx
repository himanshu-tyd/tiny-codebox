// components/AudioTranscriber.tsx
import { useCallback, useRef, useState } from 'react';
import { useTranscriber } from '../hooks/useTranscriber';
import { webmFixDuration } from '../utils/BlobFix';
import { formatAudioTimestamp } from '../utils/AudioUtils';


export default function AudioTranscriber() {
  const transcriber = useTranscriber();
  const [audioUrl, setAudioUrl] = useState<string>();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const duration = Date.now() - startTime.current;
        const audioBlob = await webmFixDuration(
          new Blob(audioChunks.current, { type: 'audio/webm' }),
          duration
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        audioChunks.current = [];
        
        const audioContext = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        transcriber.start(audioBuffer);
      };

      startTime.current = Date.now();
      mediaRecorder.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <button
          onClick={startRecording}
          disabled={mediaRecorder.current?.state === 'recording'}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={mediaRecorder.current?.state !== 'recording'}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:bg-gray-400"
        >
          Stop Recording
        </button>
      </div>

      {audioUrl && (
        <audio controls src={audioUrl} className="mt-4 w-full" />
      )}

      {transcriber.isBusy && (
        <div className="mt-4 p-2 text-center">
          <p>Transcribing audio...</p>
        </div>
      )}

      {transcriber.output?.chunks && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full">
          <h3 className="font-bold mb-2">Transcription:</h3>
          <div className="space-y-2">
            {transcriber.output.chunks.map((chunk, i) => (
              <p key={i} className="whitespace-pre-wrap">
                <span className="text-gray-500 text-sm">
                  {formatAudioTimestamp(chunk.timestamp[0])}
                </span> - {chunk.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}