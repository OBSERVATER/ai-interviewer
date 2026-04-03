export const getSpeechRecognition = (language: string) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = language === 'Chinese' ? 'zh-CN' : 'en-US';
  
  return recognition;
};

export const speakText = (text: string, language: string) => {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = language === 'Chinese' ? 'zh-CN' : 'en-US';
  utter.rate = 1.0;
  synth.speak(utter);
};
