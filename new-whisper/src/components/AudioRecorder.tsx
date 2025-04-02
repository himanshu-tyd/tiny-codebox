// components/AudioRecorder.tsx
import { useCallback, useEffect, useRef, useState } from "react";

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioChunks.current = [];
        
        // Here you would add your transcription logic
        const transcribedText = await transcribeAudio(audioBlob);
        setTranscript(transcribedText);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // Mock transcription function - replace with your actual implementation
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    return "Sample transcribed text"; // Replace with real transcription
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-lg ${
          isRecording 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {transcript && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full max-w-2xl">
          <h3 className="font-bold mb-2">Transcription:</h3>
          <p className="whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
}