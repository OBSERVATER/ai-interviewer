<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[750px] animate-in fade-in duration-500">
    <!-- Left Column: Video & Chat -->
    <div class="lg:col-span-4 flex flex-col space-y-4">
      <div class="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-2xl ring-4 ring-gray-100">
        <video ref="videoRef" autoplay muted class="w-full h-full object-cover"></video>
        <div class="absolute top-4 left-4 flex gap-2">
          <div v-if="isRecording && !isPaused" class="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <div class="w-2 h-2 bg-white rounded-full"></div> REC
          </div>
          <div v-if="isPaused" class="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            <Pause class="w-3 h-3" /> PAUSED
          </div>
        </div>
        <div class="absolute bottom-4 right-4">
          <el-tag size="small" effect="dark" class="bg-black/50 border-none backdrop-blur-md">{{ config.difficulty }}</el-tag>
        </div>
      </div>
      
      <div class="flex-1 bg-white border border-gray-100 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner" ref="chatContainer">
        <div v-for="(msg, idx) in visibleHistory" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div :class="['max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm', msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none']">
            {{ msg.text }}
          </div>
        </div>
        <div v-if="aiStatus" class="flex items-center gap-2 text-blue-500 text-xs font-medium italic">
          <Loader2 class="w-3 h-3 animate-spin" /> {{ aiStatus }}
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="relative">
          <el-button 
            :type="isListening ? 'danger' : 'primary'" 
            class="w-full h-20 text-xl font-black rounded-2xl shadow-xl transition-all active:scale-95" 
            @mousedown="startSTT" 
            @mouseup="stopSTT"
            @touchstart.prevent="startSTT"
            @touchend.prevent="stopSTT"
            :loading="isAiThinking"
          >
            <div class="flex items-center gap-3">
              <Mic v-if="!isListening" class="w-6 h-6" />
              <div v-else class="flex gap-1">
                <div class="w-1 h-4 bg-white animate-bounce"></div>
                <div class="w-1 h-6 bg-white animate-bounce [animation-delay:0.2s]"></div>
                <div class="w-1 h-4 bg-white animate-bounce [animation-delay:0.4s]"></div>
              </div>
              {{ isListening ? '正在聆听...' : '按住说话 (或长按空格)' }}
            </div>
          </el-button>
          <div class="absolute -top-2 -right-2">
            <el-tooltip content="使用 Web Speech API 进行本地语音转文字">
              <Info class="w-5 h-5 text-gray-400 bg-white rounded-full" />
            </el-tooltip>
          </div>
        </div>
        <div class="flex justify-between items-center px-2">
          <div class="flex gap-2">
            <el-button size="small" @click="togglePause" :type="isPaused ? 'success' : 'warning'" plain>
              {{ isPaused ? '继续' : '暂停' }}
            </el-button>
            <el-button size="small" @click="$emit('end')" link class="text-gray-400 hover:text-red-500">结束面试</el-button>
          </div>
          <span class="text-[10px] uppercase tracking-widest text-gray-300 font-bold">通过 Gemini API 加密传输</span>
        </div>
      </div>
    </div>

    <!-- Right Column: Code Editor -->
    <div class="lg:col-span-8 border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all" :class="{'opacity-50 pointer-events-none': !showEditor}">
      <div class="bg-gray-900 text-gray-400 p-4 text-xs flex justify-between items-center border-b border-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
            <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
          </div>
          <span class="font-mono tracking-widest uppercase ml-2">编程挑战 (Coding Challenge)</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="bg-gray-800 px-2 py-1 rounded text-blue-400 font-mono">{{ currentLanguage }}</span>
          <el-tag v-if="!showEditor" type="info" size="small">等待 AI 题目...</el-tag>
        </div>
      </div>
      <div ref="editorRef" class="flex-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Mic, Pause, Loader2, Info } from 'lucide-vue-next';
import * as monaco from 'monaco-editor';
import type { InterviewConfig, ChatMessage, AiResponse } from '../types';
import { getInterviewResponse } from '../services/gemini';
import { getSpeechRecognition, speakText } from '../services/speech';

const props = defineProps<{
  config: InterviewConfig;
}>();

const emit = defineEmits(['end', 'report-ready']);

// --- State ---
const visibleHistory = ref<{ role: string; text: string }[]>([]);
const chatHistory = ref<ChatMessage[]>([]);
const aiStatus = ref('');
const isAiThinking = ref(false);
const isListening = ref(false);
const isRecording = ref(false);
const isPaused = ref(false);
const showEditor = ref(false);
const currentLanguage = ref('python');
const chatContainer = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const editorRef = ref<HTMLElement | null>(null);

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recognition: any = null;
let accumulatedTranscript = "";

// --- Methods ---
const startInterview = async () => {
  await nextTick();
  
  // Initialize Monaco
  editorInstance = monaco.editor.create(editorRef.value!, {
    value: "# AI 面试官将在此处提出编程挑战。\n",
    language: 'python',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    padding: { top: 20 }
  });

  // Start Camera & Recording
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.value) videoRef.value.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.start();
    isRecording.value = true;
  } catch (err) {
    console.error("Camera access error:", err);
  }

  // Initial AI Prompt
  runAiStep("", true);
};

const runAiStep = async (userText: string, isInitial = false) => {
  if (isPaused.value) return;
  isAiThinking.value = true;
  aiStatus.value = "AI 正在思考...";

  if (!isInitial) {
    chatHistory.value.push({ role: 'user', text: userText });
    visibleHistory.value.push({ role: 'user', text: userText });
  }

  try {
    const currentCode = editorInstance?.getValue() || "";
    const data: AiResponse = await getInterviewResponse(props.config, chatHistory.value, currentCode, isInitial);

    chatHistory.value.push({ role: 'ai', text: data.speaker_text });
    visibleHistory.value.push({ role: 'ai', text: data.speaker_text });

    if (data.action === 'START_CODING') {
      showEditor.value = true;
      if (data.code_context?.initial_code) {
        editorInstance?.setValue(data.code_context.initial_code);
        if (data.code_context.language) {
          currentLanguage.value = data.code_context.language;
          const model = editorInstance?.getModel();
          if (model) monaco.editor.setModelLanguage(model, data.code_context.language);
        }
      }
    }

    if (data.phase === 'Finished' || data.action === 'END_INTERVIEW') {
      setTimeout(() => emit('end'), 3000);
    }

    speakText(data.speaker_text, props.config.language);

    await nextTick();
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  } catch (error) {
    console.error("AI Error:", error);
    visibleHistory.value.push({ role: 'ai', text: "抱歉，我遇到了点问题。请重试或检查网络。" });
  } finally {
    isAiThinking.value = false;
    aiStatus.value = "";
  }
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    if (mediaRecorder?.state === 'recording') mediaRecorder.pause();
    window.speechSynthesis.cancel();
  } else {
    if (mediaRecorder?.state === 'paused') mediaRecorder.resume();
  }
};

// --- STT ---
const startSTT = () => {
  if (!recognition) return;
  isListening.value = true;
  accumulatedTranscript = "";
  recognition.start();
};

const stopSTT = () => {
  if (!recognition) return;
  isListening.value = false;
  recognition.stop();
  if (accumulatedTranscript.trim()) {
    runAiStep(accumulatedTranscript);
  }
};

// --- Lifecycle ---
onMounted(() => {
  startInterview();
  recognition = getSpeechRecognition(props.config.language);
  if (recognition) {
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          accumulatedTranscript += event.results[i][0].transcript;
        }
      }
    };
    recognition.onerror = (event: any) => {
      console.error("STT Error:", event.error);
      if (event.error !== 'no-speech') isListening.value = false;
    };
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  if (videoRef.value?.srcObject) {
    (videoRef.value.srcObject as MediaStream).getTracks().forEach(track => track.stop());
  }
  if (mediaRecorder?.state !== 'inactive') mediaRecorder?.stop();
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

// --- Keyboard Shortcuts ---
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space' && !isListening.value && !isAiThinking.value && !isPaused.value) {
    if (document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      startSTT();
    }
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space' && isListening.value) {
    e.preventDefault();
    stopSTT();
  }
};

defineExpose({
  getHistory: () => chatHistory.value,
  getRecordedChunks: () => recordedChunks
});
</script>
