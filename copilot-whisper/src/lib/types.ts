export type ProgressItems = {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
};

export type TranscriberUpdateData = {
  data: [
    string,
    { chunks: { text: string; timestamp: [number, number | null] }[] }
  ];
  text: string;
};

export type TranscriberCompleteData = {
  data: {
    text: string;
    chunks: { text: string; timestamp: [number, number | null] }[];
  };
};

export type TranscriberData = {
  isBusy: boolean;
  text: string;
  chunks: { text: string; timestamp: [number, number | null] }[];
};

export type Transcriber = {
  onInputChange: () => void;
  isBusy: boolean;
  isModelLoading: boolean;
  progressItems: ProgressItems[];
  start: (audioData: AudioBuffer | undefined) => void;
  output?: TranscriberData;
  model: string;
  setModel: (model: string) => void;
  multilingual: boolean;
  setMultilingual: (model: boolean) => void;
  quantized: boolean;
  setQuantized: (model: boolean) => void;
  subtask: string;
  setSubtask: (subTask: string) => void;
  language?: string;
  setLanguage: (language: string) => void;
};

export enum AudioSource {
  URL = "URL",
  FILE = "FILE",
  RECORDING = "RECORDING",
}


