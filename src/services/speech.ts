import { generateSpeech } from './gemini';

export const getSpeechRecognition = (language: string) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = language === 'Chinese' ? 'zh-CN' : 'en-US';
  
  return recognition;
};

let currentAudioContext: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;

export const playPcmAudio = async (base64Data: string): Promise<void> => {
  try {
    if (!currentAudioContext || currentAudioContext.state === 'closed') {
      currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (currentAudioContext.state === 'suspended') {
      await currentAudioContext.resume();
    }
    
    if (currentAudioSource) {
      try { currentAudioSource.stop(); } catch(e){}
      currentAudioSource.disconnect();
      currentAudioSource = null;
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert 16-bit PCM to Float32
    const float32Data = new Float32Array(bytes.length / 2);
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < float32Data.length; i++) {
      float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }
    
    const audioBuffer = currentAudioContext.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);
    
    currentAudioSource = currentAudioContext.createBufferSource();
    currentAudioSource.buffer = audioBuffer;
    currentAudioSource.connect(currentAudioContext.destination);
    currentAudioSource.start();

    return new Promise((resolve) => {
      currentAudioSource!.onended = () => {
        currentAudioSource = null;
        resolve();
      };
      currentAudioSource!.onerror = () => {
        currentAudioSource = null;
        resolve(); // Resolve on error to not block
      };
    });
  } catch (err) {
    console.error("Failed to play PCM audio:", err);
    return Promise.resolve();
  }
};

export const stopAudio = () => {
  if (currentAudioSource) {
    try { currentAudioSource.stop(); } catch(e){}
    currentAudioSource = null;
  }
  window.speechSynthesis.cancel();
};

export const playWebSpeech = (text: string, language: string): Promise<void> => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any ongoing speech
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === 'Chinese' ? 'zh-CN' : 'en-US';
    utter.rate = 1.0;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    synth.speak(utter);
  });
};
