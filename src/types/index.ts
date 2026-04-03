export interface InterviewConfig {
  jd: string;
  resumeText: string;
  difficulty: string;
  language: string;
  type: string;
  persona: string;
  duration: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'ai';
  text: string;
}

export interface RadarData {
  "技术深度": number;
  "问题解决": number;
  "沟通表达": number;
  "岗位匹配": number;
  "潜力与学习": number;
}

export interface TranscriptEvaluation {
  question: string;
  answer: string;
  evaluation: string;
}

export interface ReportData {
  overall_score: number;
  radar_chart: RadarData;
  strengths: string[];
  weaknesses: string[];
  final_verdict: string;
  off_topic_guidance: string[];
  transcript_evaluation: TranscriptEvaluation[];
  final_summary: string;
}

export interface InterviewRecord {
  date: string;
  type: string;
  difficulty: string;
  score: number;
  report: ReportData;
}

export interface AiResponse {
  phase: "Opening" | "Project" | "Technical" | "Coding" | "Closing" | "Finished";
  action: "SPEAK" | "START_CODING" | "END_INTERVIEW";
  speaker_text: string;
  guidance_triggered: boolean;
  code_context?: {
    language: string;
    initial_code: string;
  };
}
