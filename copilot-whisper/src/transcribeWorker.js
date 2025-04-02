// transcriptionWorker.js

self.addEventListener("message", async (event) => {
  const { command, payload } = event.data;

  if (command === "downloadModel") {
    const { modelURL } = payload;
    try {
      // Fetch the model file from a remote URL.
      const response = await fetch(modelURL);
      if (!response.ok) {
        self.postMessage({
          status: "error",
          error: `Failed to download model (status: ${response.status})`,
        });
        return;
      }

      // Read Content-Length header to determine total size.
      const totalBytesStr = response.headers.get("content-length");
      if (!totalBytesStr) {
        self.postMessage({
          status: "error",
          error: "Missing Content-Length header",
        });
        return;
      }
      const totalBytes = parseInt(totalBytesStr, 10);
      let downloadedBytes = 0;
      const reader = response.body.getReader();
      const chunks = [];

      // Read the stream chunk by chunk.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        downloadedBytes += value.byteLength;
        const progressPercent = (downloadedBytes / totalBytes) * 100;
        self.postMessage({
          status: "progress",
          downloaded: downloadedBytes,
          total: totalBytes,
          percent: progressPercent,
        });
      }

      // Combine chunks into a Blob (optionally, you can store/store it later).
      const modelBlob = new Blob(chunks);
      // Signal that the download is complete.
      self.postMessage({
        status: "finished",
        message: "Model download complete.",
      });
      // Signal that the worker is ready.
      self.postMessage({ status: "ready" });
    } catch (error) {
      self.postMessage({ status: "error", error: error.message });
    }
  } else if (command === "transcribe") {
    // Dummy transcription processing.
    const { audioData, language } = payload;
    // Simulate processing delay.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    self.postMessage({
      status: "transcriptionCompleted",
      transcript: `Dummy transcription (language: ${language}). Audio length: ${audioData.length} samples.`,
    });
  }
});
