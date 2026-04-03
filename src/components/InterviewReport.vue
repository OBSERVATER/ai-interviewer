<template>
  <div class="space-y-8 py-6 animate-in zoom-in duration-700">
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
            <div class="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">面试评估总分</div>
            <div class="text-7xl font-black mb-2">{{ report.overall_score }}<span class="text-2xl opacity-50">/100</span></div>
            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold">
              最终结论: {{ report.final_verdict }}
            </div>
          </div>
          <div class="flex justify-center">
            <RadarChart :data="report.radar_chart" />
          </div>
        </div>
      </div>

      <!-- Score Breakdown -->
      <div class="p-8 border-b border-gray-100">
        <h4 class="flex items-center gap-2 font-black text-gray-800 uppercase tracking-tight mb-6">
          <div class="w-2 h-6 bg-blue-400 rounded-full"></div> 各维度评分详情
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(val, key) in report.radar_chart" :key="key" class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-gray-600">{{ key }}</span>
              <span class="text-lg font-black text-blue-600">{{ val }}</span>
            </div>
            <el-progress :percentage="val" :show-text="false" :stroke-width="8" color="#2563eb" />
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
      <el-button size="large" @click="$emit('reset')" class="rounded-xl px-8">新面试</el-button>
      <el-button type="primary" size="large" @click="downloadReport" class="rounded-xl px-8">下载报告 (JSON)</el-button>
      <el-button type="success" size="large" @click="$emit('download-video')" class="rounded-xl px-8">下载录音</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next';
import type { ReportData } from '../types';
import RadarChart from './RadarChart.vue';

const props = defineProps<{
  report: ReportData | null;
}>();

const emit = defineEmits(['reset', 'download-video']);

const downloadReport = () => {
  if (!props.report) return;
  const dataStr = JSON.stringify(props.report, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
