<template>
  <div class="min-h-screen bg-gray-50 p-4 font-sans text-gray-900">
    <el-card class="max-w-6xl mx-auto shadow-xl border-none rounded-2xl overflow-hidden">
      <template #header>
        <div class="flex justify-between items-center py-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-600 rounded-lg">
              <Mic class="text-white w-6 h-6" />
            </div>
            <h1 class="text-2xl font-black tracking-tight text-gray-800">AI Interviewer <span class="text-blue-600">Pro</span></h1>
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="showHistory = true" :icon="History" circle />
            <el-tag type="info" effect="plain" class="rounded-full">Local Only</el-tag>
          </div>
        </div>
      </template>

      <!-- Step 1: Configuration -->
      <div v-if="step === 'config'" class="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4 items-start">
          <ShieldCheck class="text-blue-600 w-6 h-6 mt-1 flex-shrink-0" />
          <div>
            <h3 class="font-bold text-blue-900">Privacy First Architecture</h3>
            <p class="text-sm text-blue-700">All processing happens in your browser. Your resume, video, and audio never leave this device. Data is cleared when you close the tab.</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <Briefcase class="w-5 h-5 text-gray-500" />
              <label class="font-bold text-gray-700">Job Description (JD)</label>
            </div>
            <el-input 
              v-model="config.jd" 
              type="textarea" 
              :rows="8" 
              placeholder="Paste the job requirements here..." 
              class="custom-textarea"
            />
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <FileText class="w-5 h-5 text-gray-500" />
              <label class="font-bold text-gray-700">Your Resume (PDF/Docx)</label>
            </div>
            <el-upload
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="true"
              class="w-full"
            >
              <div class="py-8">
                <UploadCloud class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div class="text-gray-600">Drop file here or <span class="text-blue-600 font-medium">click to upload</span></div>
                <p class="text-xs text-gray-400 mt-2">Supports PDF and Word documents</p>
              </div>
            </el-upload>
            <div v-if="config.resumeText" class="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
              <CheckCircle2 class="text-green-600 w-4 h-4" />
              <span class="text-xs text-green-700 font-medium">Resume parsed successfully ({{ config.resumeText.length }} chars)</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl">
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600">Interview Difficulty</label>
            <el-select v-model="config.difficulty" class="w-full">
              <el-option label="Junior" value="Junior" />
              <el-option label="Middle" value="Middle" />
              <el-option label="Senior" value="Senior" />
              <el-option label="Expert" value="Expert" />
            </el-select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600">Language</label>
            <el-select v-model="config.language" class="w-full">
              <el-option label="English" value="English" />
              <el-option label="Chinese" value="Chinese" />
            </el-select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600">Interview Type</label>
            <el-select v-model="config.type" class="w-full">
              <el-option label="Technical Interview" value="Technical" />
              <el-option label="Behavioral Interview" value="Behavioral" />
              <el-option label="Full Round" value="Full" />
            </el-select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600">AI Persona</label>
            <el-select v-model="config.persona" class="w-full">
              <el-option label="Friendly (Encouraging)" value="Friendly" />
              <el-option label="Strict (Professional)" value="Strict" />
              <el-option label="Technical Expert (Deep Dive)" value="Expert" />
              <el-option label="Stress Interview (压力面)" value="Stress" />
            </el-select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-600">Duration (Minutes)</label>
            <el-slider v-model="config.duration" :min="5" :max="60" :step="5" show-input />
          </div>
        </div>

        <div class="flex justify-center pt-4">
          <el-button 
            type="primary" 
            size="large" 
            @click="startInterview" 
            :disabled="!isConfigReady"
            class="px-12 h-14 text-lg font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
          >
            Launch Interview Session
          </el-button>
        </div>
      </div>

      <!-- Step 2: Interviewing -->
      <div v-if="step === 'interviewing'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[750px] animate-in fade-in duration-500">
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
              <div class="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md">
                {{ formatTime(remainingTime) }}
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
                <el-button size="small" @click="endInterview" link class="text-gray-400 hover:text-red-500">结束面试</el-button>
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
              <span class="font-mono tracking-widest uppercase ml-2">Coding Challenge</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="bg-gray-800 px-2 py-1 rounded text-blue-400 font-mono">{{ currentLanguage }}</span>
              <el-tag v-if="!showEditor" type="info" size="small">Waiting for AI...</el-tag>
            </div>
          </div>
          <div ref="editorRef" class="flex-1"></div>
        </div>
      </div>

      <!-- Step 3: Report -->
      <div v-if="step === 'report'" class="space-y-8 py-6 animate-in zoom-in duration-700">
        <div class="text-center space-y-2">
          <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 class="w-10 h-10" />
          </div>
          <h2 class="text-3xl font-black text-gray-800">面试已结束</h2>
          <p class="text-gray-500">您的录音已保存在本地。这是您的 AI 评估报告。</p>
        </div>

        <div v-if="report" class="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
          <div class="bg-blue-600 p-8 text-white">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div class="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">综合评分</div>
                <div class="text-7xl font-black mb-2">{{ report.overall_score }}<span class="text-2xl opacity-50">/100</span></div>
                <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold">
                  最终结论: {{ report.final_verdict }}
                </div>
              </div>
              <div class="flex justify-center">
                <div ref="radarChartRef" class="w-full max-w-[300px] aspect-square"></div>
              </div>
            </div>
          </div>

          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight">
                <div class="w-2 h-6 bg-green-500 rounded-full"></div> 核心优势
              </h4>
              <div class="space-y-3">
                <div v-for="s in report.strengths" :key="s" class="p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-800 flex gap-3">
                  <div class="w-5 h-5 bg-green-200 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">✓</div>
                  {{ s }}
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight">
                <div class="w-2 h-6 bg-orange-500 rounded-full"></div> 待改进点
              </h4>
              <div class="space-y-3">
                <div v-for="w in report.weaknesses" :key="w" class="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-sm text-orange-800 flex gap-3">
                  <div class="w-5 h-5 bg-orange-200 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">!</div>
                  {{ w }}
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 border-t border-gray-100 bg-gray-50/50">
            <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight mb-4">
              <div class="w-2 h-6 bg-purple-500 rounded-full"></div> 最终评估总结
            </h4>
            <p class="text-sm text-gray-700 leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              {{ report.final_summary }}
            </p>
          </div>

          <div v-if="report.off_topic_guidance && report.off_topic_guidance.length > 0" class="p-8 border-t border-gray-100 bg-red-50/30">
            <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight mb-4">
              <div class="w-2 h-6 bg-red-500 rounded-full"></div> 离题引导记录
            </h4>
            <div class="space-y-3">
              <div v-for="(g, i) in report.off_topic_guidance" :key="i" class="p-4 bg-white border border-red-100 rounded-xl text-xs text-gray-600 shadow-sm">
                <span class="font-bold text-red-600 mr-2">引导:</span> {{ g }}
              </div>
            </div>
          </div>

          <!-- Transcript with Evaluation -->
          <div class="p-8 border-t border-gray-100">
            <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight mb-6">
              <div class="w-2 h-6 bg-blue-500 rounded-full"></div> 详细问答评估
            </h4>
            <div class="space-y-6">
              <div v-for="(item, idx) in report.transcript_evaluation" :key="idx" class="space-y-3">
                <div class="flex gap-4 items-start">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">Q</div>
                  <div class="text-sm font-medium text-gray-700 italic">"{{ item.question }}"</div>
                </div>
                <div class="flex gap-4 items-start">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">A</div>
                  <div class="text-sm text-gray-600">"{{ item.answer }}"</div>
                </div>
                <div class="ml-12 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="text-[10px] font-bold uppercase tracking-widest text-blue-500">AI 评估</div>
                    <div class="h-px flex-1 bg-gray-100"></div>
                  </div>
                  <p class="text-xs text-gray-500 leading-relaxed">{{ item.evaluation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <el-button size="large" @click="resetSession" class="rounded-xl px-8">新面试</el-button>
          <el-button type="primary" size="large" @click="downloadReport" class="rounded-xl px-8">下载报告 (JSON)</el-button>
          <el-button type="success" size="large" @click="downloadVideo" class="rounded-xl px-8">下载录音</el-button>
        </div>
      </div>
    </el-card>

    <!-- History Dialog -->
    <el-dialog v-model="showHistory" title="Past Interview Records" width="800px" class="rounded-3xl overflow-hidden">
      <div v-if="pastRecords.length === 0" class="py-12 text-center text-gray-400">
        <History class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>No past records found.</p>
      </div>
      <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div v-for="(record, idx) in pastRecords" :key="idx" class="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors flex justify-between items-center">
          <div>
            <div class="font-bold text-gray-800">{{ record.date }} - {{ record.type }}</div>
            <div class="text-xs text-gray-500">{{ record.difficulty }} | Score: {{ record.score }}/100</div>
          </div>
          <div class="flex gap-2">
            <el-button size="small" @click="viewPastReport(record)">View Report</el-button>
            <el-button size="small" type="danger" @click="deleteRecord(idx)" plain>Delete</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';
import { 
  Mic, Settings, ShieldCheck, Briefcase, FileText, UploadCloud, 
  CheckCircle2, Loader2, Info, AlertCircle, Settings2, Download,
  PlayCircle, History, Pause, Play, RefreshCw
} from 'lucide-vue-next';
import { GoogleGenAI } from "@google/genai";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from "mammoth";
import * as monaco from 'monaco-editor';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// Monaco Editor Worker Configuration for Vite
window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  }
};

// PDF.js Worker Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// --- State Management ---
const step = ref('config');
const showHistory = ref(false);
const aiStatus = ref('');
const isAiThinking = ref(false);
const isListening = ref(false);
const isRecording = ref(false);
const isPaused = ref(false);
const showEditor = ref(false);
const currentLanguage = ref('python');
const remainingTime = ref(0);
let timerInterval = null;

const config = reactive({
  jd: '',
  resumeText: '',
  difficulty: 'Senior',
  language: 'Chinese',
  type: 'Technical',
  persona: 'Strict',
  duration: 15
});

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ReportData {
  overall_score: number;
  radar_chart: {
    "技术深度": number;
    "问题解决": number;
    "沟通表达": number;
    "岗位匹配": number;
    "潜力与学习": number;
  };
  strengths: string[];
  weaknesses: string[];
  final_verdict: string;
  off_topic_guidance: string[];
  transcript_evaluation: {
    question: string;
    answer: string;
    evaluation: string;
  }[];
  final_summary: string;
}

const chatHistory = ref<ChatMessage[]>([]);
const visibleHistory = ref<{ role: string; text: string }[]>([]);
const report = ref<ReportData | null>(null);
const chatContainer = ref<HTMLElement | null>(null);
const radarChartRef = ref<HTMLElement | null>(null);
const pastRecords = ref(JSON.parse(localStorage.getItem('INTERVIEW_RECORDS') || '[]'));

// Keyboard Shortcut
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space' && step.value === 'interviewing' && !isListening.value && !isAiThinking.value && !isPaused.value) {
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

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

// --- Media Refs ---
const videoRef = ref(null);
let mediaRecorder = null;
let recordedChunks = [];

// --- Monaco Editor ---
const editorRef = ref(null);
let editorInstance = null;

// --- Web Speech API ---
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
}

const synth = window.speechSynthesis;

// --- Lifecycle ---
onMounted(() => {
  // No settings needed, using environment variable
});

// --- Methods ---
const handleFileChange = async (file) => {
  const rawFile = file.raw;
  if (!rawFile) return;

  try {
    if (rawFile.type === "application/pdf") {
      const arrayBuffer = await rawFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((s: any) => s.str).join(" ") + "\n";
      }
      config.resumeText = text;
    } else if (rawFile.name.endsWith(".docx")) {
      const arrayBuffer = await rawFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      config.resumeText = result.value;
    }
  } catch (err) {
    console.error("File parsing error:", err);
  }
};

const isConfigReady = computed(() => config.jd && config.resumeText);

const startInterview = async () => {
  step.value = 'interviewing';
  remainingTime.value = config.duration * 60;
  await nextTick();
  
  // Initialize Monaco
  editorInstance = monaco.editor.create(editorRef.value, {
    value: "# The AI interviewer will present a coding challenge here if applicable.\n",
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
    videoRef.value.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      console.log("Recording stopped");
    };
    mediaRecorder.start();
    isRecording.value = true;
    startTimer();
  } catch (err) {
    console.error("Camera access error:", err);
  }

  // Initial AI Prompt
  const welcomeMsg = config.language === 'Chinese' ? "你好，欢迎参加今天的面试。请先做一个简单的自我介绍。" : "Hello, welcome to today's interview. Please start with a brief self-introduction.";
  runAiStep(welcomeMsg, true);
};

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (!isPaused.value && remainingTime.value > 0) {
      remainingTime.value--;
      if (remainingTime.value === 0) {
        endInterview();
      }
    }
  }, 1000);
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.pause();
    synth.cancel();
  } else {
    if (mediaRecorder && mediaRecorder.state === 'paused') mediaRecorder.resume();
  }
};

const runAiStep = async (userText: string, isInitial = false) => {
  if (isPaused.value) return;
  isAiThinking.value = true;
  aiStatus.value = "AI 正在思考...";
  
  const maxRetries = 3;
  let retryCount = 0;

  const executeRequest = async (): Promise<any> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemPrompt = `你是一位专业的 ${config.difficulty} 级别面试官，正在进行 ${config.type} 职位的面试。
      面试官性格: ${config.persona}。 
      - Friendly: 亲切、鼓励、乐于助人。
      - Strict: 专业、严谨、注重细节。
      - Expert: 深入探讨实现细节，多问“为什么”和“怎么做”。
      - Stress: 具有挑战性、怀疑态度，将候选人推向极限。
      
      面试背景:
      - 职位描述 (JD): ${config.jd}
      - 简历内容: ${config.resumeText}
      - 面试语言: ${config.language}
      - 总时长: ${config.duration} 分钟
      - 剩余时间: ${formatTime(remainingTime.value)}
      
      核心逻辑:
      1. 动态追问: 根据候选人的回答调整下一个问题。如果提到特定技术或项目，深入挖掘。
      2. 深度挖掘: 提出后续问题以探索知识深度，不要轻易跳到下一个话题。
      3. 引导回归: 如果候选人偏离主题或啰嗦，礼貌地引导其回到主线。
      4. 时间管理与节奏控制: 
         - 必须管理面试阶段 (开场 -> 行为面试 -> 技术面试 -> 编码 -> 结语) 以适应 ${config.duration} 分钟的总时长。
         - 剩余时间不多时，加快进度。
         - 目标是在剩余约 2-3 分钟时开始“结语”阶段。
      
      评分标准 (Rubric):
      - 技术深度: 对技术的理解程度、实现细节的掌握。
      - 问题解决: 逻辑思维、解决编码挑战的方法。
      - 沟通表达: 表达是否清晰、简洁、专业。
      - 岗位匹配: 经验与 JD 的相关性。
      - 潜力与学习: 适应能力、学习心态。
      
      规则:
      1. 每次只问一个问题。
      2. 技术面试中，适时加入编码挑战。
         - 编码范围: LeetCode Hot 100 或类似题型。
         - 难度: 难度分 <= 2000 (Easy, Medium, 及部分 Hard)。
      3. 保持对话感和专业性。
      
      严格以 JSON 格式输出:
      {
        "phase": "Opening | Behavioral | Technical | Coding | Closing | Finished",
        "action": "SPEAK | START_CODING | END_INTERVIEW",
        "speaker_text": "面试官要说的话",
        "guidance_triggered": boolean, // 如果你引导候选人回到了主题，设为 true
        "code_context": {
          "language": "python | javascript | cpp",
          "initial_code": "开始挑战时的代码模板"
        }
      }`;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction: systemPrompt }
      });

      const currentCode = editorInstance ? editorInstance.getValue() : "";
      const fullInput = isInitial 
        ? `开始面试。总时长 ${config.duration} 分钟。请根据此时间规划面试阶段。` 
        : `候选人回答: ${userText}\n[剩余时间]: ${formatTime(remainingTime.value)}\n[当前代码]: ${currentCode}\n\n请根据系统提示规则继续面试。`;
      
      const result = await chat.sendMessage({ message: fullInput });
      return JSON.parse(result.text);
    } catch (error: any) {
      if (retryCount < maxRetries && (error.message?.includes('503') || error.message?.includes('404') || error.message?.includes('high demand'))) {
        retryCount++;
        aiStatus.value = `请求失败，正在进行第 ${retryCount} 次重试... (${retryCount}/${maxRetries})`;
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        return executeRequest();
      }
      throw error;
    }
  };

  try {
    const data = await executeRequest();

    // Update History
    if (isInitial) {
      visibleHistory.value.push({ role: 'ai', text: data.speaker_text });
    } else {
      visibleHistory.value.push({ role: 'user', text: userText });
      visibleHistory.value.push({ role: 'ai', text: data.speaker_text });
    }

    // Handle Actions
    if (data.action === 'START_CODING') {
      showEditor.value = true;
      if (data.code_context?.initial_code) {
        editorInstance.setValue(data.code_context.initial_code);
        if (data.code_context.language) currentLanguage.value = data.code_context.language;
      }
    }

    if (data.phase === 'Finished' || data.action === 'END_INTERVIEW') {
      setTimeout(() => endInterview(), 3000);
    }

    // TTS
    const utter = new SpeechSynthesisUtterance(data.speaker_text);
    utter.lang = config.language === 'Chinese' ? 'zh-CN' : 'en-US';
    utter.rate = 1.0;
    synth.speak(utter);

    // Scroll to bottom
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

// STT Operations
const startSTT = () => {
  if (!recognition) return;
  isListening.value = true;
  recognition.lang = config.language === 'Chinese' ? 'zh-CN' : 'en-US';
  recognition.start();
};

const stopSTT = () => {
  if (!recognition) return;
  isListening.value = false;
  recognition.stop();
};

if (recognition) {
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    runAiStep(transcript);
  };
  recognition.onerror = (event) => {
    console.error("STT Error:", event.error);
    isListening.value = false;
  };
}

const downloadVideo = () => {
  if (recordedChunks.length === 0) return;
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-recording-${Date.now()}.webm`;
  a.click();
  URL.revokeObjectURL(url);
};

const endInterview = async () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  isRecording.value = false;
  aiStatus.value = "正在生成面试评估报告...";
  
  const maxRetries = 3;
  let retryCount = 0;

  const generateReport = async (): Promise<any> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const reportPrompt = `根据提供的面试历史记录，生成一份全面的 JSON 格式评估报告。
      
      评分细则 (Scoring Rubric):
      1. 技术深度 (0-100): 评估对核心概念、原理及实现细节的掌握程度。
      2. 问题解决 (0-100): 评估逻辑思维、算法能力及面对复杂问题的拆解能力。
      3. 沟通表达 (0-100): 评估清晰度、简洁性、专业术语使用及互动表现。
      4. 岗位匹配 (0-100): 评估过往经验与 JD 要求的契合度。
      5. 潜力与学习 (0-100): 评估学习心态、适应能力及成长潜力。
      
      输出格式:
      { 
        "overall_score": 0-100 (上述五项的加权平均), 
        "radar_chart": {
          "技术深度": 0-100, 
          "问题解决": 0-100, 
          "沟通表达": 0-100, 
          "岗位匹配": 0-100, 
          "潜力与学习": 0-100
        }, 
        "strengths": ["3-5 个核心优势"], 
        "weaknesses": ["2-3 个待改进点"], 
        "final_verdict": "强烈推荐 | 推荐 | 暂不推荐",
        "off_topic_guidance": ["列出候选人偏离主题的具体实例"],
        "transcript_evaluation": [
          {
            "question": "提出的问题",
            "answer": "候选人的回答",
            "evaluation": "对该回答的详细评价"
          }
        ],
        "final_summary": "总体能力评价及职业建议"
      }`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: reportPrompt + "\n\n面试记录:\n" + visibleHistory.value.map(h => `${h.role}: ${h.text}`).join('\n') }] }],
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(result.text);
    } catch (error: any) {
      if (retryCount < maxRetries && (error.message?.includes('503') || error.message?.includes('404') || error.message?.includes('high demand'))) {
        retryCount++;
        aiStatus.value = `报告生成失败，正在进行第 ${retryCount} 次重试...`;
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        return generateReport();
      }
      throw error;
    }
  };

  try {
    const reportData = await generateReport();
    report.value = reportData;
    
    // Save to history
    const newRecord = {
      date: new Date().toLocaleString(),
      type: config.type,
      difficulty: config.difficulty,
      score: reportData.overall_score,
      report: reportData
    };
    pastRecords.value.unshift(newRecord);
    localStorage.setItem('INTERVIEW_RECORDS', JSON.stringify(pastRecords.value));
    
    step.value = 'report';
    await nextTick();
    drawRadarChart();
  } catch (err) {
    console.error("Report generation error:", err);
    step.value = 'report';
  } finally {
    if (timerInterval) clearInterval(timerInterval);
    aiStatus.value = "";
  }
};

const drawRadarChart = () => {
  if (!radarChartRef.value || !report.value) return;
  
  const data = Object.entries(report.value.radar_chart).map(([key, value]) => ({
    axis: key,
    value: value / 100
  }));

  const width = 300;
  const height = 300;
  const margin = 50;
  const radius = Math.min(width, height) / 2 - margin;
  
  d3.select(radarChartRef.value).selectAll("*").remove();
  
  const svg = d3.select(radarChartRef.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const angleSlice = (Math.PI * 2) / data.length;
  const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

  // Draw background circles
  const levels = 5;
  for (let i = 0; i < levels; i++) {
    const r = (radius / levels) * (i + 1);
    svg.append("circle")
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "4 4");
  }

  // Draw axes
  const axis = svg.selectAll(".axis")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "axis");

  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("stroke", "#e5e7eb");

  axis.append("text")
    .attr("x", (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("fill", "#4b5563")
    .text(d => d.axis);

  // Draw radar area
  const radarLine = d3.lineRadial<any>()
    .radius(d => rScale(d.value))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  svg.append("path")
    .datum(data)
    .attr("d", radarLine)
    .attr("fill", "rgba(37, 99, 235, 0.2)")
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 2);

  // Draw points
  svg.selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("r", 4)
    .attr("fill", "#2563eb");
};

const resetSession = () => {
  if (timerInterval) clearInterval(timerInterval);
  step.value = 'config';
  chatHistory.value = [];
  visibleHistory.value = [];
  recordedChunks = [];
  showEditor.value = false;
  report.value = null;
  isPaused.value = false;
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach(track => track.stop());
  }
};

const downloadReport = () => {
  if (!report.value) return;
  const dataStr = JSON.stringify(report.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const viewPastReport = (record) => {
  report.value = record.report;
  step.value = 'report';
  showHistory.value = false;
};

const deleteRecord = (index) => {
  pastRecords.value.splice(index, 1);
  localStorage.setItem('INTERVIEW_RECORDS', JSON.stringify(pastRecords.value));
};
</script>

<style>
@import 'element-plus/dist/index.css';

:root {
  --el-color-primary: #2563eb;
}

.custom-textarea .el-textarea__inner {
  border-radius: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.custom-textarea .el-textarea__inner:focus {
  background-color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.custom-input .el-input__wrapper {
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
}

.el-upload-dragger {
  border-radius: 1.5rem !important;
  border: 2px dashed #e5e7eb !important;
  background-color: #f9fafb !important;
  transition: all 0.3s ease;
}

.el-upload-dragger:hover {
  border-color: #2563eb !important;
  background-color: white !important;
}

.el-button--primary {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

.el-dialog {
  border-radius: 2rem !important;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.fade-in { opacity: 1; }
.slide-in-from-bottom-4 { transform: translateY(0); }
.zoom-in { transform: scale(1); }

/* Monaco specific */
.monaco-editor {
  padding-top: 10px;
}
</style>
