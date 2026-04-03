import { GoogleGenAI } from "@google/genai";
import type { InterviewConfig, ChatMessage, AiResponse, ReportData } from "../types";

const GEMINI_MODEL = "gemini-3-flash-preview";

export const callAiWithRetry = async (fn: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let lastError: any = null;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || "";
      const isRetryable = errorMsg.includes("503") || 
                          errorMsg.includes("404") || 
                          errorMsg.includes("high demand") || 
                          errorMsg.includes("temporary") ||
                          errorMsg.includes("quota");
      
      if (i < maxRetries && isRetryable) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`AI request failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  throw lastError;
};

export const getInterviewResponse = async (
  config: InterviewConfig,
  history: ChatMessage[],
  currentCode: string,
  isInitial = false
): Promise<AiResponse> => {
  const executeRequest = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `你是一位专业的 ${config.difficulty} 级别面试官，正在进行 ${config.type} 职位的面试。
    面试官性格: ${config.persona}。 
    
    面试背景:
    - 职位描述 (JD): ${config.jd}
    - 简历内容: ${config.resumeText}
    - 面试语言: ${config.language}
    - 预估总时长: ${config.duration} 分钟
    
    面试流程 (必须严格遵守以下顺序):
    1. 自我介绍 (Opening): 引导候选人进行自我介绍。
    2. 项目面 (Project): 针对简历中的项目进行深入提问。
    3. 八股面 (Technical): 考察基础知识和技术深度。
    4. 代码面 (Coding): 提出编程挑战 (通常在面试中后期，持续 15-30 分钟)。
    5. 反问与结语 (Closing): 允许候选人提问并结束面试。
    注: 后三个阶段 (八股、代码、反问) 的顺序可以根据面试节奏灵活调整，但必须先完成自我介绍和项目面。
    
    核心逻辑:
    - 动态追问: 根据候选人的回答调整下一个问题。
    - 深度挖掘: 探索知识深度，不要轻易跳过。
    - 时间规划: 根据预估时长 ${config.duration} 分钟来规划内容的广度和深度。
    
    严格以 JSON 格式输出:
    {
      "phase": "Opening | Project | Technical | Coding | Closing | Finished",
      "action": "SPEAK | START_CODING | END_INTERVIEW",
      "speaker_text": "面试官要说的话",
      "guidance_triggered": boolean,
      "code_context": {
        "language": "python | javascript | cpp",
        "initial_code": "代码模板"
      }
    }`;

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      config: { systemInstruction: systemPrompt }
    });

    const fullInput = isInitial 
      ? `开始面试。预估总时长 ${config.duration} 分钟。请根据此时间规划面试内容的深度。` 
      : `候选人回答: ${history[history.length - 1].text}\n[当前代码]: ${currentCode}`;
    
    const result = await chat.sendMessage({ message: fullInput });
    return JSON.parse(result.text);
  };

  return callAiWithRetry(executeRequest);
};

export const generateInterviewReport = async (
  config: InterviewConfig,
  history: ChatMessage[]
): Promise<ReportData> => {
  const executeReportGeneration = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const reportPrompt = `根据提供的面试历史记录，生成一份全面的 JSON 格式评估报告。
    
    **重要原则**: 评价必须仅基于候选人在面试过程中的实际表现和回答内容，不要只根据简历内容进行评价。如果候选人在面试中表现出的能力与简历不符，以面试表现为准。
    
    详细评分细则 (Scoring Rubric):
    1. 技术深度 (Technical Depth, 0-100): 评估面试中展现出的底层原理理解。
    2. 问题解决 (Problem Solving, 0-100): 评估逻辑思维和编码挑战表现。
    3. 沟通表达 (Communication, 0-100): 评估表达是否清晰、专业。
    4. 岗位匹配 (Role Fit, 0-100): 评估面试表现出的技能与 JD 的契合度。
    5. 潜力与学习 (Potential & Learning, 0-100): 评估面试中展现出的学习心态。
    
    输出格式:
    { 
      "overall_score": 0-100, 
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
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: reportPrompt + "\n\n面试记录:\n" + history.map(h => `${h.role}: ${h.text}`).join('\n') }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text);
  };

  return callAiWithRetry(executeReportGeneration);
};
