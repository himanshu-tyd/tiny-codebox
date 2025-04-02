// utils/audioUtils.ts
export function padTime(time: number): string {
    return String(time).padStart(2, "0");
}

export function formatAudioTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours ? padTime(hours) + ":" : ""}${padTime(minutes)}:${padTime(secs)}`;
}