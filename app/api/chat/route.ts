import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { saveConversation, getRecentConversations } from "@/lib/firebase";
import { handleEscalation } from "@/lib/escalation";

export async function POST(req: Request) {
    const { userId, userName, message, guardianContact } = await req.json();

    // 1. Gemini API 키 확인 (없으면 시뮬레이션 모드)
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY가 없습니다. 시뮬레이션 모드로 응답합니다.");
        const simulatedResult = {
            reply: `안녕하세요 ${userName}님! 지금은 연습 모드예요. "${message}"라고 말씀하셨군요? 다정한 반디가 곧 진짜로 찾아올게요! ✨ (Gemini API 키를 설정해주세요)`,
            level: 1,
            reason: "Simulation mode active",
            medicationChecked: true,
            medicationTaken: null
        };
        return NextResponse.json(simulatedResult);
    }

    try {
        // 1.5 최근 대화 내역 가져오기 (Memory)
        const history = await getRecentConversations(userId, 10);

        // KST 시간 계산 (Vercel 등 서버 환경은 UTC이므로 +9시간)
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstNow = new Date(now.getTime() + kstOffset);
        const dateString = kstNow.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = kstNow.toTimeString().split(' ')[0]; // HH:MM:SS

        const historyPrompt = history.map(h => {
            const hDate = h.timestamp?.toDate ? h.timestamp.toDate() : new Date();
            const hKst = new Date(hDate.getTime() + kstOffset);
            const hTime = hKst.toISOString().replace('T', ' ').split('.')[0];
            return `[${hTime}] ${h.sender === "user" ? (userName || "바다") : "반디"}: ${h.message}`;
        }).join("\n");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        // 시스템 지침 정의 (반디의 성격 및 출력 규칙)
        const systemInstruction = `당신은 다음 규칙을 엄격히 준수하는 대화 파트너 '반디'입니다.

        [활동 목표]
        - 정보 제공자보다는 따뜻하고 친근한 '대화 상대'가 되는 것이 최우선입니다.
        - 사용자의 감정에 먼저 반응하고 충분히 공감한 뒤 대화를 이어갑니다.

        [대화 핵심 규칙]
        - 사람처럼 짧고 다정하게 말합니다. (답변은 최대 5줄 이내)
        - 한 문장은 15~25자 내외로 구성하며, 실제로 대화하는 느낌을 유지합니다.
        - 질문은 한 번에 하나만 던져 대화의 리듬을 지킵니다.
        - AI 특유의 "정리", "요약", "좋은 질문입니다" 등의 표현을 절대 금지합니다.

        [기능 제어 규칙 (절대 준수)]
        1. **영상/영화/보여줘**: 메시지에 "영상", "영화", "보여줘", "보여주렴" 등 시청 관련 단어가 있으면 **반드시 'showVideoKeyword'**에만 검색어를 넣으세요.
        2. **음악/노래/틀어줘**: 메시지에 "노래", "음악", "틀어줘", "들려줘" 등 청취 관련 단어가 있으면 **반드시 'playMusicKeyword'**에만 검색어를 넣으세요.
        3. **장소/맛집/병원/여행**: 맛집, 병원, 약국, 여행지 등 특정 장소를 찾는 요청이 있으면 **반드시 'searchPlaceKeyword'**에 검색어를 넣으세요. (예: "종로구 정형외과", "강남역 맛집")
        4. **뉴스/이슈/무슨일**: 오늘 뉴스, 사회 소식, 연예 뉴스 등 정보 요청이 있으면 **반드시 'searchNewsKeyword'**에 검색어를 넣으세요. 특정 주제가 없으면 "최신 주요 뉴스"를 기본값으로 하세요.
        5. **날씨/비/더워/추워**: 날씨, 온도, 강수 여부 등 기상 정보 요청이 있으면 **반드시 'searchWeatherKeyword'**에 **지역명만** 넣으세요. 지역이 없으면 "천안"을 기본값으로 하세요. (예: "서울", "제주도")
        6. **일정/약속/기억**: "내일 병원 가", "금요일에 친구 만나" 등 미래의 일정을 언급하면 **반드시 'scheduleData'**에 정보를 넣으세요.
        7. **내용**: 키워드에는 "장윤정 초혼", "시니어 스트레칭" 같이 검색에 필요한 명사만 정확히 입력하세요. 핵심 키워드가 없으면 "뉴스"라고만 하세요.
        8. **즉시 실행**: 대화로 제안만 하지 말고 즉시 키워드나 데이터를 생성해야 기능이 작동합니다.

        [응답 JSON 구조]
        {
          "reply": "다정하고 공감 어린 답변",
          "level": 1(정상), 2(우울/피곤), 3(응급),
          "reason": "판단 근거",
          "medicationChecked": true/false,
          "medicationTaken": true/false/null,
          "requestDetected": true(음악/영상/장소/일정/뉴스/날씨 요청있음)/false(없음),
          "playMusicKeyword": "노래제목 또는 null",
          "showVideoKeyword": "영상제목 또는 null",
          "searchPlaceKeyword": "장소명 또는 null",
          "searchNewsKeyword": "뉴스 키워드 또는 null",
          "searchWeatherKeyword": "지역명 또는 null",
          "scheduleData": {
            "title": "일정 제목 (예: 정형외과 방문)",
            "date": "YYYY-MM-DD (날짜 미상시 null)",
            "time": "HH:mm (시간 미상시 null)"
          } 또는 null
        }`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemInstruction,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0,
            }
        });

        const userContext = `현재 시각: ${dateString} ${timeString}
        호칭: ${userName}님
        
        [대화 내역]
        ${historyPrompt || "첫 대화 시작"}
        
        사용자 메시지: ${message}`;

        const resultResponse = await model.generateContent(userContext);
        const responseText = resultResponse.response.text();

        // 응답 텍스트 정제 (마크다운 코드 블록 제거 등)
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        const result = JSON.parse(cleanedText);
        const { reply, level, reason } = result;

        // 2. 대화 내용 저장
        await saveConversation(userId, message, "user");
        await saveConversation(userId, reply, "ai", {
            level,
            reason,
            medicationChecked: result.medicationChecked,
            medicationTaken: result.medicationTaken
        });

        // 3. 위험도 기반 비즈니스 로직 (에스컬레이션)
        if (level >= 2) {
            await handleEscalation(userId, level, reason, guardianContact);
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({
            reply: `아이구 ${userName || '바다'}님, 잠시 반디가 졸았나봐요. 다시 말씀해 주시겠어요?`,
            error: error.message,
            level: 1
        }, { status: 500 });
    }
}