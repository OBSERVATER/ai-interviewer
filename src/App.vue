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
            <el-button @click="showSettings = true" :icon="Settings" circle />
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
              <div v-if="isRecording" class="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                <div class="w-2 h-2 bg-white rounded-full"></div> REC
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
                  {{ isListening ? 'Listening...' : 'Hold to Speak' }}
                </div>
              </el-button>
              <div class="absolute -top-2 -right-2">
                <el-tooltip content="Uses Web Speech API for local STT">
                  <Info class="w-5 h-5 text-gray-400 bg-white rounded-full" />
                </el-tooltip>
              </div>
            </div>
            <div class="flex justify-between items-center px-2">
              <el-button size="small" @click="endInterview" link class="text-gray-400 hover:text-red-500">End Interview</el-button>
              <span class="text-[10px] uppercase tracking-widest text-gray-300 font-bold">Encrypted via Gemini API</span>
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
          <h2 class="text-3xl font-black text-gray-800">Interview Complete</h2>
          <p class="text-gray-500">Your recording has been saved locally. Here is your AI evaluation.</p>
        </div>

        <div v-if="report" class="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
          <div class="bg-blue-600 p-8 text-white">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div class="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Overall Performance</div>
                <div class="text-7xl font-black mb-2">{{ report.overall_score }}<span class="text-2xl opacity-50">/100</span></div>
                <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold">
                  Verdict: {{ report.final_verdict }}
                </div>
              </div>
              <div class="space-y-4">
                <div v-for="(val, key) in report.radar_chart" :key="key" class="space-y-1">
                  <div class="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span>{{ key }}</span>
                    <span>{{ val }}%</span>
                  </div>
                  <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div class="h-full bg-white transition-all duration-1000" :style="{width: val + '%'}"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight">
                <div class="w-2 h-6 bg-green-500 rounded-full"></div> Key Strengths
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
                <div class="w-2 h-6 bg-orange-500 rounded-full"></div> Areas for Improvement
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
              <div class="w-2 h-6 bg-purple-500 rounded-full"></div> Final Evaluation Summary
            </h4>
            <p class="text-sm text-gray-700 leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              {{ report.final_summary }}
            </p>
          </div>

          <!-- Transcript with Evaluation -->
          <div class="p-8 border-t border-gray-100">
            <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight mb-6">
              <div class="w-2 h-6 bg-blue-500 rounded-full"></div> Detailed Q&A Evaluation
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
                    <div class="text-[10px] font-bold uppercase tracking-widest text-blue-500">AI Evaluation</div>
                    <div class="h-px flex-1 bg-gray-100"></div>
                  </div>
                  <p class="text-xs text-gray-500 leading-relaxed">{{ item.evaluation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <el-button size="large" @click="resetSession" class="rounded-xl px-8">New Session</el-button>
          <el-button type="primary" size="large" @click="downloadReport" class="rounded-xl px-8">Download Report (JSON)</el-button>
          <el-button type="success" size="large" @click="downloadVideo" class="rounded-xl px-8">Download Recording</el-button>
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

    <!-- Settings Dialog -->
    <el-dialog v-model="showSettings" title="API Configuration" width="450px" class="rounded-3xl overflow-hidden">
      <div class="space-y-4">
        <div class="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3">
          <AlertCircle class="text-yellow-600 w-5 h-5 flex-shrink-0" />
          <p class="text-xs text-yellow-700">Your API key is stored locally in your browser's <code>localStorage</code>. It is never sent to our servers.</p>
        </div>
        <el-form label-position="top">
          <el-form-item label="Gemini API Key">
            <el-input v-model="tempKey" placeholder="AIza..." type="password" show-password class="custom-input" />
          </el-form-item>
        </el-form>
        <div class="text-center">
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-xs text-blue-600 hover:underline">Get a free API key from Google AI Studio</a>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="showSettings = false">Cancel</el-button>
          <el-button @click="saveSettings" type="primary" class="rounded-lg px-6">Save Key</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { 
  Mic, Settings, ShieldCheck, Briefcase, FileText, UploadCloud, 
  CheckCircle2, Loader2, Info, AlertCircle, Settings2, Download,
  PlayCircle, History
} from 'lucide-vue-next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from "mammoth";
import * as monaco from 'monaco-editor';

// PDF.js Worker Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// --- State Management ---
const step = ref('config');
const showSettings = ref(false);
const showHistory = ref(false);
const tempKey = ref(localStorage.getItem('GEMINI_API_KEY') || '');
const aiStatus = ref('');
const isAiThinking = ref(false);
const isListening = ref(false);
const isRecording = ref(false);
const showEditor = ref(false);
const currentLanguage = ref('python');

const config = reactive({
  jd: '',
  resumeText: '',
  difficulty: 'Senior',
  language: 'Chinese',
  type: 'Technical',
  persona: 'Strict'
});

const chatHistory = ref([]);
const visibleHistory = ref([]);
const report = ref(null);
const chatContainer = ref(null);
const pastRecords = ref(JSON.parse(localStorage.getItem('INTERVIEW_RECORDS') || '[]'));

// --- Media Refs ---
const videoRef = ref(null);
let mediaRecorder = null;
let recordedChunks = [];

// --- Monaco Editor ---
const editorRef = ref(null);
let editorInstance = null;

// --- Web Speech API ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
}

const synth = window.speechSynthesis;

// --- Lifecycle ---
onMounted(() => {
  if (!tempKey.value) {
    showSettings.value = true;
  }
});

// --- Methods ---
const saveSettings = () => {
  localStorage.setItem('GEMINI_API_KEY', tempKey.value);
  showSettings.value = false;
};

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
        text += content.items.map(s => s.str).join(" ") + "\n";
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

const isConfigReady = computed(() => config.jd && config.resumeText && tempKey.value);

const startInterview = async () => {
  step.value = 'interviewing';
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
  } catch (err) {
    console.error("Camera access error:", err);
  }

  // Initial AI Prompt
  const welcomeMsg = config.language === 'Chinese' ? "你好，欢迎参加今天的面试。请先做一个简单的自我介绍。" : "Hello, welcome to today's interview. Please start with a brief self-introduction.";
  runAiStep(welcomeMsg, true);
};

const runAiStep = async (userText, isInitial = false) => {
  isAiThinking.value = true;
  aiStatus.value = "AI is thinking...";
  
  try {
    const genAI = new GoogleGenerativeAI(tempKey.value);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `You are a professional ${config.difficulty} level interviewer for a ${config.type} role.
    Persona: ${config.persona}. 
    - If Friendly: Be warm, encouraging, and helpful.
    - If Strict: Be professional, critical, and focused on precision.
    - If Expert: Deep dive into implementation details, ask "why" and "how".
    - If Stress: Be challenging, skeptical, and push the candidate to their limits.
    
    JD: ${config.jd}
    Resume: ${config.resumeText}
    Language: ${config.language}.
    
    Rules:
    1. Ask only ONE question at a time.
    2. If it's a technical interview, include a coding challenge when appropriate.
    3. Be conversational and professional.
    
    Output strictly in JSON format:
    {
      "phase": "Opening | Behavioral | Technical | Coding | Closing | Finished",
      "action": "SPEAK | START_CODING | END_INTERVIEW",
      "speaker_text": "The text to be spoken by the interviewer",
      "code_context": {
        "language": "python | javascript | cpp",
        "initial_code": "Code template if starting a challenge"
      }
    }`;

    const chat = model.startChat({
      history: chatHistory.value,
    });

    const currentCode = editorInstance ? editorInstance.getValue() : "";
    const fullInput = isInitial ? `Start the interview. Context: ${systemPrompt}` : `Candidate Answer: ${userText}\n[Current Code Context]: ${currentCode}\n\nContinue the interview based on the system prompt rules.`;
    
    const result = await chat.sendMessage(fullInput);
    const response = await result.response;
    const data = JSON.parse(response.text());

    // Update History
    chatHistory.value.push({ role: "user", parts: [{ text: fullInput }] });
    chatHistory.value.push({ role: "model", parts: [{ text: response.text() }] });
    
    if (!isInitial) {
      visibleHistory.value.push({ role: 'user', text: userText });
    }
    visibleHistory.value.push({ role: 'ai', text: data.speaker_text });

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
    visibleHistory.value.push({ role: 'ai', text: "I'm sorry, I encountered an error. Please try again." });
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
  aiStatus.value = "Generating evaluation report...";
  
  try {
    const genAI = new GoogleGenerativeAI(tempKey.value);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const reportPrompt = `Based on the interview history provided, generate a comprehensive evaluation report in JSON format. 
    Evaluate each answer in the transcript.
    
    Output Format:
    { 
      "overall_score": 0-100, 
      "radar_chart": {"Technical Depth": 0, "Communication": 0, "Problem Solving": 0, "Experience": 0}, 
      "strengths": ["list of 3-5 strengths"], 
      "weaknesses": ["list of 2-3 improvements"], 
      "final_verdict": "Strong Hire | Hire | No Hire",
      "transcript_evaluation": [
        {
          "question": "The question asked",
          "answer": "The candidate's answer",
          "evaluation": "Your detailed evaluation of this specific answer"
        }
      ],
      "final_summary": "Overall ability evaluation and suggestions"
    }`;

    const result = await model.generateContent([reportPrompt, ...chatHistory.value.map(h => h.parts[0].text)]);
    const reportData = JSON.parse(result.response.text());
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
  } catch (err) {
    console.error("Report generation error:", err);
    step.value = 'report'; // Still show report step even if empty
  }
};

const resetSession = () => {
  step.value = 'config';
  chatHistory.value = [];
  visibleHistory.value = [];
  recordedChunks = [];
  showEditor.value = false;
  report.value = null;
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
