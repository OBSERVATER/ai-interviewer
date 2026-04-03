<template>
  <div class="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4 items-start">
      <ShieldCheck class="text-blue-600 w-6 h-6 mt-1 flex-shrink-0" />
      <div>
        <h3 class="font-bold text-blue-900">隐私优先架构</h3>
        <p class="text-sm text-blue-700">所有处理均在您的浏览器中完成。您的简历、视频和音频绝不会离开此设备。数据在您关闭标签页时将被清除。</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-4">
        <div class="flex items-center gap-2 mb-2">
          <Briefcase class="w-5 h-5 text-gray-500" />
          <label class="font-bold text-gray-700">职位描述 (JD)</label>
        </div>
        <el-input 
          v-model="config.jd" 
          type="textarea" 
          :rows="8" 
          placeholder="请粘贴职位要求..." 
          class="custom-textarea"
        />
      </div>
      <div class="space-y-4">
        <div class="flex items-center gap-2 mb-2">
          <FileText class="w-5 h-5 text-gray-500" />
          <label class="font-bold text-gray-700">个人简历 (PDF/Docx)</label>
        </div>
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="onFileChange"
          :show-file-list="true"
          class="w-full"
        >
          <div class="py-8">
            <UploadCloud class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div class="text-gray-600">拖拽文件到此处或 <span class="text-blue-600 font-medium">点击上传</span></div>
            <p class="text-xs text-gray-400 mt-2">支持 PDF 和 Word 文档</p>
          </div>
        </el-upload>
        <div v-if="config.resumeText" class="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
          <CheckCircle2 class="text-green-600 w-4 h-4" />
          <span class="text-xs text-green-700 font-medium">简历解析成功 ({{ config.resumeText.length }} 字符)</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl">
      <div class="space-y-2">
        <label class="text-sm font-bold text-gray-600">面试难度</label>
        <el-select v-model="config.difficulty" class="w-full">
          <el-option label="初级 (Junior)" value="Junior" />
          <el-option label="中级 (Middle)" value="Middle" />
          <el-option label="高级 (Senior)" value="Senior" />
          <el-option label="专家 (Expert)" value="Expert" />
        </el-select>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-bold text-gray-600">面试语言</label>
        <el-select v-model="config.language" class="w-full">
          <el-option label="中文" value="Chinese" />
          <el-option label="英文" value="English" />
        </el-select>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-bold text-gray-600">面试类型</label>
        <el-select v-model="config.type" class="w-full">
          <el-option label="技术面试" value="Technical" />
          <el-option label="行为面试" value="Behavioral" />
          <el-option label="全流程面试" value="Full" />
        </el-select>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-bold text-gray-600">面试官性格</label>
        <el-select v-model="config.persona" class="w-full">
          <el-option label="亲切鼓励 (Friendly)" value="Friendly" />
          <el-option label="专业严谨 (Strict)" value="Strict" />
          <el-option label="技术专家 (Expert)" value="Expert" />
          <el-option label="压力面试 (Stress)" value="Stress" />
        </el-select>
      </div>
      <div class="space-y-2 lg:col-span-2">
        <label class="text-sm font-bold text-gray-600">预估面试时长 (分钟)</label>
        <el-slider v-model="config.duration" :min="5" :max="60" :step="5" show-input />
      </div>
    </div>

    <div class="flex justify-center pt-4">
      <el-button 
        type="primary" 
        size="large" 
        @click="$emit('start')" 
        :disabled="!isReady"
        class="px-12 h-14 text-lg font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
      >
        开始面试
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ShieldCheck, Briefcase, FileText, UploadCloud, CheckCircle2 } from 'lucide-vue-next';
import type { InterviewConfig } from '../types';
import { parseResumeFile } from '../services/fileParser';

const props = defineProps<{
  config: InterviewConfig;
}>();

const emit = defineEmits(['start']);

const isReady = computed(() => props.config.jd && props.config.resumeText);

const onFileChange = async (file: any) => {
  const rawFile = file.raw;
  if (!rawFile) return;
  try {
    const text = await parseResumeFile(rawFile);
    props.config.resumeText = text;
  } catch (err) {
    console.error("Failed to parse resume", err);
  }
};
</script>
