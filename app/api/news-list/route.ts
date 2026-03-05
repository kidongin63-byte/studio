import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    console.log(`[News API Hit] Query: ${query}`);

    if (!query) {
        return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
    }

    try {
        const apiKey = process.env.KAKAO_REST_API_KEY;

        if (!apiKey) {
            console.error("[News API Error] No API Key found in env.");
            return NextResponse.json({ error: "API 키가 구성되지 않았습니다." }, { status: 500 });
        }

        let items: any[] = [];

        // 6개 카테고리 정의
        const categories = ["정치", "경제", "사회", "문화", "스포츠", "사건사고"];

        if (query === "HOT_NEWS") {
            console.log("[News API] Fetching HOT_NEWS for 6 categories...");

            // 병렬로 각 카테고리별 최신 뉴스 1개씩 검색 (검색어 구체화)
            const requests = categories.map(cat =>
                fetch(
                    `https://dapi.kakao.com/v2/search/news?query=${encodeURIComponent("최신 " + cat + " 뉴스")}&size=1&sort=recency`,
                    {
                        headers: {
                            Authorization: `KakaoAK ${apiKey}`,
                            "Origin": "http://localhost:3000",
                            "Referer": "http://localhost:3000",
                        },
                    }
                ).then(res => res.ok ? res.json() : { documents: [] })
                    .catch(() => ({ documents: [] }))
            );

            const results = await Promise.all(requests);

            items = results.map((data, idx) => {
                const doc = data.documents[0];
                if (doc) {
                    let domain = "뉴스";
                    try {
                        const urlObj = new URL(doc.url);
                        domain = urlObj.hostname.replace('www.', '');
                    } catch (e) { }

                    return {
                        category: categories[idx],
                        title: `[${categories[idx]}] ${doc.title.replace(/<[^>]*>?/gm, '')}`,
                        url: doc.url,
                        source: doc.press || domain,
                        datetime: doc.datetime
                    };
                }
                return null;
            }).filter(item => item !== null);

            // 만약 검색 결과가 하나도 없다면 더 구체적인 Mock 데이터 제공
            if (items.length === 0) {
                const mockTitles: { [key: string]: string } = {
                    "정치": "국회 본회의 주요 법안 처리... 여야 협치 분수령 맞이하나",
                    "경제": "코스피 반등 성공하며 2,600선 회복... 반도체주 강세 흐름",
                    "사회": "봄철 맞이 전국 곳곳 지역 축제 풍성... 나들이 인파 북적",
                    "문화": "K-콘텐츠 글로벌 시장 점유율 확대... 새로운 문화 한류 열풍",
                    "스포츠": "대한민국 국가대표팀 평가전 승리로 마무리... 전술 완성도 높였다",
                    "사건사고": "환절기 건강 관리 주의보... 보건당국 개인 위생 수칙 준수 당부"
                };

                items = categories.map(cat => ({
                    category: cat,
                    title: mockTitles[cat] || cat + " 분야의 최신 소식입니다",
                    url: "https://search.daum.net",
                    source: "뉴스",
                    datetime: new Date().toISOString()
                }));
            }
        } else {
            // 기존 개별 키워드 검색 로직
            const cleanQuery = query.replace("최신 주요 ", "").replace(" 뉴스", "").trim() || "뉴스";
            console.log(`[News API Debug] Cleaned Query: ${cleanQuery}`);

            const resp = await fetch(
                `https://dapi.kakao.com/v2/search/news?query=${encodeURIComponent(cleanQuery)}&size=8&sort=recency`,
                {
                    headers: {
                        Authorization: `KakaoAK ${apiKey}`,
                        "Origin": "http://localhost:3000",
                        "Referer": "http://localhost:3000",
                    },
                }
            );

            if (resp.ok) {
                const data = await resp.json();
                items = data.documents.map((doc: any) => {
                    let domain = "뉴스";
                    try {
                        const urlObj = new URL(doc.url);
                        domain = urlObj.hostname.replace('www.', '');
                    } catch (e) { }

                    return {
                        title: doc.title.replace(/<[^>]*>?/gm, ''),
                        url: doc.url,
                        source: doc.press || domain,
                        datetime: doc.datetime
                    };
                });
            }
        }

        console.log(`[News API Success] Returning ${items.length} items for ${query}`);
        return NextResponse.json({ items });
    } catch (error: any) {
        console.error("[News API Critical Error]", error);
        return NextResponse.json({ items: [] });
    }
}
