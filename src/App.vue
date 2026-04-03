<template>
  <div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-600 rounded-lg">
            <Mic class="text-white w-6 h-6" />
          </div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">AI 智能面试官 <span class="text-blue-600 italic">专业版</span></h1>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="step === 'interviewing'" class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> 面试进行中
          </div>
          <el-button @click="showHistory = true" circle class="hover:rotate-12 transition-transform">
            <History class="w-5 h-5" />
          </el-button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <el-card class="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
        <!-- Step 1: Config -->
        <InterviewConfig 
          v-if="step === 'config'" 
          :config="config" 
          @start="step = 'interviewing'" 
        />

        <!-- Step 2: Interviewing -->
        <div v-if="isGeneratingReport" class="py-20 text-center space-y-4">
          <Loader2 class="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h3 class="text-xl font-bold text-gray-800">正在生成评估报告...</h3>
          <p class="text-gray-500">AI 正在分析您的表现，请稍候。</p>
        </div>

        <InterviewSession 
          v-else-if="step === 'interviewing'" 
          ref="sessionRef"
          :config="config" 
          @end="handleInterviewEnd" 
        />

        <!-- Step 3: Report -->
        <InterviewReport 
          v-if="step === 'report'" 
          :report="report" 
          @reset="resetSession"
          @download-video="downloadVideo"
        />
      </el-card>
    </main>

    <!-- History Dialog -->
    <el-dialog v-model="showHistory" title="历史面试记录" width="800px" class="rounded-3xl overflow-hidden">
      <div v-if="pastRecords.length === 0" class="py-12 text-center text-gray-400">
        <History class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>暂无历史记录。</p>
      </div>
      <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div v-for="(record, idx) in pastRecords" :key="idx" class="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors flex justify-between items-center">
          <div>
            <div class="font-bold text-gray-800">{{ record.date }} - {{ typeMap[record.type] || record.type }}</div>
            <div class="text-xs text-gray-500">{{ difficultyMap[record.difficulty] || record.difficulty }} | 评分: {{ record.score }}/100</div>
          </div>
          <div class="flex gap-2">
            <el-button size="small" @click="viewPastReport(record)">查看报告</el-button>
            <el-button size="small" type="danger" @click="deleteRecord(idx)" plain>删除</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Mic, History, Loader2 } from 'lucide-vue-next';
import { ElMessage } from 'element-plus';
import './services/editor';
import type { InterviewConfig as InterviewConfigType, ReportData, InterviewRecord } from './types';
import { generateInterviewReport } from './services/gemini';
import InterviewConfig from './components/InterviewConfig.vue';
import InterviewSession from './components/InterviewSession.vue';
import InterviewReport from './components/InterviewReport.vue';

// --- State ---
const step = ref<'config' | 'interviewing' | 'report'>('config');
const showHistory = ref(false);
const report = ref<ReportData | null>(null);
const sessionRef = ref<any>(null);
const isGeneratingReport = ref(false);

const config = reactive<InterviewConfigType>({
  jd: "",
  resumeText: "",
  difficulty: "Middle",
  language: "Chinese",
  type: "Technical",
  persona: "Friendly",
  duration: 30
});

const difficultyMap: Record<string, string> = {
  'Junior': '初级',
  'Middle': '中级',
  'Senior': '高级',
  'Expert': '专家'
};

const typeMap: Record<string, string> = {
  'Technical': '技术面试',
  'Behavioral': '行为面试',
  'Full': '全流程面试'
};

const pastRecords = ref<InterviewRecord[]>(JSON.parse(localStorage.getItem('INTERVIEW_RECORDS') || '[]'));

// --- Methods ---
const handleInterviewEnd = async () => {
  if (!sessionRef.value) return;
  
  const history = sessionRef.value.getHistory();
  isGeneratingReport.value = true;
  
  try {
    const reportData = await generateInterviewReport(config, history);
    report.value = reportData;
    
    // Save to history
    const newRecord: InterviewRecord = {
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
    // Show error to user
    ElMessage.error("评估报告生成失败，请重试。");
  } finally {
    isGeneratingReport.value = false;
  }
};

const resetSession = () => {
  step.value = 'config';
  report.value = null;
};

const viewPastReport = (record: InterviewRecord) => {
  report.value = record.report;
  step.value = 'report';
  showHistory.value = false;
};

const deleteRecord = (index: number) => {
  pastRecords.value.splice(index, 1);
  localStorage.setItem('INTERVIEW_RECORDS', JSON.stringify(pastRecords.value));
};

const downloadVideo = () => {
  if (!sessionRef.value) return;
  const chunks = sessionRef.value.getRecordedChunks();
  if (chunks.length === 0) return;
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-recording-${Date.now()}.webm`;
  a.click();
  URL.revokeObjectURL(url);
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

.el-card {
  border-radius: 2.5rem !important;
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
</style>
