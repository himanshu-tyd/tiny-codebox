// worker.js
import { pipeline } from '@xenova/transformers';

class PipelineFactory {
    static task = 'automatic-speech-recognition';
    static model = null;
    static quantized = null;
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                quantized: this.quantized,
                progress_callback,
                revision: this.model.includes('/whisper-medium') ? 'no_attentions' : 'main'
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { audio, model = 'Xenova/whisper-tiny', quantized = true } = event.data;

    try {
        // Configure model
        const p = PipelineFactory;
        if (p.model !== model || p.quantized !== quantized) {
            p.model = model;
            p.quantized = quantized;
            if (p.instance) {
                (await p.getInstance()).dispose();
                p.instance = null;
            }
        }

        // Load model
        const transcriber = await p.getInstance((data) => {
            self.postMessage(data);
        });

        // Process audio
        const output = await transcriber(audio, {
            top_k: 0,
            do_sample: false,
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: true,
            callback_function: (chunks) => {
                self.postMessage({
                    status: 'update',
                    data: transcriber.tokenizer._decode_asr(chunks, {
                        time_precision: 0.02,
                        return_timestamps: true
                    })
                });
            }
        });

        self.postMessage({
            status: 'complete',
            data: output
        });
    } catch (error) {
        self.postMessage({
            status: 'error',
            data: error.message
        });
    }
});