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

    // ELITE SCHOLAR PROMPT - MAX DEPTH
    const prompt = `
당신은 학술 논문의 모든 기호와 수치를 추적하는 초정밀 분석 엔진입니다. 논문을 "원자 단위(Atom-level)"로 해체하여 한국어로 된 방대한 JSON을 생성하세요.

[분석 철학: 절대 요약 금지]
1. 분량에 구애받지 말고 "논문의 모든 정보가 빠짐없이" 들어가야 합니다. 한두 줄 요약은 탈락 사유입니다.
2. '02_DECONSTRUCTION' 섹션은 논문의 모든 데이터셋 수치, 실험 조건, 하드웨어 사양, 알고리즘 단계, P-value, 표준 편차 등 기술적 디테일을 "백과사전" 수준으로 상세히 적으세요.
3. 'Diagram' 단계는 논문 전반에 걸친 방법론적 흐름을 S1~S10까지 아주 구체적인 행위 중심으로 나열하세요.
4. '03_VISUALS'는 논문에 있는 모든 Table과 Figure를 찾아 그 제목과 실제 데이터 분석 내용을 상세히 기재하세요. (최소 7개 이상 지향)

JSON 구조:
{
  "summary": { "problem": "...", "purpose": "...", "methodology": "...", "content": "...", "conclusion": "..." },
  "decomposition": { 
     "hypothesis_rq": "모든 가설과 질문의 정교한 실체와 학술적 근거", 
     "methodology_detail": "데이터셋 수치, 실험 설계의 모든 파라미터, 알고리즘, 통계 기법 등의 극도로 상세한 해체",
     "analysis_result": "모든 실험 데이터와 통계적 수치 결과의 완전한 복원 및 해석",
     "significance_limitations": "논문의 의의와 저자가 고백한 모든 한계점의 심층 분석"
  },
  "visuals": [
    { "type": "TABLE/FIGURE", "id": "번호", "title": "정확한 명칭", "context": "해당 자료의 세부 데이터 수치와 그것이 학술적으로 입증하는 구체적 발견" }
  ],
  "diagram": [
    { "step": "단계명", "desc": "단계에서 수행된 매우 구체적인 행위와 수치 조건" }
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
