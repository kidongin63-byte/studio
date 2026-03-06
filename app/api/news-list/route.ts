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

        if (query === "HOT_NEWS" || query === "INTL_HOT_NEWS") {
            const isIntl = query === "INTL_HOT_NEWS";
            console.log(`[News API] Fetching ${query} for 6 categories...`);

            // 병렬로 각 카테고리별 최신 뉴스 1개씩 검색 (국내/해외 구분)
            const requests = categories.map(cat => {
                const searchQuery = isIntl ? `국제 ${cat} 뉴스` : `최신 ${cat} 뉴스`;
                return fetch(
                    `https://dapi.kakao.com/v2/search/news?query=${encodeURIComponent(searchQuery)}&size=1&sort=recency`,
                    {
                        headers: {
                            Authorization: `KakaoAK ${apiKey}`,
                            "Origin": "http://localhost:3000",
                            "Referer": "http://localhost:3000",
                        },
                    }
                ).then(res => res.ok ? res.json() : { documents: [] })
                    .catch(() => ({ documents: [] }));
            });

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
                        type: isIntl ? 'intl' : 'domestic',
                        title: doc.title.replace(/<[^>]*>?/gm, ''),
                        url: doc.url,
                        source: doc.press || domain,
                        datetime: doc.datetime
                    };
                }
                return null;
            }).filter(item => item !== null);

            // 검색 결과가 없을 경우 Mock 데이터 제공
            if (items.length === 0) {
                const domesticMock: { [key: string]: string } = {
                    "정치": "국회 본회의 주요 법안 처리... 여야 협치 분수령 맞이하나",
                    "경제": "코스피 반등 성공하며 2,600선 회복... 반도체주 강세 흐름",
                    "사회": "봄철 맞이 전국 곳곳 지역 축제 풍성... 나들이 인파 북적",
                    "문화": "K-콘텐츠 글로벌 시장 점유율 확대... 새로운 문화 한류 열풍",
                    "스포츠": "대한민국 국가대표팀 평가전 승리로 마무리... 전술 완성도 높였다",
                    "사건사고": "환절기 건강 관리 주의보... 보건당국 개인 위생 수칙 준수 당부"
                };

                const intlMock: { [key: string]: string } = {
                    "정치": "글로벌 정상회담 개최... 국제 정세 변화와 외교적 해법 모색",
                    "경제": "뉴욕증시 주요 지수 혼조세... 기술주 실적 발표에 시장 이목 집중",
                    "사회": "기후 변화 대응을 위한 국제 사회 협력 가시화... 새로운 환경 정책 발표",
                    "문화": "세계적인 팝 스타 내한 공연 소식... 글로벌 문화 교류 활발",
                    "스포츠": "해외파 선수들 득점 소식... 유럽 리그 순위 경쟁 치열",
                    "사건사고": "지구촌 곳곳 이상 기후 현상 발생... 국제 구호 활동 이어져"
                };

                const mockTitles = isIntl ? intlMock : domesticMock;

                items = categories.map(cat => ({
                    category: cat,
                    type: isIntl ? 'intl' : 'domestic',
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
