import { generateSpeech } from './gemini';
import { playPcmAudio, stopAudio as stopPcmAudio, playWebSpeech } from './speech';

export class TTSQueue {
  private textBuffer: string = '';
  private audioQueue: { text: string; audioPromise: Promise<string | null> }[] = [];
  private isPlaying: boolean = false;
  private isProcessing: boolean = false;
  private onStateChange: (isPlaying: boolean) => void;
  private language: string;
  private isStopped: boolean = false;

  constructor(language: string, onStateChange: (isPlaying: boolean) => void) {
    this.language = language;
    this.onStateChange = onStateChange;
  }

  public pushTextStream(chunk: string) {
    if (this.isStopped) return;
    this.textBuffer += chunk;
    this.processBuffer();
  }

  public finishStream() {
    if (this.isStopped) return;
    if (this.textBuffer.trim().length > 0) {
      this.enqueueTTS(this.textBuffer.trim());
      this.textBuffer = '';
    }
  }

  public stop() {
    this.isStopped = true;
    this.isPlaying = false;
    this.isProcessing = false;
    this.audioQueue = [];
    this.textBuffer = '';
    stopPcmAudio();
    this.onStateChange(false);
  }

  private processBuffer() {
    // Match punctuation: 。 ！ ？ . ! ? \n
    const punctuationRegex = /([。！？.!?\n]+)/g;
    let match;
    let lastIndex = 0;

    const sentences = [];
    while ((match = punctuationRegex.exec(this.textBuffer)) !== null) {
      const splitIndex = match.index + match[0].length;
      const sentence = this.textBuffer.substring(lastIndex, splitIndex).trim();
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      lastIndex = splitIndex;
    }

    if (sentences.length > 0) {
      this.textBuffer = this.textBuffer.substring(lastIndex);
      for (const sentence of sentences) {
        this.enqueueTTS(sentence);
      }
    }
  }

  private enqueueTTS(text: string) {
    const audioPromise = generateSpeech(text);
    this.audioQueue.push({ text, audioPromise });
    this.playNext();
  }

  private async playNext() {
    if (this.isPlaying || this.isStopped || this.audioQueue.length === 0) {
      return;
    }

    this.isPlaying = true;
    this.onStateChange(true);

    while (this.audioQueue.length > 0 && !this.isStopped) {
      const nextItem = this.audioQueue.shift();
      if (!nextItem) continue;

      try {
        const base64Audio = await nextItem.audioPromise;
        if (this.isStopped) break;

        if (base64Audio) {
          await playPcmAudio(base64Audio);
        } else {
          await playWebSpeech(nextItem.text, this.language);
        }
      } catch (err) {
        console.error("Error playing audio in queue:", err);
      }
    }

    this.isPlaying = false;
    if (!this.isStopped) {
      this.onStateChange(false);
    }
  }
}

export class PartialJsonExtractor {
  private extractedLength = 0;
  
  public extractNewText(jsonStr: string): string {
    const keyMatch = jsonStr.indexOf('"speaker_text"');
    if (keyMatch === -1) return '';
    
    const colonMatch = jsonStr.indexOf(':', keyMatch);
    if (colonMatch === -1) return '';
    
    const quoteMatch = jsonStr.indexOf('"', colonMatch);
    if (quoteMatch === -1) return '';
    
    const startIdx = quoteMatch + 1;
    
    let endIdx = startIdx;
    let isEscaped = false;
    
    for (; endIdx < jsonStr.length; endIdx++) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }
      if (jsonStr[endIdx] === '\\') {
        isEscaped = true;
        continue;
      }
      if (jsonStr[endIdx] === '"') {
        break;
      }
    }
    
    const currentFullText = jsonStr.substring(startIdx, endIdx);
    const unescapedText = currentFullText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    
    if (unescapedText.length > this.extractedLength) {
      const newText = unescapedText.substring(this.extractedLength);
      this.extractedLength = unescapedText.length;
      return newText;
    }
    
    return '';
  }
}
