// App.tsx
import React from "react";
import { useModelTranscriber } from "./hooks/useModalTranscriber";


// Replace MODEL_URL below with the actual URL to your model file.
const MODEL_URL =
  "https://huggingface.co/onnx-community/whisper-base/resolve/main/model.onnx";

function App() {
  const { workerStatus, downloadProgress, transcript, error, downloadModel, transcribe } =
    useModelTranscriber(MODEL_URL);

  const handleDownload = () => {
    downloadModel();
  };

  const handleTranscribe = () => {
    // For demonstration create dummy audio data (1 second of silence)
    const dummyAudio = new Float32Array(44100);
    transcribe(dummyAudio, "en");
  };

  const renderContent = () => {
    switch (workerStatus) {
      case "idle":
        return (
          <div>
            <p>Model is not downloaded yet.</p>
            <button onClick={handleDownload}>Download Model</button>
          </div>
        );
      case "downloading":
        return (
          <div>
            <p>
              Downloading model...
              {downloadProgress && (
                <>
                  {" "}
                  {downloadProgress.percent.toFixed(2)}% (
                  {(downloadProgress.downloaded / (1024 * 1024)).toFixed(2)}{" "}
                  MB of {(downloadProgress.total / (1024 * 1024)).toFixed(2)} MB)
                </>
              )}
            </p>
            {downloadProgress && (
              <progress value={downloadProgress.percent} max={100} />
            )}
          </div>
        );
      case "ready":
        return (
          <div>
            <p>Model downloaded and ready for transcription!</p>
            <button onClick={handleTranscribe}>Transcribe Audio</button>
          </div>
        );
      case "transcribing":
        return <p>Transcription in progress…</p>;
      case "transcriptionCompleted":
        return (
          <div>
            <h3>Transcription Result:</h3>
            <p>{transcript}</p>
            <button onClick={handleTranscribe}>Try Again</button>
          </div>
        );
      case "error":
        return (
          <div>
            <p style={{ color: "red" }}>Error: {error}</p>
            <button onClick={handleDownload}>Retry Download</button>
          </div>
        );
      default:
        return <p>Unknown status.</p>;
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Voice Transcription Demo</h1>
      {renderContent()}
    </div>
  );
}

export default App;
