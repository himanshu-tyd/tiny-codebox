// App.tsx

import AudioTranscriber from "./components/AudioTranscribe";


export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Audio to Text Converter
        </h1>
        <AudioTranscriber />
      </div>
    </div>
  );
}