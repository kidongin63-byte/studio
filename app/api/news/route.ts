import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
    }

    try {
        const apiKey = process.env.KAKAO_REST_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API 키가 구성되지 않았습니다." }, { status: 500 });
        }

        const response = await fetch(
            `https://dapi.kakao.com/v2/search/news?query=${encodeURIComponent(query)}&size=10`,
            {
                headers: {
                    Authorization: `KakaoAK ${apiKey}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.message || "카카오 뉴스 API 호출에 실패했습니다." }, { status: response.status });
        }

        const items = data.documents.map((doc: any) => {
            // Kakao News API는 언론사(press) 필드를 직접 제공하지 않을 때가 많습니다.
            // URL에서 도메인을 추출하여 출처로 표시하거나, 제목에 포함된 경우를 활용합니다.
            const urlObj = new URL(doc.url);
            const domain = urlObj.hostname.replace('www.', '');

            return {
                title: doc.title.replace(/<[^>]*>?/gm, ''), // HTML 태그 제거
                url: doc.url,
                source: doc.press || domain || "뉴스",
                datetime: doc.datetime
            };
        });

        return NextResponse.json({ items });
    } catch (error: any) {
        console.error("Kakao News API Error:", error);
        return NextResponse.json({ error: "뉴스 검색 중 오류가 발생했습니다." }, { status: 500 });
    }
}
