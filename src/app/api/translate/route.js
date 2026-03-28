import { NextResponse } from "next/server";
import OpenAI from "openai";
import PDFParser from "pdf2json";
export const runtime = "nodejs";
export const maxDuration = 60;

let pdfTextCache = {};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const query = formData.get("query");
    const fileId = formData.get("fileId");

    const apiKey = process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey });

    if (query && fileId && pdfTextCache[fileId]) {
      const qPrompt = `당신은 연구 도메인 전문가입니다. 다음 논문 텍스트를 "완벽하게 해부"하여 질문에 답변하세요.
반드시 한국어로 답변하고, 논문에 명시된 구체적인 수치와 근거를 들어 설명하세요.
질문: ${query}
텍스트: ${pdfTextCache[fileId].substring(0, 40000)}`;
      const qRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: qPrompt }],
      });
      return NextResponse.json({ answer: qRes.choices[0].message.content });
    }

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfParser = new PDFParser(null, 1);
    const originalText = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", err => reject(err));
      pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
      pdfParser.parseBuffer(buffer);
    });

    const currentFileId = Date.now().toString();
    pdfTextCache[currentFileId] = originalText;

    // ELITE SCHOLAR PROMPT - MAX DEPTH - KOREAN ENFORCEMENT
    const prompt = `
당신은 학술 논문의 모든 기호와 수치를 추적하는 초정밀 분석 엔진입니다. 
**최종 출력물(JSON)의 모든 내용은 반드시 한국어로만 작성해야 합니다.** (영어 단어가 학술적으로 꼭 필요한 경우를 제외하고 모든 설명은 한국어로 작성하세요.)

[분석 철학: 절대 요약 금지 & 한국어 전용]
1. 분량에 구애받지 말고 "논문의 모든 정보가 빠짐없이" 들어가야 합니다. 
2. 모든 필드의 설명은 '반말'이 아닌 '전문적인 존댓말' 또는 '학술적 문체'로 작성하세요.
3. '02_DECONSTRUCTION' 섹션은 논문의 모든 데이터셋 수치, 실험 조건, 하드웨어 사양, 알고리즘 단계, P-value, 표준 편차 등 기술적 디테일을 "백과사전" 수준으로 상세히 한국어로 적으세요.
4. '03_VISUALS'는 논문에 있는 모든 Table과 Figure를 찾아 그 제목과 내용을 상세히 한국어로 기재하세요. (최소 7개 이상 지향)

반드시 다음 JSON 구조를 따르세요:
{
  "summary": { 
     "problem": "[한국어] 논문이 해결하려는 핵심 문제", 
     "purpose": "[한국어] 연구의 목적과 배경", 
     "methodology": "[한국어] 제안된 방법론의 구조적 설명", 
     "content": "[한국어] 실험 과정의 모든 디테일", 
     "conclusion": "[한국어] 최종 결론 및 학술적 기여" 
  },
  "decomposition": { 
     "hypothesis_rq": "[한국어] 모든 가설과 질문의 정교한 실체와 학술적 근거", 
     "methodology_detail": "[한국어] 데이터셋 수치, 실험 설계의 모든 파라미터, 알고리즘, 통계 기법 등의 극도로 상세한 해체",
     "analysis_result": "[한국어] 모든 실험 데이터와 통계적 수치 결과의 완전한 복원 및 해석",
     "significance_limitations": "[한국어] 논문의 의의와 저자가 고백한 모든 한계점의 심층 분석"
  },
  "visuals": [
    { "type": "TABLE/FIGURE", "id": "번호", "title": "[한국어] 정확한 명칭", "context": "[한국어] 해당 자료의 세부 데이터 수치와 그것이 학술적으로 입증하는 구체적 발견" }
  ],
  "diagram": [
    { "step": "[한국어] 단계명", "desc": "[한국어] 단계에서 수행된 매우 구체적인 행위와 수치 조건" }
  ],
  "fileId": "${currentFileId}"
}

논문 본문:
${originalText.substring(0, 38000)}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
